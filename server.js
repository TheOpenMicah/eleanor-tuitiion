const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
app.use(express.static(path.join(__dirname)));
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./responses.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parentName TEXT,
      childAge INTEGER,
      tuitionReason TEXT,
      needs TEXT,
      otherNeeds TEXT,
      contactMethod TEXT,
      phoneNumber TEXT,
      emailAddress TEXT,
      otherContact TEXT,
      actioned INTEGER DEFAULT 0,
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Connected to SQLite database.');
  }
});

// API to submit a new response
app.post('/api/submit', (req, res) => {
  const {
    parentName, childAge, tuitionReason, needs, otherNeeds, contactMethod, phoneNumber, emailAddress, otherContact
  } = req.body;
  db.run(
    `INSERT INTO responses (parentName, childAge, tuitionReason, needs, otherNeeds, contactMethod, phoneNumber, emailAddress, otherContact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [parentName, childAge, tuitionReason, needs, otherNeeds, contactMethod, phoneNumber, emailAddress, otherContact],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    }
  );
});

// API to get all responses
app.get('/api/responses', (req, res) => {
  db.all('SELECT * FROM responses', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API to mark a response as actioned
app.post('/api/actioned/:id', (req, res) => {
  const id = req.params.id;
  db.run('UPDATE responses SET actioned = 1 WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
