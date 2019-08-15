const express = require('express');
const server = require("./config/server");

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});