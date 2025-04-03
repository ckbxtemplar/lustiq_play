const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const multer = require('multer');
// const sharp = require('sharp');
const fs = require('fs');

// SQL
const db = mysql.createPool({
  connectionLimit: 50,
  host: 'localhost',
  user: 'viktor',
  password: '1st3nMegbassza01',
  database: 'lustiq_play',
  connectTimeout: 10000, // 10 másodperc
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL pool connection error:', err);
    return;
  }
  console.log('MySQL pool connected');
  connection.release();
});

// WEBSOCKET
let wss;
let clients = {};
let pendingMessages = {};

try {
  wss = new WebSocket.Server({ port: 8095 });
  console.log('WebSocket running on port 8095');
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
}

wss.on('connection', (ws, req) => {
  console.log('New client connected.');

  const interval = setInterval(() => {
    ws.ping();
  }, 30000);  // 30 másodpercenként

  ws.on('pong', () => {
    console.log('Pong válasz érkezett');
  });


  let userId = null;
  let messagesData = {};
  let toSessionToken = null;
  let fromSessionToken = null; 

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    messagesData = {};    

    if (data.type === 'hello') {   
      userId = data.userId;     
			console.log('hello - fogadas | userId: '+userId);				
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
          
          clients[sessionToken] = ws;

          const welcomeMessage = {
            type: 'welcome',
            message: `Welcome, user ${userId}! ${sessionToken}`,
            sessionToken: sessionToken
          };
					console.log(`hello - kuldes | userId: ${userId}, token: ${sessionToken}`);					
          ws.send(JSON.stringify(welcomeMessage)); // itt nem sendWsMessages mert még nincs címezhető kliens 

          if (pendingMessages[sessionToken] && pendingMessages[sessionToken].length > 0) {
            console.log(`Sending pending messages to ${sessionToken}`);
            pendingMessages[sessionToken].forEach(msg => ws.send(JSON.stringify(msg)));
            delete pendingMessages[sessionToken]; // Töröljük, ha már elküldtük
          }					
        });
      });  

    } else if (data.type === 'join'){
			console.log('join - fogadas');				

      toSessionToken = data.toSessionToken;
      fromSessionToken = data.fromSessionToken;      

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

					if (!userData) {
						console.error(`No user data found for token: ${item.token}`);
						return;
					}

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
			
							let roomId;
							if (results.insertId) {
									roomId = results.insertId;
							} else {
									const selectQuery = `SELECT id FROM rooms WHERE (accept = ? AND request = ?) OR (accept = ? AND request = ?)`;
									db.query(selectQuery, [toSessionToken, fromSessionToken, fromSessionToken, toSessionToken], (err, rows) => {
											if (err) {
													console.error("Database select error:", err);
													return;
											}
			
											roomId = rows.length > 0 ? rows[0].id : undefined;
			
											Object.values(messagesData).forEach(message => {
													message.room = roomId;
											});
											console.log('join - kuldes 1');
											sendWsMessages(messagesData);
									});
									return;
							}
			
							Object.values(messagesData).forEach(message => {
									message.room = roomId;
							});
							console.log('join - kuldes 2');
							sendWsMessages(messagesData);
					});
				}).catch(error => {
						console.error("Error while fetching user data:", error);
				});				
      }
			
    } 
		else if (data.type === 'startSurvey')
		{  
			console.log('startSurvey - fogadas');				
      toSessionToken = data.toSessionToken;
      fromSessionToken = data.fromSessionToken; 
      const startData = { type: 'startSurvey',  message: `start the survey`};
      messagesData[toSessionToken] = startData;
      messagesData[fromSessionToken] = startData;
      sendWsMessages(messagesData);
    } 
		else if (data.type === 'readyToPlay')
		{
			console.log('readyToPlay - fogadas');				
      toSessionToken = data.toSessionToken;   
      fromSessionToken = data.fromSessionToken;    
      const startData = { type: 'readyToPlay',  message: `ready to play (${fromSessionToken})`, fromSessionToken:fromSessionToken };
      messagesData[toSessionToken] = startData;
      sendWsMessages(messagesData);
    } 
		else if (data.type === 'readyToNextQuestion')
		{
			console.log('readyToNextQuestion - fogadas');			
      toSessionToken = data.toSessionToken;   
      fromSessionToken = data.fromSessionToken;    
      const startData = { type: 'readyToNextQuestion',  message: `ready to the next question (${fromSessionToken})`, fromSessionToken:fromSessionToken };
      messagesData[toSessionToken] = startData;
      sendWsMessages(messagesData);
    }    

  });

  // Amikor egy kliens megszakítja a kapcsolatot
  ws.on('close', () => {    
		console.log('on(close) - fogadas');		
		clearInterval(interval);
    const query = `UPDATE user_sessions SET is_connected = ? WHERE user_id = ?`;
    db.query(query, [0, userId], (err, results) => {

      if (err) {
        console.error('Failed to update user session on disconnect:', err);
        return;
      }
      console.log(`User ${userId} disconnected.`);
    });
  });

});

