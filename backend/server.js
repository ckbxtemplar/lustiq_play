const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

// SQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'viktor',
  password: 'lplay@24',
  database: 'lustiq_play'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// WEBSOCKET
let wss;
let clients = {};
try {
  wss = new WebSocket.Server({ port: 8080 });
  console.log('WebSocket running on port 8080');
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
}
wss.on('connection', (ws, req) => {
  console.log('New client connected.');
  let userId = null;
  let messagesData = {};
  let toSessionToken = null;
  let fromSessionToken = null; 

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    messagesData = {};    
    // Amikor egy kliens bejelentkezik, tároljuk az SQL adatbázisban
    if (data.type === 'hello') {   

      userId = data.userId;     
      const query = `INSERT INTO user_sessions (user_id, is_connected) VALUES (?, ?) ON DUPLICATE KEY UPDATE is_connected = ?, last_connected = CURRENT_TIMESTAMP`;
      db.query(query, [userId, true, true], (err, results) => {
        if (err) {
          console.error('Failed to update user session:', err);
          return;
        }

        const selectQuery = `SELECT session_token FROM user_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1`;
        db.query(selectQuery, [userId], (err, results) => {
          if (err) {
            console.error('Failed to retrieve session token:', err);
            return;
          }      
          const sessionToken = results[0].session_token;
          
          // Tárolom a klienseket
          clients[sessionToken] = ws;

          // Üdvözlő üzenet küldése a kliensnek
          const welcomeMessage = {
            type: 'welcome',
            message: `Welcome, user ${userId}! ${sessionToken}`,
            sessionToken: sessionToken
          };
          ws.send(JSON.stringify(welcomeMessage)); 
        });
      });  

    } else if (data.type === 'join'){

      toSessionToken = data.toSessionToken;
      fromSessionToken = data.fromSessionToken;      
  
      // Ellenőrizzük, hogy van-e ilyen session_token-hez csatlakozott kliens
      if (toSessionToken && fromSessionToken && toSessionToken != fromSessionToken && clients[toSessionToken] && clients[fromSessionToken]) 
      {
        const targetClient = clients[toSessionToken];
        const fromClient = clients[fromSessionToken];
        
        const directions = {
          "request": { token: fromSessionToken, to: toSessionToken, client: targetClient },
          "accept": { token: toSessionToken, to: fromSessionToken, client: fromClient }
        };
        
        const queryPromises = Object.entries(directions).map(async ([key, item]) => {
          const userData = await getUserData(item.token);
          messagesData[item.to] = {
            type: 'join',
            message: `${userData.username} has joined the game!`,
            direction: key,
            joinedUser: { userId: userData.userId, userSession: item.token, username: userData.username, avatar: userData.avatar }
          };
        });
        
        Promise.all(queryPromises).then(() => {
          const query = `
            INSERT INTO rooms (accept, request, is_connected) 
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE 
                last_connected = CURRENT_TIMESTAMP,
                is_connected = 1`;
        
          db.query(query, [toSessionToken, fromSessionToken], (err, results) => {
            if (err) {
              console.error("Database error:", err);
              return;
            }
        
            const roomId = results.insertId || results[0]?.id;
        
            Object.values(messagesData).forEach(message => {
              message.room = roomId;
            });
        
            sendWsMessages(messagesData);
          });
        }).catch(error => {
          console.error("Error during getUserData operations:", error);
        });
      }
    } else if (data.type === 'startSurvey'){  
      toSessionToken = data.toSessionToken;
      fromSessionToken = data.fromSessionToken; 
      const startData = { type: 'startSurvey',  message: `start the survey`};
      messagesData[toSessionToken] = startData;
      messagesData[fromSessionToken] = startData;
      sendWsMessages(messagesData);
    } else if (data.type === 'readyToPlay'){
      toSessionToken = data.toSessionToken;   
      fromSessionToken = data.fromSessionToken;    
      const startData = { type: 'readyToPlay',  message: `ready to play (${fromSessionToken})`, fromSessionToken:fromSessionToken };
      messagesData[toSessionToken] = startData;
      sendWsMessages(messagesData);
    } else if (data.type === 'readyToNextQuestion'){
      toSessionToken = data.toSessionToken;   
      fromSessionToken = data.fromSessionToken;    
      const startData = { type: 'readyToNextQuestion',  message: `ready to the next question (${fromSessionToken})`, fromSessionToken:fromSessionToken };
      messagesData[toSessionToken] = startData;
      sendWsMessages(messagesData);
    }
    

  });

  // Amikor egy kliens megszakítja a kapcsolatot
  ws.on('close', () => {
    // Az adatbázisban jelezzük a kliens lecsatlakozását
    const query = `UPDATE user_sessions SET is_connected = ? WHERE user_id = ?`;
    db.query(query, [false, userId], (err, results) => {

      if (err) {
        console.error('Failed to update user session on disconnect:', err);
        return;
      }
      console.log(`User ${userId} disconnected.`);
    });
  });

});

