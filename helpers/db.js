'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME;

mongoose.connect(url,  { dbName }).then(() => console.log("Connected successful"))
  .catch((err) => console.log("Can not connect to the db! ", err))


mongoose.connection.on("error", err => {
  console.log(`${dbName} Connection Failed :(`, err)
})

mongoose.connection.on("connected", (err, res) => {
  console.log(`${dbName} is connected Successfully :)`)
})

