const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//returns hello on "homepage"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//if gets specified path, returns json string w urls in urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//tells us when we have a connection to local server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});