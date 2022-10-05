const express = require("express");
const cookieParser = require('cookie-parser');
const e = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const findUserByEmail = (email) => {
  for (const userId in users) {
    const userFromDb = users[userId];
    if (userFromDb.email === email) {
      // we found our user
      return userId;
    }
  }

  return null;
};

//Homepage: A hello messsage
app.get("/", (req, res) => {
  res.send("Hello!");
});
//Url Index Page: Shows all of the long and short URL and delete button
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, userInfo: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});
//New URL page: Input new url to add to the database
app.get("/urls/new", (req, res) => {
  const templateVars = {userInfo: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});
//Directs to register page
app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});
//Directs to login page
app.get("/login", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});
//Specific URL page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userInfo: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});
//URL Json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Test page - LIKELY CAN DELETE AT END
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//Clicking on this link directs to the actual website the URL is linked to
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
//Creates new URL and short code for it
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const siteID = generateRandomString();
  urlDatabase[siteID] = req.body.longURL;
  res.redirect(`/urls/${siteID}`);
});
//Once edited, update the long URL
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect(`/urls/${req.params.id}`);
});
//Delete requested URL once the delete button is clicked
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//Put register info into database
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const currentUser = findUserByEmail(req.body.email);
  let userObj = {};
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Cannot have empty email/password input");
  }
  if(currentUser){
    return res.status(400).send('Email already in use');
  }
  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = req.body.password;
  users[userID] = userObj;
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect('/urls');
});
//Login Button logs you in and redirect back to URL page
app.post("/login", (req, res) => {
  const currentUser = findUserByEmail(req.body.email);
  if (!currentUser) {
    return res.status(403).send("Email cannot be found");
  }
  if (currentUser && users[currentUser].password !== req.body.password) {
    return res.status(403).send("Incorrect password");
  }
  res.cookie('user_id', currentUser)
  res.redirect('/urls');
});
//Logout Button to log you out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

