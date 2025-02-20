const express = require('express');
const Database = require('better-sqlite3');
const Joi = require('joi');

const router = express.Router();
const db = Database(process.cwd() + '/database/chinook.sqlite');


// Validation 
const artistsSchema = Joi.object({
  AlbumId: Joi.number().integer().positive(),
  Name: Joi.string().max(120).required(),
  
})


// SUPPORT ARTISTS OPERATIONS

// Get Album Data from Database.
router.get('/:id/albums', (req, res) => {
    const statement = db.prepare('SELECT * FROM albums WHERE ArtistId = ?');
    const idData = statement.all(req.params.id);
    console.log(idData)
    res.json(idData);
});


// 1. Gets All Artist from Database.
router.get('/', (req, res) => {
    console.log("test")
    const statement = db.prepare('SELECT * FROM artists');
    const data = statement.all();
    res.json(data);
});


// 2. Get Artists by ID Endpoint
router.get('/:id', (req, res) => {

    const statement = db.prepare('SELECT * FROM artists WHERE ArtistId =?');
    const data = statement.get(req.params.id)

    if(data!== undefined) {
        res.json(data);
    } else {
        res.status(404).send();
    }
});


// 3. Add New Artist Endpoint 
router.post('/', express.json(), (req, res) => {
    
    // validate
      const { error } = artistsSchema.validate(req.body, { abortEarly: false });
  
      if (error) {
        return res.status(422).send(error.details);
      }
  
      console.log(req.body);
      const columns = [];
      const parameters = [];
      const values = [];
   
      for(key in req.body) {
        parameters.push('?');
        columns.push(key);
        values.push(req.body[key]);
      };

      const addArtist = `INSERT INTO artists (${columns.join(', ')}) VALUES (${parameters.join(', ')});`
      console.log(addArtist);
      const statement = db.prepare(addArtist);
      const result = statement.run(values);
      console.log(result)
      res.status(201).json(result);
});


// 4. Update the Artist Endpoint
router.patch('/:id', (req, res) => {
    const { error } = artistsSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(422).send(error.details);
    }
    const columns = [];
    const values = [];

    for(key in req.body) {
      columns.push(`${key}=?`);
      values.push(req.body[key]);
    }
    //push the id into the array
    values.push(req.params.id)
    const statement = db.prepare(`UPDATE artists SET ${columns.join(',')} WHERE ArtistId = ?`);
    const result = statement.run(values);
    res.json(result);
})


// 5. Delete an Artist Endpoint
router.delete('/:id', (req, res) => {
    //execute the delete in the artists table
    const deleteArtist = `DELETE FROM artists WHERE ArtistId = ?;`
    const deleteStatement = db.prepare(deleteArtist)
    const deleteResult = deleteStatement.run([req.params.id])
    
    if(deleteResult.changes > 0) {
      res.status(204).send();  
      } else {
      res.status(404).json(deleteResult);
      }
    });

module.exports = router;