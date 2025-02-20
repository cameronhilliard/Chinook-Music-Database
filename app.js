const express = require('express');
const Database = require('better-sqlite3'); 
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const { emitWarning } = require('process');
// Uses better-sqlite3 to access the database. 
const db = Database('./database/chinook.sqlite');

console.log(db)

//Import any router modules 
const themesRouter = require('./routes/themes/');  // will look for index.js 
const artistsRouter = require('./routes/artists/');
const albumsRouter = require('./routes/albums/');
const tracksRouter = require('./routes/tracks/');
const mediatypesRouter = require('./routes/mediatypes/');

// creates an instance of an express app.
const app = express();

// insert a middleware to capture any body data in the request.
app.use(express.static('_FrontendStarterFiles'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/themes', themesRouter); 
app.use('/api/artists', artistsRouter); 
app.use('/api/albums', albumsRouter); 
app.use('/api/tracks', tracksRouter);
app.use('/api/mediatypes', mediatypesRouter);


// Listens on port 3000
app.listen(3000, () => { console.log('Listening on port 3000') });