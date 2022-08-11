require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.set('view engine', 'ejs');
const dns = require('node:dns');
const url = require('node:url');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// db
mongoose.connect(process.env.MONGO_URI);
const shortenerSchema = new mongoose.Schema({
  URL: String,
  ref: Number
});
const Shortener = new mongoose.model('Shortener', shortenerSchema);

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

app.post("/api/shorturl", (req, res) => {
  var parsedURL = url.parse(req.body.url);
  dns.lookup(parsedURL.hostname, (err, addr, family) => {
    if (addr === null) {
      res.json({error: 'Invalid URL. Make sure the protocol is included in the URL.'});
      return console.error(err);
    }

    Shortener.findOne({URL: parsedURL.href}, 'URL ref', (err, query) => {
      if (err) return console.error(err);
      if (query === null) {
        Shortener.count({}, (err, count) => {
          if (err) return console.error(err);
          let newURL = new Shortener({
            URL: parsedURL.href,
            ref: count + 1
          });
          newURL.save();
          res.render(process.cwd() + '/views/result', {newResult: req.protocol + '://' + req.get('host') + '/api/shorturl/' + newURL.ref});
        });
      } else {
        res.render(process.cwd() + '/views/result', {newResult: req.protocol + '://' + req.get('host') + '/api/shorturl/' + query.ref});
      }
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  Shortener.findOne({ref: req.params.short_url}, 'URL ref', (err, query) => {
    if (err) return console.error(err);
    res.redirect(query.URL);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
