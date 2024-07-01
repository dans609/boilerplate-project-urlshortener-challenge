require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// stores all request url object on this array, just for challenge purposes, temporary needs,
// CAUTION: all stored data will be lost when the service/server is stopped/terminated. 
const tempUrlData = [];

// use middleware for passing data from one route to another route
const middleware = (req, res, next) => {
  next();
};

app.post('/api/shorturl', middleware, (req, res) => {
  const url = req.body.url;
  const shortenedUrl = tempUrlData.length + 1;

  const resUrl = {
    original_url: url,
    short_url: shortenedUrl
  };
  console.log(resUrl);

  // perform more actions to save data to an Array
  res.json(resUrl);
});

app.get('/api/shorturl/:shortenUrl', middleware, (req, res) => {
  const shortenUrl = req.params.shortenUrl;
  console.log(shortenUrl);

  // perform actions
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
