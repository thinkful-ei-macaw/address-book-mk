require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { uuid } = require('uuidv4');
const { NODE_ENV, API_TOKEN } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// set up middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());


// all the data
const ADDRESSES = [];


// request handling
// GET /address endpoint
app.get('/address', (req, res) => {
  return res.status(200).json(ADDRESSES.filter(address => !address.deleted));
});


// POST /address endpoint
app.post('/address', validateBearerToken, (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;

  // set up and check for all required fields
  const requiredFields = ['firstName', 'lastName', 'address1', 'city', 'state', 'zip'];
  requiredFields.forEach(field => {
    if (!req.body[field]) {
      return res.status(400).send(`${field} is required`);
    }
  });

  // set up and check for all length-requirement fields
  const lengths = { state: 2, zip: 5 };
  Object.keys(lengths).forEach(field => {
    if (req.body[field].length !== lengths[field]) {
      return res.status(400).send(`${field} must be a string of length ${lengths[field]}`);
    }
  });

  // create the object and add it to our store
  const address = { 
    id: uuid(),
    firstName, lastName, address1, address2, city, state, zip
  };
  ADDRESSES.push(address);

  return res.status(201).json(address);

});


// DELETE /address/:id endpoint
app.delete('/address/:id', validateBearerToken, (req, res) => {
  const { id } = req.params;
  const index = ADDRESSES.findIndex(address => address.id === id);

  if (index === -1){
    return res.status(404).send('Address not found');
  }

  ADDRESSES[index].deleted = true;

  return res.status(204).end();

});


// bearer token authorization
function validateBearerToken(req, res, next) {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return res.status(400).send('No Authorization header was present in the request');
  }

  if (!authHeader.toLowerCase().includes('bearer ')) {
    return res.status(400).send('Must use Bearer token strategy');
  }

  const authToken = authHeader.split(' ')[1];
  if (authToken !== API_TOKEN) {
    return res.status(401).send('Unauthorized token provided');
  }

  next();

}


// error handling
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'Server error' } };
  } else {
    response = { message: error.message, error };
  }

  return res.status(500).json(response);
};

app.use(errorHandler);


// the bottom line, literally
module.exports = app;