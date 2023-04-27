"use strict"

const express = require("express")
const cors = require("cors")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Database connected");
})

// parse requests of json type
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Parse cookie in app
app.use(cookieParser())

// cross-origin request
var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200, //for lagacy browser support
    default: process.env.FRONTEND_BASE_URL,
    credentials: true
};
app.use(cors(corsOptions))

// app.use(morgan('combined'))

// register database model
require('./src/auth/models/auth')
require('./src/auth/models/passwordReset')
require('./src/auth/models/verificationCode')
require('./src/transactions/models')
require('./src/wallet/models/accountNumber')
require('./src/wallet/models/fund')

// routes
app.use('/api/v1/auth', require("./src/auth/routes/auth"));
app.use('/api/v1/transactions', require("./src/transactions/routes/"));
app.use('/api/v1/gladtidingsdata', require("./src/vtu/gladtidingsData/routes/"));
app.use('/api/v1/wallet', require("./src/wallet/routes/"));

// normalize port
const normalizePort = (val) => {
    let port = parseInt(val, 10)

    if (isNaN(port)) return val

    if (port >= 0) return port

    return false
}

// connect server
const PORT = normalizePort(process.env.PORT || "4000")
app.listen(PORT, (err) => {
    if (err) {
        console.log(err.message)
    }
    else {
        console.log(`Server Running on Port ${PORT}`)
    }
})
