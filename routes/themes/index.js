const express = require('express');
const Database = require('better-sqlite3');

const router = express.Router();
const db = Database(process.cwd() + '/database/chinook.sqlite');

router.get('/', (req, res) => {
    const statement = db.prepare('SELECT * FROM themes')
    const data = statement.all();
    res.json(data);
});

module.exports = router;