const admin = require("firebase-admin");
require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.cert({
      "private_key" : process.env.PRIVATE_KEY,
      "project_id"  : process.env.PROJECT_ID,
      "client_email" : process.env.CLIENT_EMAIL
    }),
    databaseURL: "https://finder-88f51.firebaseio.com"
  });
  
var db = admin.firestore();

module.exports = db;