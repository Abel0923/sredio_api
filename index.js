require('dotenv').config()
require('./helpers/db')
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const router = require('./routers');
const { json, urlencoded } = require('body-parser')
const passport = require('./helpers/passport');


const app = express();

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true
}));

app.use(json())
app.use(urlencoded())
app.use(passport.initialize());
app.use(passport.session());
app.use("/api", router);


let port = process.env.PORT
app.listen(port, () =>{
    console.log(`API START AT PORT ${port} `)
})



