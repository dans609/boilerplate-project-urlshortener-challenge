require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const INVALID_URL_ERROR = 'Invalid URL';
const INVALID_SHURL_ERROR = 'No short URL found for the given input';
const INVALID_HOSTNAME = 'Invalid Hostname';

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false })); // used to parse request body or payload

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// stores all request url object into this array, just for challenge purposes, temporary needs,
// CAUTION: all stored data will be lost when the service/server is stopped/terminated. 
const tempUrlData = [];

// Regex for validating domain name
// this is just a simple validator, ain't work properly when facing with .co.us, co.uk, etc
const simpleDomainValidator = /\.[a-zA-Z0-9]{2,}(?:\.[a-zA-Z0-9]{2,})?/

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const shortenedUrl = tempUrlData.length + 1; // set array length as shorturl

  // check if the url contains 'https://' or 'http://'
  // if url does not meet the criteria, all logic goes to else statement
  // and will return with an invalid url error response to the user
  if(originalUrl.includes('https://') || originalUrl.includes('http://')) {
    const url = originalUrl.split('://')[1]; // split url from its http protocol, and get the url only

    // check if the url length is equal to 0 (zero) or url is undefined
    // will return with an invalid url error response if the condition is passed
    // and will continue if the condition is not passed
    if(url.length === 0 || url === undefined) {
      console.log('error in url');
      return res.json({error: INVALID_URL_ERROR});
    }

    // deconstruct url from its route, parameters, and etc,
    // and get the hostname only, which is located in the first element of a url string array
    const hostname = url.split('/')[0];

    // split hostname from its domain, and get the domain only which located at the last index of an array
    // check the domain IS NOT match with the regex expression (domain is not exist in the hostname)
    // will return with an invalid url error response if condition is passed
    // will continue if it's not passed (domain is exist in the hostname)
    const domain = hostname.split('.').at(-1);
    if(!simpleDomainValidator.test(`.${domain}`)) {
      console.log('error in domain')
      return res.json({error: INVALID_URL_ERROR});
    }

    // search related dns with the url hostname
    dns.lookup(hostname, (dnsError) => {
      // if the hostname doesn't exists in the dns
      // will return with invalid hostname response if an error occur
      if(dnsError) {
        console.log(dnsError);
        return res.json({error: INVALID_HOSTNAME});
      };

      // create response object
      const resUrl = {
        original_url: originalUrl,
        short_url: shortenedUrl
      };
    
      // save url data to an Array and send json object to the user
      tempUrlData.push({key: shortenedUrl.toString(), data: resUrl});
      res.json(resUrl);
    });
  } else {
    console.log('error in http protocol')
    return res.json({ error: INVALID_URL_ERROR});
  }
});

app.get('/api/shorturl/:shortenUrl', (req, res) => {
  const shortenUrl = req.params.shortenUrl;

  // get only first matches data with the request params
  const getOriginalUrl = tempUrlData.filter((element, i) => {
    return element.key === shortenUrl
  })[0];

  // [IF]: if there's data matches with the request params
  // will continue to the next step, which is send data as a response to the user,
  // [ELSE]: if the condition is not passed (data not exist)
  // will return with an invalid short url error response to the user
  if(getOriginalUrl !== undefined) {
    if(getOriginalUrl.data === undefined)
      return res.json({error: INVALID_SHURL_ERROR})

    // deconstruct the matches data and send it to the user
    const resUrl = {...getOriginalUrl.data};
    res.redirect(resUrl.original_url);
  } else return res.json({error: INVALID_SHURL_ERROR});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
