const admin = require("firebase-admin");

var serviceAccount = require("./firebaseKey.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://finder-88f51.firebaseio.com"
  });
  
var db = admin.firestore();

module.exports = db;