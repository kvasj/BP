const express = require('express');

const app = express();

app.use(express.static('public')).listen(8080);

// to start server write to terminal comand: node server.js