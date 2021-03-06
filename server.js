const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Person = require('./models.js');

const port = process.env.PORT || 3000;

const server = express();

// error status code constants
const STATUS_SERVER_ERROR = 500;
const STATUS_USER_ERROR = 422;

server.use(bodyParser.json());

// Your API will be built out here.

mongoose.Promise = global.Promise;
const connect = mongoose.connect('mongodb://localhost/people', {
  useMongoClient: true
});
/* eslint no-console: 0 */
connect.then(
  () => {
    server.listen(port);
    console.log(`Server Listening on ${port}`);
  },
  err => {
    console.log('\n************************');
    console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
    console.log('************************\n');
  }
);

server.get('/users', (req, res) => {
  Person.find((err, users) => {
    if(err) {
      res
        .status(STATUS_SERVER_ERROR)
        .json({'Error retrieving users:': err});
    } else {
      res.status(200).json(users);
    }
  });
});

server.get('/users/:direction', (req, res) => {
  const { direction } = req.params; 
  Person.find({})
    .sort({'firstName': direction})
    .exec((err, sortedUsers) => {
      if(err) {
        res
          .status(STATUS_USER_ERROR)
          .json({'Error retrieving users:': err});
      } else {
        res.status(200).json(sortedUsers);
      }
    });
});

server.get('/user-get-friends/:id', (req, res) => {
  const { id } = req.params;
  if(id !== undefined) {
    Person.findById(id)
      .select('friends')
      .exec((err, friends) => {
        if(err) {
          res.status(STATUS_USER_ERROR).json({'could not find user with that id': err});
        } else {
          res.status(200).json(friends);
        }
      });
  }
});

server.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  if(id !== undefined) {
    Person.findByIdAndUpdate(id, {firstName, lastName}, {new: true})
      .exec((err, update) => {
        if(err) {
          res.status(STATUS_USER_ERROR).json({'could not update user with that id': err});
        } else {
          res.status(200).json(update);
        }
      });
  }
});
