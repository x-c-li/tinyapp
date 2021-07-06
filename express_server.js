const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//imported body-parser (middleware) to make data readable for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

//if end-point is /urls, returns json string w urls in urlDatabase
app.get("/urls", (req, res) => {
  //using template
  const templateUrls = { urls: urlDatabase };
  res.render("urls_index", templateUrls);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//new route to render infomation about urls
app.get("/urls/:shortURL", (req, res) => {
  //Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


//taking short url into browser to go to redirect page w viable link
//no new data; just asking for data that we already have
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //taking shortURL from browser
  const longURL = urlDatabase[shortURL];
  res.redirect(301, longURL);
});

//shows that the response is allowed to be html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//what to do when receives POST urls
//expects browser (client) to be giving info
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const tempKey = generateRandomString(); //assigning temporary key
  urlDatabase[tempKey] = req.body.longURL; //adding key-value pair to database
  res.redirect(`/urls/${tempKey}`); //redirecting client to shortUrl
});

//route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//takes shortURL from browser assigns to var
  delete urlDatabase[shortURL];//deletes data based on the var 
  res.redirect('/urls');//redirects to homepage 
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newlongURL;
  res.redirect('/urls');//redirects to homepage 
});

//tells us when we have a connection to local server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 7; i++) {
    if ((Math.random() * 10) <= 5) {
      randomString += alphabet[Math.floor(Math.random() * alphabet.length)];
    } else {
      randomString += Math.floor(Math.random() * 10);
    }
  }
  return randomString;
};
