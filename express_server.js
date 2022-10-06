const express = require("express");
const cookieParser = require('cookie-parser');
const e = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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

const urlsForUser = (id) => {
  let finalObj = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      finalObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return finalObj;
};

//Homepage: A hello messsage - LIKELY CAN DELETE AT END
app.get("/", (req, res) => {
  res.send("Hello!");
});
//Url Index Page: Shows all of the long and short URL and delete button
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlsForUser(req.cookies["user_id"]), userInfo: users[req.cookies["user_id"]]};
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Must log in to access URL list");
  }
  res.render("urls_index", templateVars);
});
//New URL page: Input new url to add to the database
app.get("/urls/new", (req, res) => {
  const templateVars = {userInfo: users[req.cookies["user_id"]]};
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});
//Directs to register page
app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }
  res.render("register", templateVars);
});
//Directs to login page
app.get("/login", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }
  res.render("login", templateVars);
});
//Specific URL page
app.get("/urls/:id", (req, res) => {
  const specificURL = urlsForUser(req.cookies["user_id"])
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]['longURL'], userInfo: users[req.cookies["user_id"]] };
  if (!specificURL[req.params.id]) {
    return res.status(401).send("Specific URL link not found");
  }
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
  if (!longURL) {
    return res.status(404).send("Shortened URL does not exist in database");
  }
  res.redirect(longURL['longURL']);
});
//Creates new URL and short code for it
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const siteID = generateRandomString();
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You cannot shorten a URL link because you are not logged in");
  }
  if (!urlDatabase[siteID]) {
    urlDatabase[siteID] = {};
  }
  urlDatabase[siteID].longURL = req.body.longURL;
  urlDatabase[siteID].userID = req.cookies["user_id"];
  console.log(urlDatabase);
  res.redirect(`/urls/${siteID}`);
});
//Once edited, update the long URL
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[req.params.id].longURL = req.body.editURL;
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

