const fs = require('fs');

/**
 * Recursively deletes a path. Meant to be a portable `rm -rf`
 * https://stackoverflow.com/a/32197381
 * 
 * @param {string} path - directory or file to be deleted
 */
const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = deleteFolderRecursive(process.argv[2]); 