function sendWsMessages(messagesData = {}) {
  Object.entries(messagesData).forEach(([key, item]) => {
    const wsClient = clients[key];

    if (wsClient && wsClient.readyState === WebSocket.OPEN)
    {
			console.log('kikuldes:');
			console.log(item);
      wsClient.send(JSON.stringify(item));  
    } 
		else 
		{
			console.log('kuldes - NEM KULDI KI');
      console.log(`Üzenet elmentve (nincs aktív kapcsolat): ${key}`);
      if (!pendingMessages[key]) {
        pendingMessages[key] = [];
      }
      pendingMessages[key].push(item); // Elmentjük a függőben lévő üzenetek közé			
		}
  });    
}

async function getUserData(userSession) {
	try {
			const selectQuery = `SELECT u.id as id, u.email, u.username, i.image as avatar FROM users u LEFT JOIN user_sessions s ON u.id = s.user_id LEFT JOIN user_images i ON u.id = i.user_id AND i.category = 'avatar' WHERE s.session_token = ? ORDER BY s.id DESC LIMIT 1`;

			const [results] = await db.promise().query(selectQuery, [userSession]);
			if (results.length === 0) return null;

			return {
					userId: results[0].id,
					userSession: userSession,
					username: results[0].username,
					avatar: results[0].avatar
			};
	} catch (err) {
			console.error('Error fetching user data:', err);
			return null;
	}
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
        resolve(null);
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

async function handlePartnerData(userSession) {
  try {
    const partnerPromise = getPartner(userSession);
    const userDataPromise = getUserData(userSession);

    const [partnerSession, userData] = await Promise.all([partnerPromise, userDataPromise]);

    if (partnerSession) {
      if (userData) {
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
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
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

    // // Sharp használata a kép átméretezésére 64x64-es méretre
    // const resizedImageBuffer = await sharp(req.file.buffer)
    //   .resize(64, 64)
    //   .toBuffer();

    // // Base64 kódolás
    // const base64Image = resizedImageBuffer.toString('base64');

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

    if (minScore < 6)  level = 1;
    else level = 2;

    if (roomQuestions[room]) {      
      finalQuestionIds = roomQuestions[room];
    } else {
      let def_question_ids = [44, 45, 47];
      let question_ids = [];
      
      switch (level) {
        case 2:
          question_ids = [...question_ids, 65, 66, 67, 69, 70, 71, 72, 73, 74, 75 ,76, 77, 78, 79, 80, 81]; 
        case 1:
          question_ids = [...question_ids, 48, 49, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 61, 62, 63, 64];
          break;
      }

      function getRandomElements(array, count) {
        const shuffled = array.slice(); // Másolatot készítünk az eredeti tömbről
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1)); // Véletlen index
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Csere
        }
        return shuffled.slice(0, count); // Az első `count` elemet visszaadjuk
      }
      const selectedQuestions = getRandomElements(question_ids, 7);
      finalQuestionIds = [...selectedQuestions, ...def_question_ids];
      roomQuestions[room] = finalQuestionIds;
    }

    const placeholders = finalQuestionIds.map(() => '?').join(',');
    sql = `SELECT q.id as id, q.title as title, q.description as description, qo.id as o_id, qo.title as o_title, qo.description as o_description, q.type as type
      FROM questions as q 
      LEFT JOIN question_options as qo ON q.id = qo.question_id 
      where q.type = 'talk' AND q.id IN (${placeholders})
			ORDER BY ID ASC
      LIMIT 10;`;
    db.query(sql, [...finalQuestionIds], (err, results) => {
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
  res.send('Belépés és átirányítás...');
});

app.listen(8090, () => {
  console.log('Express running on port 8090');
});
