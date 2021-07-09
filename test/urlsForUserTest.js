const assert = require('chai').assert;
const { urlsForUser } = require('../helper'); 
//object destructing

describe("#urlsForUser", () => {
  it("should return object within database", () => {
    const person = {id: "12345", fave: "sleeping"}
    const database = {
      potato: {userID: "12345"},
      chicken: {userID: "67891"}
    };
    const answer = {potato: {userID: "12345"}};
    assert.deepEqual(urlsForUser(person, database), answer);
  });

  it("if the ID's don't match then it should return false", () => {
    const person = {id: "7975456", fave: "sleeping"}
    const database = {
      potato: {userID: "12345"},
      chicken: {userID: "67891"}
    }
    assert.strictEqual(urlsForUser(person, database), false);
  });

});