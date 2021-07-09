const assert = require('chai').assert;
const urlsForUser = require('../helper');

describe("#urlsForUser", () => {
  it("should return object within database", () => {
    const person = {id: "12345", fave: "sleeping"}
    const database = {
      potato: {userID: "12345"},
      chicken: {userID: "67891"}
    }
    assert.strictEqual(urlsForUser(person, database), {id: "12345", fave: "sleeping"});
  });

  it("does it return a match?", () => {
    const person = {id: "12345", fave: "sleeping"}
    const database = {
      potato: {userID: "12345"},
      chicken: {userID: "67891"}
    }
    assert.strictEqual(urlsForUser(person, database), {potato: {userID: "12345"}});
  });


  // const urlsForUser = function(inputID, database) {
  //   let match = {};
  //   for (const u in database) {
  //     if (database[u].userID === inputID.id) {
  //       match[u] = database[u];
  //       return match;
  //     }
  //   }
  //   return false;
  // };



});