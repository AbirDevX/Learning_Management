const { unlink } = require("fs");
const { join } = require("path");

const destroyAFile = (path) => {
  // Delete any
  unlink(join(__dirname, `../uploads/banner/${path}`), (err) => {
    if (err) console.log(err);
    else {
      console.log("file deleted");
    }
  });
};

const destroyPostBanner = (path) => {
  // Delete any
  unlink(join(__dirname, `../uploads/post/${path}`), (err) => {
    if (err) console.log(err);
    else {
      console.log("file deleted");
    }
  });
};
 
module.exports = { destroyAFile, destroyPostBanner };
