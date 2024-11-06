const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

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

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Amikor egy kliens bejelentkezik, tároljuk az SQL adatbázisban
    if (data.type === 'hello') {       
      userId = data.userId;     
      console.log(`User ${userId} connected.`);
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
      const fromUserId = data.fromUserId;
      const toSessionToken = data.toSessionToken;

      console.log('beérkező JOIN kérelem');
      console.log(fromUserId);      
      console.log(toSessionToken);            

      // Ellenőrizzük, hogy van-e ilyen session_token-hez csatlakozott kliens
      if (clients[toSessionToken]) {
        console.log('megtaláltuk a másik klienst');  
        // Ha megtaláltuk **B** játékost, küldjük neki az üzenetet
        const targetClient = clients[toSessionToken];
        targetClient.send(JSON.stringify({
          type: 'notification',
          message: `${fromUserId} has joined the game!`
        }));
      }            
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

  const sql = `SELECT * FROM users WHERE email = ?`;
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
    const token = jwt.sign({ userId: user.id, email:user.email, username:user.username  }, 'yvhtR5}#O]w7lAs', { expiresIn: '1h' });
   
    res.json({ message: 'Login successful', token });
  
  });
});

// Teszt API token validálással
app.get('/hello', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'yvhtR5}#O]w7lAs', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    res.send('Hello World');
  });
});

app.listen(3000, () => {
  console.log('Express running on port 3000');
});
