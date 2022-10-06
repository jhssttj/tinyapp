//Function to find email if in database
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const userFromDb = database[userId];
    if (userFromDb.email === email) {
      // we found our user
      return userId;
    }
  }
  return null;
};

module.exports = {
  findUserByEmail,
}