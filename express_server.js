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


//--OBJECTS---------------------------------------------------------------------
//object with urls in it
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
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
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//allows header to be used and cookies to exist from header
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//allows header to be used and cookies to exist from header
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

//new route to render infomation about urls
app.get("/urls/:shortURL", (req, res) => {//note :shortURL is a "general" path
  //Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
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
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');//redirects browser back to homepage 
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString(); //generates random ID for new users 
  const newUser = { //setting info from register into an object
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  users[newUserID] = newUser; //adding to new user object to user database 
  res.cookie('user_id', users[newUserID].id); //creating a cookie w new user's data
  console.log(users); //to show myself if the new ID is added to the object
  if(!newUser.email || !newUser.password) {
    res.status(400).send("Error 400: You left the email and or password blank");
  } else if () {

  } else {
    res.redirect('/urls')//redirect back to homepage
  }
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

const userEmailChecker = function(email) {//check if user email is in user object already
  for (const u of users) {//users is the data object
    if (email === u.email) {
      return true;
    }
  }
  return false;
};