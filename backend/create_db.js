const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root'
});

connection.query('CREATE DATABASE IF NOT EXISTS hostel_db;', (err, results) => {
  if (err) {
    console.error('Error creating database:', err);
  } else {
    console.log('Database hostel_db created successfully or already exists.');
  }
  connection.end();
});
