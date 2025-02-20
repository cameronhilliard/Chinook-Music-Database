const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const Joi = require('joi');


const router = express.Router();
const db = Database(process.cwd() + '/database/chinook.sqlite');


// Validation Implementations

const albumsSchema = Joi.object({
  Title: Joi.string().max(160).required(),
  ReleaseYear: Joi.number().integer().positive(), 
  ArtistId: Joi.number().integer().positive(), 
})


// Validation Implementations



// SUPPORT ALBUM OPERATIONS 

//Retrieve Tracks from Album
router.get('/:id/tracks', (req, res) => {
    const statement = db.prepare(`SELECT * FROM tracks WHERE AlbumId = ?`);
    idData = statement.all(req.params.id);
    res.json(idData);
});

//1. Get Albums by ID Endpoint
router.get('/:id', (req, res) => {
    const statement = db.prepare('SELECT * FROM albums WHERE AlbumId =?');
    const data = statement.get(req.params.id)

    if(data!== undefined) {
        res.json(data);
    } else {
        res.status(404).send();
    }
});

// 2. Add Album Endpoint
router.post('/', express.json(), (req, res) => {
    //validate
      const { error } = albumsSchema.validate(req.body, { abortEarly: false });
  
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
    
      const addAlbums = `INSERT INTO albums (${columns.join(', ')}) VALUES (${parameters.join(', ')});`
      console.log(addAlbums);
      const statement = db.prepare(addAlbums);
      const result = statement.run(values);
      console.log(result)
      res.status(201).json(result);
});

// 3. Upload Album Art Endpoint
const storage = multer.diskStorage({
    destination: './_FrontendStarterFiles/albumart/',
    filename: function (req, file, callback) {
        callback(null, Date.now().toString() + path.extname(file.originalname));
    }

})

const upload = multer({storage: storage});


router.post('/:id/albumart', upload.single('albumart'), (req, res) => {
    console.log(req.file); 
    const statement = db.prepare('UPDATE albums SET AlbumArt = ? WHERE AlbumId = ?');
    const queryResult = statement.run([req.file.filename, req.params.id]);
    console.log("result", queryResult)
    res.json(queryResult);
});

// 4. Delete an Album Endpoint
router.delete('/:id', (req, res) => {
    const deleteAlbum = `DELETE FROM albums WHERE AlbumId = ?;`
    const deleteStatement = db.prepare(deleteAlbum);
    const deleteResult = deleteStatement.run([req.params.id])
  //Response if delete was successful
    if(deleteResult.changes > 0) {
    res.status(204).send();
    } else {
    res.status(404).json(deleteResult);
    }
});


// 5. Update Album Name Endpoint
router.patch('/:id', (req, res) => {
    const { error } = albumsSchema.validate(req.body, { abortEarly: false });
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
    const statement = db.prepare(`UPDATE albums SET ${columns.join(',')} WHERE AlbumId = ?`);
    const result = statement.run(values);
    res.json(result);

    // make sure a record was indeed updated
    if (result.changes > 0) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
})

// SUPPORT ALBUM OPERATIONS 
module.exports = router;