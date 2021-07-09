const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

//for bcrypt
const salt = bcrypt.genSaltSync(10); 
//use bcrypt to hash via: bcrypt.hashSync(password, salt)
//bcrypt.compareSync(password you want to check, password you're checking against (in data))

//"installed it" in Express so it uses it
app.use(cookieParser());

//tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//imported body-parser (middleware) to make data readable for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//--OBJECTS---------------------------------------------------------------------
//object with urls in it
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("12345", salt)
  }
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

/* 
using middleware to check if the user is logged in
instead of doing an if statement for every single get request
*/
app.use('/', (req, res, next) => {//app.use works for EVERYTHING (get, post)
  const userID = req.cookies.user_id; 
  const whiteList = ['/urls', '/login', '/register', '/logout'];
  // console.log(req.path);
  // console.log(typeof req.path);
  if (users[userID]) { //check if we have userID (from cookie from registering) in our user database
    // console.log("the user does exist")
    next(); //goes to next http request
  } else if (whiteList.includes(req.path) || req.path.startsWith('/u/')) {
    // console.log("the path is in the whitelist OR the path includes /u/")
    next(); 
  } else {
    // console.log("user didn't exist, whitelist didn't include, path didn't have /u/")
    res.redirect('/urls'); //if not, redirect to prompt 
  }
});

//if end-point is /urls, returns json string w urls in urlDatabase
app.get("/urls", (req, res) => {
  if (users[req.cookies.user_id]) { //check if cookie user.ID exists in user database (should)
    let loggedIn = urlsforUser(users[req.cookies.user_id]); //loggedIn = checked object that exists
    // console.log(loggedIn);
    const templateVars = {
      urls: loggedIn,
      user: users[req.cookies.user_id] && users[req.cookies.user_id].email //check if ID exists then if it does it'll try to get the email    
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      errorMessage: "THIS ID DOESN'T EXIST IN THE USER DATABASE YOU FIEND",
      user: null,
    };
    res.render("urls_error", templateVars);  
  }
});

//allows header to be used and cookies to exist from header
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] && users[req.cookies.user_id].email //check if ID exists then if it does it'll try to get the email
  };
  res.render("urls_new", templateVars); 
});

//reponds to login form template
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id,
    password: req.body.password
  };
  res.render("urls_login", templateVars);
});

//allows header to be used and cookies to exist from header
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id
  };
  res.render("urls_register", templateVars);
});

//new route to render infomation about urls
app.get("/urls/:shortURL", (req, res) => {//note :shortURL is a "general" path
  //Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: urlsforUser(users[req.cookies.user_id]) && users[req.cookies.user_id].email //check if ID exists then if it does it'll try to get the email
  };
  res.render("urls_show", templateVars);
});

//taking short url into browser to go to redirect page w viable link
//no new data; just asking for data that we already have
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //taking shortURL from browser
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(301, longURL.longURL);
  } else {
    res.render("Error 403: The short URL doesn't exist");
  }
});

//shows that the response is allowed to be html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//--POST--(never to render here stuff)---------------------------------------------------------------------

//what to do when receives POST urls
//expects browser (client) to be giving info
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const tempKey = generateRandomString(); //assigning temporary key
  urlDatabase[tempKey] = { // adding OBJECT to database
    longURL: req.body.longURL,
    userID: req.cookies.user_id};
  res.redirect(`/urls/${tempKey}`); //redirecting client to shortUrl
});

//handling data we get from login page --checking if matches w data or not
app.post("/login", (req, res) => {
  if (userEmailChecker(req.body.email)) { //checking input email w database emails
    if (passwordChecker(req.body.password)) { //checking input pswd w database pswds
      //if matches, get matching ID and make a cookie called user_id
      res.cookie('user_id', getUserID(req.body.email, req.body.password));
      res.redirect('/urls');//redirects browser back to homepage
    } else {
      res.status(403).send("Email was correct but password was not");
    }
  } else {
    res.status(403).send("Email was not correct");
  }
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString(); //generates random ID for new users
  const existingUser = userEmailChecker(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Error 400: You left the email and or password blank");
  } else if (existingUser) {
    res.status(400).send("Error 400: Email already exists");
  } else {
    users[newUserID] = { //setting info from register into an object
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    console.log(users);
    res.cookie('user_id', newUserID); //creating a cookie w new user's data
    res.redirect('/urls');//redirect back to homepage
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //saves url from page
  const url = urlDatabase[shortURL]; //database object 
  if (url.userID === req.cookies.user_id) { //checks if ID is in database 
    url.longURL = req.body.newlongURL; //THE EDITING MAGIC
    res.redirect('/urls');//redirects to homepage
  } else {
    res.send("ERROR: The user ID doesn't match... sus..");
  }
});

//route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//takes shortURL from browser assigns to var
  if (urlDatabase[shortURL]) { //compare shortURL to shortURL in database
    if (urlsforUser(users[req.cookies.user_id])) { //see if user ID from cookie matches one matching shortURL in users database
      delete urlDatabase[shortURL];//deletes data based on the var
      res.redirect('/urls');//redirects to homepage
    } else {
      res.status(403).send("ERROR: The user ID doesn't match... sus..");
    }
  } else {
    res.status(403).send("ERROR: The shortURL doesn't match...");
  }
});

//route to clear cookie
app.post("/logout", (req, res) => {
  // console.log("hitting logout");
  res.clearCookie('user_id');
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
  for (const u in users) {//users is the data object
    const user = users[u];
    if (user.email === email) {
      // console.log(`${email}-----------`, user);
      return user;
    }
  }
  return false;
};

const passwordChecker = function(password) {//checks password against data
  for (const u in users) {
    if (users[u].password === password) {
      return true;
    }
  }
  return false;
};

const getUserID = function(email, password) {//to return checked ID for password & email
  let existingUserID = "";
  for (const u in users) {
    if (users[u].email === email && users[u].password === password) {
      existingUserID = users[u].id;
    }
  }
  return existingUserID;
};

const urlsforUser = function(inputID) {
  let match = {};
  for (const u in urlDatabase) {
    // console.log("inputID.id", inputID.id)
    // console.log("userID from database", urlDatabase[u].userID)
    if (urlDatabase[u].userID === inputID.id) {
      // console.log("urldatabase[u]", urlDatabase[u])
      // console.log("urldatabase", urlDatabase)
      match[u] = urlDatabase[u];
      return match;
    }
  }
  return false;
};
