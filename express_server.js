const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//Homepage: A hello messsage
app.get("/", (req, res) => {
  res.send("Hello!");
});
//Url Index Page: Shows all of the long and short URL and delete button
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
//Creates new URL and short code for it
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const siteID = generateRandomString();
  urlDatabase[siteID] = req.body.longURL;
  res.redirect(`/urls/${siteID}`);
});
//New URL page: Input new url to add to the database
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//Specific URL page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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
//Delete requested URL once the delete button is clicked
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const siteID = generateRandomString();
  urlDatabase[siteID] = req.body.longURL;
  res.redirect(`/urls/${siteID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