function getUserData(userSession) {
  return new Promise((resolve, reject) => {
    const selectQuery = `SELECT u.id as id, u.email as email, u.username as username, i.image as avatar
    FROM users as u 
    LEFT JOIN user_sessions as s ON u.id = s.user_id 
    LEFT JOIN user_images as i ON u.id = i.user_id AND i.category = 'avatar'     
    WHERE s.session_token = ? ORDER BY s.id DESC LIMIT 1`;
    db.query(selectQuery, [userSession], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      const userData = results[0];
      resolve({
        userId: userData.id,
        userSession: userSession,
        username: userData.username,
        avatar: userData.avatar
      });
    });
  });
}

function getPartner(userSession) {
  return new Promise((resolve, reject) => {
    const selectQuery = `SELECT * FROM rooms as r WHERE accept = ? OR request = ? ORDER BY r.id DESC`;
    db.query(selectQuery, [userSession, userSession], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve(null); // Nincs találat, így visszaad null-t
        return;
      }

      const partnerData = results[0];
      let p = null;
      if (partnerData.accept === userSession) {
        p = partnerData.request;
      } else {
        p = partnerData.accept;
      }
      
      resolve(p);
    });
  });
}

function sendWsMessages(messagesData = {}) {
  Object.entries(messagesData).forEach(([key, item]) => {
    const wsClient = clients[key];

    if (wsClient && wsClient.readyState === WebSocket.OPEN)
    {
      wsClient.send(JSON.stringify(item));  
    }
  });    
}

async function handlePartnerData(userSession) {
  try {
    // Párhuzamosan futtatjuk a getPartner és a getUserData-t
    const partnerPromise = getPartner(userSession);
    const userDataPromise = getUserData(userSession);

    // Megvárjuk, hogy mindkettő befejeződjön
    const [partnerSession, userData] = await Promise.all([partnerPromise, userDataPromise]);

    if (partnerSession) {
      if (userData) {
        // Ha mindkét adat megvan, akkor elküldhetjük az üzenetet
        const messagesData = {
          [partnerSession]: {
            type: 'refreshJoinedPlayer',
            message: `Refresh user(${userData.username}) data!`,
            joinedUser: {
              userId: userData.userId,
              userSession: userSession,
              username: userData.username,
              avatar: userData.avatar
            }
          }
        };
        sendWsMessages(messagesData);
      } else {
        console.log('Nem sikerült lekérni a felhasználó adatait.');
      }
    } else {
      console.log('Nem található partner a megadott userSession-hez.');
    }
  } catch (error) {
    console.error('Hiba történt a partner vagy felhasználói adatok lekérdezésekor:', error);
  }
}

// EXPRESS
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Regisztráció (opcionális, hogy létrehozz egy felhasználót)
app.post('/register', (req, res) => {
  const { email, password, username } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const sql = `INSERT INTO users (email, password, username) VALUES (?, ?, ?)`;
  db.query(sql, [email, hashedPassword, username], (err, result) => {
    if (err) throw err;
    res.send('User registered!');
  });
});

// Bejelentkezés
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT users.id as id, users.password as password, users.email as email, users.username as username, user_images.image as avatar FROM users LEFT JOIN user_images ON users.id = user_images.user_id and user_images.category='avatar' WHERE email = ?`;
  db.query(sql, [email], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password [1]' });
    }

    const user = result[0];
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password [2]' });
    }
      
    // JWT token generálása  
    // const token = jwt.sign({ userId: user.id, email:user.email, username:user.username  }, 'yvhtR5}#O]w7lAs', { expiresIn: '7d' });   
    const token = { userId: user.id, email:user.email, username:user.username  }; 
    if (user.avatar) token.avatar = user.avatar;
    res.json({ message: 'Login successful', token });
  });
});

//UPLOAD 
const storage = multer.memoryStorage(); // Az adatokat memória tárolja
const upload = multer({ storage: storage });
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Ellenőrizzük, hogy a fájl tényleg létezik
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // A frontendről kapott további adatokat
    const category = req.body.category || 'avatar'; // Alapértelmezett category, ha nem lett megadva
    const userId = req.body.id_user; // Felhasználói azonosító
    const userSession = req.body.session_user; // Felhasználói session    

    // Sharp használata a kép átméretezésére 64x64-es méretre
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(64, 64)
      .toBuffer();

    // Base64 kódolás
    const base64Image = resizedImageBuffer.toString('base64');

    // Frissített SQL lekérdezés az upserthez
    const query = `INSERT INTO user_images (user_id, category, image) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE image = VALUES(image)`;

    db.query(query, [userId, category, base64Image], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ message: 'Error saving image to database' });      
      }
      if (userSession) handlePartnerData(userSession); // a partner számára elküldöm a user adatait 

      res.status(200).send({ message: 'Image uploaded and saved successfully', imageId: result.insertId, base64Image: base64Image });
    });
  } catch (error) {
    console.error('Error during image processing:', error);
    res.status(500).send({ message: 'Error processing image' });
  }
});

// Survey kérdések küldése
app.post('/getSurvey', (req, res) => {
  
  const sql = `SELECT q.id as id, q.title as title, q.description as description, qo.id as o_id, qo.title as o_title, qo.description as o_description, qo.score as o_score FROM questions as q LEFT JOIN question_options as qo ON q.id = qo.question_id where q.groups = 0;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("SQL query error:", err);
      return;
    }
  
    const formattedData = result.reduce((acc, row) => {
      const question = acc.find((q) => q.id === row.id);
      if (!question) {
        acc.push({
          id: row.id,
          title: row.title,
          description: row.description,
          type: "options",
          options: [
            {
              id: row.o_id,              
              title: row.o_title,
              description: row.o_description,
              score: row.o_score,
            },
          ],
        });
      } else {
        question.options.push({
          id: row.o_id,
          title: row.o_title,
          description: row.o_description,
          score: row.o_score,
        });
      }
      return acc;
    }, []);

    res.status(200).json({ message: 'Get survey questions success.', questions: formattedData });         

  });
});


