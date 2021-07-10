const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, userEmailChecker, urlsForUser } = require('./helper');

//for bcrypt
const salt = bcrypt.genSaltSync(10);
//use bcrypt to hash via: bcrypt.hashSync(password, salt)
//bcrypt.compareSync(password you want to check, password you're checking against (in data))

//"installed it" in Express so it uses it
app.use(cookieSession({
  name: 'session',
  keys: ["topsecretkey1", "topsecretkey2"]
}));

//tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//imported body-parser (middleware) to make data readable for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//--DATA OBJECTS---------------------------------------------------------------------

//object with urls in it
const urlDatabase = {};

const users = {};

//---ROUTES------------------------------------------------------------------------

//--GET------------------------------------------------------------------------------

//ASK FOR HELP
app.get("/", (req, res) => {
  if(!req.session.user_id) {
    res.redirect("/login")
  } else {
    res.redirect('/urls');
  }
});

/*
using middleware to check if the user is logged in
instead of doing an if statement for every single get request
*/
app.use('/', (req, res, next) => {//app.use works for EVERYTHING (get, post)
  const userID = req.session.user_id;
  const whiteList = ['/urls', '/login', '/register', '/logout'];
  if (users[userID]) { //check if we have userID (from cookie from registering) in our user database
    next(); //goes to next http request
  } else if (whiteList.includes(req.path) || req.path.startsWith('/u/')) {
    next();
  } else {
    res.redirect('/urls'); //if not, redirect to homepage
  }
});

//if end-point is /urls, returns json string w urls in urlDatabase
app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) { //check if cookie user.ID exists in user database (should)
    //loggedIn = checked object that exists
    let loggedIn = urlsForUser(users[req.session.user_id], urlDatabase);
    const templateVars = {
      urls: loggedIn,
      //below checks if ID exists then if it does it'll try to get the email
      user: users[req.session.user_id] && users[req.session.user_id].email
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      errorMessage: "ERROR! Please login or register to view content or use app.",
      user: null,
    };
    res.render("urls_error", templateVars);
  }
});

//allows header to be used and cookies to exist from header
app.get("/urls/new", (req, res) => {
  const templateVars = {
    //below checks if ID exists then if it does it'll try to get the email
    user: users[req.session.user_id] && users[req.session.user_id].email
  };
  res.render("urls_new", templateVars);
});

//reponds to login form template
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    password: req.body.password
  };
  res.render("urls_login", templateVars);
});

//allows header to be used and cookies to exist from header
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session.user_id
  };
  res.render("urls_register", templateVars);
});

//new route to render infomation about urls
app.get("/urls/:shortURL", (req, res) => {//note :shortURL is a "general" path
  //Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    //checks if ID exists then if it does it'll try to get the email
    user: urlsForUser(users[req.session.user_id], urlDatabase) && users[req.session.user_id].email
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
    res.status(403).send("Error 403: The short URL doesn't exist");
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
  if (users[req.session.user_id]) {
    const tempKey = generateRandomString(); //assigning temporary key
    urlDatabase[tempKey] = { // adding OBJECT to database
      longURL: req.body.longURL,
      userID: req.session.user_id};
    res.redirect(`/urls/${tempKey}`); //redirecting client to shortUrl
  } else {
    res.status(401).send("Error 401: User not found");
  }
});

//handling data we get from login page --checking if matches w data or not
app.post("/login", (req, res) => {
  const {password, email} = req.body;
  const checkedUser = userEmailChecker(email, users);
  if (checkedUser) { //checking input email w database emails
    if (bcrypt.compareSync(password, checkedUser.password)) { //checking input pswd w database pswds
      //if matches, get matching ID and make a cookie called user_id
      req.session.user_id = checkedUser.id;
      res.redirect('/urls');//redirects browser back to homepage
    } else {
      res.status(403).send("Error 403: Email was correct but password was not");
    }
  } else {
    res.status(401).send("Error 401: Email was not correct");
  }
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString(); //generates random ID for new users
  const existingUser = userEmailChecker(req.body.email, users);
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
    req.session.user_id = newUserID; //creating a cookie w new user's data
    res.redirect('/urls');//redirect back to homepage
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //saves url from page
  const url = urlDatabase[shortURL]; //database object
  if (url.userID === req.session.user_id) { //checks if ID is in database
    url.longURL = req.body.newlongURL; //editing the longURL w newlongURL input from ejs file
    res.redirect('/urls');//redirects to homepage
  } else {
    res.status(403).send("Error 403: The user ID doesn't match... sus..");
  }
});

//route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//takes shortURL from browser assigns to var
  if (urlDatabase[shortURL]) { //compare shortURL to shortURL in database
    //see if user ID from cookie matches one matching shortURL in users database
    if (urlsForUser(users[req.session.user_id], urlDatabase)) {
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
  req.session.user_id = null; //clears user_id cookie
  res.redirect('/urls');//redirects to homepage
});


//---LISTEN--------------------------------------------------------------------------------------
//tells us when we have a connection to local server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
