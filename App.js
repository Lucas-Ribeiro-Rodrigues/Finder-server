const express   = require('express');
const server    = require("./config/server");
const port      = process.env.PORT || 3000;
const host      = '0.0.0.0';

server.listen(port, host, () => {
    console.log(`Server listening on port ${port}, at host ${host}`);
});
