const { assert } = require('chai');

const { findUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
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
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return undefined if a email is not within the database', function() {
    const user = findUserByEmail("doesntexist@example.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  })
});

describe('urlsForUser', function() {
  it('should return a object of url specific to user based on user Id and compare if their URL is there', function() {
    const userURLs = urlsForUser("aJ48lW", urlDatabase)
    const expectedURLs = "https://www.tsn.ca"
    assert.equal(userURLs.b6UTxQ.longURL, expectedURLs);
  });
  it('should return undefined if a URl not bounded to the account is called for', function() {
    const userURLs = urlsForUser("aJ48lW", urlDatabase)
    const expectedURLs = undefined;
    assert.equal(userURLs["nonboundedURL"], expectedURLs);
  })
});