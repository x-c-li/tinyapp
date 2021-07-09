const assert = require('chai').assert;
const { userEmailChecker } = require('../helper'); 

describe("#userEmailChecker", () => {
  it("should return object within database", () => {
    const email = "email@email.ca"
    const database = {
      p1: {
        name: "bob",
        email: "email@gmail.ca"
      },
      p2: {
        name: "notbob",
        email: "email@email.ca"
      }
    };
    let answer = {
        name: "notbob",
        email: "email@email.ca"
    }
    assert.deepEqual(userEmailChecker(email, database), answer);
  });

  it("if the emails don't match then it should return false", () => {
    const email = "xmail@email.ca"
    const database = {
      p1: {
        name: "bob",
        email: "email@gmail.ca"
      },
      p2: {
        name: "notbob",
        userID: "email@email.ca"
      }
    };
    assert.strictEqual(userEmailChecker(email, database), false);
  });

  it("if there is no email it should return false", () => {
    const email = ""
    const database = {
      p1: {
        name: "bob",
        email: "email@gmail.ca"
      },
      p2: {
        name: "notbob",
        userID: "email@email.ca"
      }
    };
    assert.strictEqual(userEmailChecker(email, database), false);
  });

  it("if the database has no emails then it should false", () => {
    const email = "email@gmail.ca"
    const database = {
      p1: {
        name: "bob",
        xmail: "email@gmail.ca"
      },
      p2: {
        name: "notbob",
        userID: "email@email.ca"
      }
    };
    assert.strictEqual(userEmailChecker(email, database), false);
  });

});