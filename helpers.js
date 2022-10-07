//Function to find email if in database
const findUserByEmail = (email, dataBase) => {
  for (const userId in dataBase) {
    const userFromDb = dataBase[userId];
    if (userFromDb.email === email) {
      // we found our user
      return userId;
    }
  }
  return null;
};

//Function to generate random 6 digit string
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//Function to filter url based on unique user id
const urlsForUser = (id, dataBase) => {
  let finalObj = {};
  for (const shortURL in dataBase) {
    if (dataBase[shortURL].userID === id) {
      finalObj[shortURL] = dataBase[shortURL];
    }
  }
  return finalObj;
};

module.exports = {
  findUserByEmail,
  generateRandomString,
  urlsForUser
};

