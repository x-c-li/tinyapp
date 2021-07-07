const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

//"installed it" in Express so it uses it
app.use(cookieParser())

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
//---ROUTES------------------------------------------------------------------------

//---LISTEN--------------------------------------------------------------------------------------
//tells us when we have a connection to local server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 

//--GET------------------------------------------------------------------------------

//returns hello on "homepage" if end-point is "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//if end-point is /urls, returns json string w urls in urlDatabase
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] 
  };
  res.render("urls_new", templateVars);
});

//new route to render infomation about urls
app.get("/urls/:shortURL", (req, res) => {//note :shortURL is a "general" path
  //Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] 
  };
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

//--POST-----------------------------------------------------------------------

//what to do when receives POST urls
//expects browser (client) to be giving info
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const tempKey = generateRandomString(); //assigning temporary key
  urlDatabase[tempKey] = req.body.longURL; //adding key-value pair to database
  res.redirect(`/urls/${tempKey}`); //redirecting client to shortUrl
});

//endpoint to handle the POST to /login 
app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');//redirects browser back to homepage 
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newlongURL;
  res.redirect('/urls');//redirects to homepage 
});

//route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//takes shortURL from browser assigns to var
  delete urlDatabase[shortURL];//deletes data based on the var 
  res.redirect('/urls');//redirects to homepage 
});

//route to clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');//redirects to homepage 
});


//---FUNCTIONS--------------------------------------------------------------------------------------

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