const roomQuestions = {};
// Kérdések küldése
app.post('/getQuestions', (req, res) => {
  let level = 0;
  let sql = "";
  let finalQuestionIds = {};
  const { room } = req.body;  
  sql = `SELECT a.user_id,SUM(o.score) as score FROM lustiq_play.question_answers as a
    left join question_options as o ON a.answer = o.id
    where a.room_id = ? GROUP BY a.user_id
    ORDER BY SUM(o.score) ASC;`;
  db.query(sql, [room], (err, results) => {
    if (err) {
      console.error("SQL query error:", err);
      return;
    }
    if (!results || results.length === 0) {
      console.warn(`No results found for the query (getQuestions, room:${room}).`);
      return;
    }    
    const minScore = results[0].score;

    if (minScore < 11)  level = 1;
    else if( minScore < 21) level = 2;
    else level = 3;

    if (roomQuestions[room]) {      
      finalQuestionIds = roomQuestions[room];
    } else {
      let def_question_ids = [44, 45, 47];
      let question_ids = [];
      
      switch (level) {
        case 3:
          question_ids = [...question_ids, 74, 75, 76, 77, 79, 80];
        case 2:
          question_ids = [...question_ids, 62, 63, 65, 66, 67, 69, 70, 71, 72, 73];
        case 1:
          question_ids = [...question_ids, 48, 50, 52, 54, 56, 58, 60];
          break;
      }
      // Véletlenszerű 6 elem kiválasztása a question_ids tömbből
      function getRandomElements(array, count) {
        const shuffled = array.slice(); // Másolatot készítünk az eredeti tömbről
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1)); // Véletlen index
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Csere
        }
        return shuffled.slice(0, count); // Az első `count` elemet visszaadjuk
      }
      const selectedQuestions = getRandomElements(question_ids, 4);
      finalQuestionIds = [...selectedQuestions, ...def_question_ids];
      roomQuestions[room] = finalQuestionIds;
    }

    const placeholders = finalQuestionIds.map(() => '?').join(',');
    sql = `SELECT q.id as id, q.title as title, q.description as description, qo.id as o_id, qo.title as o_title, qo.description as o_description, q.type as type
      FROM questions as q 
      LEFT JOIN question_options as qo ON q.id = qo.question_id 
      where (q.id IN (${placeholders}) OR q.parent IN (${placeholders}));`;
    db.query(sql, [...finalQuestionIds, ...finalQuestionIds], (err, results) => {
      if (err) {
        console.error("SQL query error:", err);
        return;
      }
      if (!results || results.length === 0) {
        console.warn(`No results found for the query (getQuestions, room:${room}).`);
        return;
      } 

      const formattedData = results.reduce((acc, row) => {
        const question = acc.find((q) => q.id === row.id);
        
        const option = row.o_id ? { // Csak akkor hozunk létre opciót, ha az o_id létezik
          id: row.o_id,
          title: row.o_title,
          description: row.o_description,
        } : null;
      
        if (!question) {
          acc.push({
            id: row.id,
            title: row.title,
            description: row.description,
            type: row.type,
            options: option ? [option] : [], // Ha nincs opció, üres tömböt adunk
          });
        } else if (option) {
          question.options.push(option); // Csak érvényes opciót adunk hozzá
        }
      
        return acc;
      }, []);
  
      res.status(200).json({ message: 'Get questions success.', questions: formattedData, score: minScore, level: level });
    });        

  });
});

// Kérdések mentése
app.post('/saveAnswers', (req, res) => {
  const { answers, userId, room } = req.body;
  const query = `
  INSERT INTO question_answers (user_id, room_id, question_id, answer) 
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE answer = VALUES(answer);`;

  Object.keys(answers).forEach(key => {
    if (answers[key] !== "undefined")
    {
      db.query(query, [userId, room, key, answers[key]], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send({ message: 'Error saving image to database' });      
        }
      });        
    }
  });
  res.status(200).json({ message: 'The form was saved successfully.', data: answers });           
});

// Teszt API token validálással
app.get('/hello', (req, res) => {
  // const token = req.headers['authorization'];
  // if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // jwt.verify(token, 'yvhtR5}#O]w7lAs', (err, decoded) => {
  //   if (err) return res.status(401).json({ message: 'Invalid token' });
  //   res.send('Hello World');
  // });
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Express running on port 3000');
});
