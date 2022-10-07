const express = require("express");
const cookieSession = require('cookie-session');
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['secret'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


//Homepage: Directs to login page if not logged in or to URL page if logged in
app.get("/", (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//Url Index Page: Shows all of the long and short URL and delete button
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlsForUser(req.session.user_id, urlDatabase), userInfo: users[req.session.user_id]};
  if (!req.session.user_id) {
    return res.status(401).render("login_error",templateVars);
  }
  res.render("urls_index", templateVars);
});
//New URL page: Input new url to add to the database
app.get("/urls/new", (req, res) => {
  const templateVars = {userInfo: users[req.session.user_id]};
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});
//Directs to register page
app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});
//Directs to login page
app.get("/login", (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//Specific URL page
app.get("/urls/:id", (req, res) => {
  const specificURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Cannot access: Id does not exist");
  }
  if (!req.session.user_id) {
    return res.status(401).send("Cannot access: Not logged in currently");
  }
  if (!specificURL[req.params.id]) {
    return res.status(401).send("Cannot access: Specific URL link is not bounded to this user Id");
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], userInfo: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});
//URL Json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Clicking on this link directs to the actual website the URL is linked to
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).send("Cannot access: This URL code does not exist in database");
  }
  res.redirect(longURL['longURL']);
});
//Creates new URL and short code for it
app.post("/urls", (req, res) => {
  const siteID = generateRandomString();
  if (!req.session.user_id) {
    return res.status(401).send("You cannot shorten a URL link because you are not logged in");
  }
  if (!urlDatabase[siteID]) {
    urlDatabase[siteID] = {};
  }
  urlDatabase[siteID].longURL = req.body.longURL;
  urlDatabase[siteID].userID = req.session.user_id;
  res.redirect(`/urls/${siteID}`);
});
//Once edited, update the long URL
app.post("/urls/:id", (req, res) => {
  const specificURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Cannot edit Id:Id does not exist");
  }
  if (!req.session.user_id) {
    return res.status(401).send("Cannot edit: Not logged in currently");
  }
  if (!specificURL[req.params.id]) {
    return res.status(401).send("Unauthorized to edit: This URL doesn't belong to this account");
  }
  urlDatabase[req.params.id].longURL = req.body.editURL;
  res.redirect(`/urls/${req.params.id}`);
});
//Delete requested URL once the delete button is clicked
app.post("/urls/:id/delete", (req, res) => {
  const specificURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Cannot delete Id:Id does not exist");
  }
  if (!req.session.user_id) {
    return res.status(401).send("Cannot delete: Not logged in currently");
  }
  if (!specificURL[req.params.id]) {
    return res.status(401).send("Unauthorized to delete: This URL doesn't belong to this account");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//Delete page
app.get("/urls/:id/delete", (req, res) => {
  const specificURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Cannot delete Id:Id does not exist");
  }
  if (!req.session.user_id) {
    return res.status(401).send("Cannot delete: Not logged in currently");
  }
  if (!specificURL[req.params.id]) {
    return res.status(401).send("Cannot delete: Unauthorized to delete as you are not the owner of this url link");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//Put register info into database
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const currentUser = findUserByEmail(req.body.email, users);
  let userObj = {};
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Cannot have empty email/password input");
  }
  if (currentUser) {
    return res.status(400).send('Cannot register: Email already in use');
  }
  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = bcrypt.hashSync(req.body.password, 10);
  users[userID] = userObj;
  req.session.user_id = userID;
  res.redirect('/urls');
});
//Login Button logs you in and redirect back to URL page
app.post("/login", (req, res) => {
  const currentUser = findUserByEmail(req.body.email, users);
  if (!currentUser) {
    return res.status(403).send("Cannot login: Email cannot be found");
  }
  if (currentUser && !bcrypt.compareSync(req.body.password, users[currentUser].password)) {
    return res.status(403).send("Cannot login: Incorrect password");
  }
  req.session.user_id = currentUser;
  res.redirect('/urls');
});
//Logout Button to log you out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

