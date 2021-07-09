//---HELPER FUNCTIONS--------------------------------------------------------------------------------------

//generating a random string to use as our ID
//not going to bother to check this one.
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

//check if user email is in user object already
const userEmailChecker = function(email, database) {
  for (const u in database) {//database is the data object
    const user = database[u];
    if (user.email === email) {
      return user;//returns user object with email as key-pair value
    }
  }
  return false;
};

//returns user object with shortURL as key
const urlsForUser = function(inputID, database) {
  let match = {};
  for (const u in database) {
    if (database[u].userID === inputID.id) {
      match[u] = database[u];//assigns database object to match object
      return match;
    }
  }
  return false;
};

module.exports = {
  generateRandomString,
  userEmailChecker,
  urlsForUser
};