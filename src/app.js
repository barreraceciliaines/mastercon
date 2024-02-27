const express = require('express');
const app = express ();
const path = require ('path');
const morgan = require ('morgan');
const bodyParse = require ("body-parser");



// Settings
app.set('port', 3455);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json());




// Routes
app.use(require('./routes/index'));


// Static
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler
app.use((req, res, next) => {
    res.status(404).send('404 Not found');
});


module.exports = app;