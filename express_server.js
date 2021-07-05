const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//object with urls in it 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//every one of the following is a "route"

//returns hello on "homepage" if end-point is "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//if end-point is /urls.json, returns json string w urls in urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  //note that res.json does the same thing as json.stringify
});

//shows that the response is allowed to be html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//tells us when we have a connection to local server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});