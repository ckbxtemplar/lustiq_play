const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'viktor',
  password: 'lplay@24', // A MySQL adatbázis jelszava
  database: 'lustiq_play' // Adatbázis neve
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

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
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result[0];
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // JWT token generálása
    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  });
});

// Teszt API token validálással
app.get('/hello', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    res.send('Hello World');
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
