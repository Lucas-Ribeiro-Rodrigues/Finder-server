const express = require('express');
var admin = require("firebase-admin");
var serviceAccount = require("./config/firebaseKey.json");
const app = express();



// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://finder-88f51.firebaseio.com"
});

var db = admin.firestore();
var ref = db.collection("users").doc('alantu');
ref.set({
  alanisawesome: {
    date_of_birth: "June 23, 1912",
    full_name: "Alan Turing"
  }
});
app.listen(3000, () => {
    console.log(ref.get());
});

app.get('/', (req, res) => {
    res.send("get padrão");
})