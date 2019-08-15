const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const consign = require('consign');
const cors = require('cors');

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cors({origin: '*'}));

consign()
    .include('./config/firebaseConfig.js')
    .then('./app/routes')
    .into(server)

module.exports = server;