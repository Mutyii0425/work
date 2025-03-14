import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt'; // Új könyvtár jelszó hash-eléshez

const app = express();
const PORT = 5000;

// Middleware for handling JSON data
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Important if using sessions
}));

// Database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'webshoppp',
  password: 'Premo900',
  database: 'webshoppp',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Successfully connected to the database!');
});

// Login endpoint with password comparison
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing data!' });
  }
  

  // Check if user exists in the database
  db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error during query:', err.message);
      return res.status(500).json({ error: 'Database error!' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'User not found!' });
    }

    const user = results[0];

    try {
      // Compare entered password with hashed password
      const isMatch = await bcrypt.compare(password, user.jelszo);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect password!' });
      }

      // If password is correct, send success message
      res.status(200).json({ message: 'Login successful!', user: { id: user.f_azonosito, email: user.email } });
    } catch (error) {
      console.error('Error during password comparison:', error.message);
      res.status(500).json({ error: 'Internal server error!' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
