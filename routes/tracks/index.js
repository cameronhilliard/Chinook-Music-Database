const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const Joi = require('joi');


const router = express.Router();
const db = Database(process.cwd() + '/database/chinook.sqlite');



const tracksSchema = Joi.object({
  Name: Joi.string().max(200).required(),
  MediaTypeId: Joi.number().integer().positive(),
  Milliseconds: Joi.number().integer().positive(),
  AlbumId: Joi.number().integer().positive(),
})

// SUPPORT TRACKS OPERATIONS

//Get all tracks
router.get('/:id', (req, res) => {
    console.log("test")
    const statement = db.prepare('SELECT * FROM tracks');
    const data = statement.all();
    res.json(data);
});



//1. Get Tracks by ID Endpoint
router.get('/', (req, res) => {

    const statement = db.prepare('SELECT * FROM tracks WHERE TrackId =?');
    const data = statement.get(req.params.id)

    if(data!== undefined) {
        res.json(data);
    } else {
        res.status(404).send();
    }
});

// 2. Get Media Types by ID Endpoint
router.get('/:id', (req, res) => {
    const statement = db.prepare('SELECT * FROM media_types;');
    const data = statement.all();
    res.json(data);
});

// 3. Add Tracks Endpoint
router.post('/', express.json(), (req, res) => {
    //validate
      const { error } = tracksSchema.validate(req.body, { abortEarly: false });
  
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
    
      const addTracks = `INSERT INTO tracks (${columns.join(', ')}) VALUES (${parameters.join(', ')});`
      console.log(addTracks);
      const statement = db.prepare(addTracks);
      const result = statement.run(values);
      console.log(result)
      res.status(201).json(result);
});

// 4. Delete Tracks Endpoint
router.delete('/:id', (req, res) => {
    const deleteTracks = `DELETE FROM tracks WHERE TrackId = ?;`
    const deleteStatement = db.prepare(deleteTracks);
    const deleteResult = deleteStatement.run([req.params.id])
  //Response if delete was successful
    if(deleteResult.changes > 0) {
    res.status(204).send();
    } else {
    res.status(404).json(deleteResult);
    }
});

// 5. Edit Tracks Endpoint
router.patch('/:id', (req, res) => {
    const { error } = tracksSchema.validate(req.body, { abortEarly: false });
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
    const statement = db.prepare(`UPDATE tracks SET ${columns.join(',')} WHERE TrackId = ?`);
    const result = statement.run(values);
    res.json(result);

    // make sure a record was indeed updated
    if (result.changes > 0) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
})



module.exports = router;