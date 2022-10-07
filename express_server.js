//Bring in required modules
const express = require("express");
const cookieSession = require('cookie-session');
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080

//Middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['secret'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Database
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
  const userId = req.session.user_id;
  const templateVars = { userInfo: users[userId] };
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//Url Index Page: Shows all of the long and short URL and delete button
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {urls: urlsForUser(userId, urlDatabase), userInfo: users[userId]};
  if (!userId) {
    return res.status(401).render("login_error", templateVars);
  }
  res.render("urls_index", templateVars);
});
//New URL page: Input new url to add to the users URL database
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {userInfo: users[userId]};
  if (!userId) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});
//Directs to register page (or url page) depending on if already logged in or not
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { userInfo: users[userId] };
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});
//Directs to login page (or url page) depending on if already logged in or not
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { userInfo: users[userId] };
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//Specific URL page where you can edit the url (Restriction applies based on logged in status)
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const Id = req.params.id
  const specificURL = urlsForUser(userId, urlDatabase);
  if (!urlDatabase[Id]) {
    return res.status(404).send("Cannot access: Id does not exist");
  }
  if (!userId) {
    return res.status(401).send("Cannot access: Not logged in currently");
  }
  if (!specificURL[Id]) {
    return res.status(401).send("Cannot access: Specific URL link is not bounded to this user Id");
  } else {
    const templateVars = { id: Id, longURL: urlDatabase[Id]['longURL'], userInfo: users[userId] };
    res.render("urls_show", templateVars);
  }
});
//URL Json page to access Json object of the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Clicking on this link directs to the actual website the URL is linked to
app.get("/u/:id", (req, res) => {
  const Id = req.params.id;
  const urlId = urlDatabase[Id];
  if (!urlId) {
    return res.status(404).send("Cannot access: This URL code does not exist in database");
  }
  res.redirect(urlId['longURL']);
});
//Creates new URL and short code for it
app.post("/urls", (req, res) => {
  const siteID = generateRandomString();
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("You cannot shorten a URL link because you are not logged in");
  }
  if (!req.body.longURL) {
    return res.status(400).send("You cannot submit an empty link")
  }
  //Create object for new url for the first time
  if (!urlDatabase[siteID]) {
    urlDatabase[siteID] = {};
  };
  urlDatabase[siteID].longURL = req.body.longURL;
  urlDatabase[siteID].userID = userId;
  res.redirect(`/urls/${siteID}`);
});
//Post action to update the long URL based on edit input (With restrictions based on logged in status)
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const Id = req.params.id;
  const updatedURL = req.body.editURL
  const specificURL = urlsForUser(userId, urlDatabase);
  if (!urlDatabase[Id]) {
    return res.status(404).send("Cannot edit Id:Id does not exist");
  }
  if (!userId) {
    return res.status(401).send("Cannot edit: Not logged in currently");
  }
  if (!specificURL[Id]) {
    return res.status(401).send("Unauthorized to edit: This URL code doesn't belong to this account");
  }
  if (!req.body.editURL) {
    return res.status(400).send("You cannot submit an empty link")
  }
  urlDatabase[Id].longURL = updatedURL;
  res.redirect(`/urls/${Id}`);
});
//Delete requested URL once the delete button is clicked (With restrictions based on logged in status)
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const Id = req.params.id;
  const specificURL = urlsForUser(userId, urlDatabase);
  if (!urlDatabase[Id]) {
    return res.status(404).send("Cannot delete Id:Id does not exist");
  }
  if (!userId) {
    return res.status(401).send("Cannot delete: Not logged in currently");
  }
  if (!specificURL[Id]) {
    return res.status(401).send("Unauthorized to delete: This URL doesn't belong to this account");
  }
  delete urlDatabase[Id];
  res.redirect('/urls');
});
//Delete page accessed from address bar (With restrictions based on logged in status)
app.get("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const Id = req.params.id;
  const specificURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[Id]) {
    return res.status(404).send("Cannot delete Id:Id does not exist");
  }
  if (!userId) {
    return res.status(401).send("Cannot delete: Not logged in currently");
  }
  if (!specificURL[Id]) {
    return res.status(401).send("Cannot delete: Unauthorized to delete as you are not the owner of this url link");
  }
  delete urlDatabase[Id];
  res.redirect('/urls');
});
//Post action to register info for new account into database
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
//Login Button logs you in and redirect back to URL page based on logged in status
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
//PORT command to indiciate which port we are hosting the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

