require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const bodyParser = require('body-parser');
const url = require('node:url');

// vars
var URLs = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// First API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.use("/api/shorturl", (req, res, next) => {
  console.log(req.body.url + ", " + URLs); // debug
  next();

});

app.post("/api/shorturl", (req, res) => {
  var isValidURL = (s) => {
    try {
      new URL(s);
      return true;
    } catch (err) {
      return false;
    }
  };

  if (isValidURL(req.body.url)) {
    if(URLs.indexOf(req.body.url) !== -1) { // if found in the array, just return the index
      res.json({original_url: req.body.url, short_url: URLs.indexOf(req.body.url)});
    } else { // if not found, insert it into the array and also return the index
      res.json({original_url: req.body.url, short_url: URLs.push(req.body.url) - 1});
    }
  } else {
    res.json({error: 'invalid url'});
  }

});

app.get("/api/shorturl/:short_url", (req, res) => {
  res.redirect(URLs[req.params.short_url]); // only if valid
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
