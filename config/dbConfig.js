const mongoose = require("mongoose");

function dbConnection() {
  mongoose
    .connect(process.env.MONGO_DB_URL)
    .then(() => {
      console.log("DB Connection SuccessFull .... :)");
    })
    .catch((err) => console.log("Connection Failed.... :(", err?.message));
}

module.exports = { dbConnection };
