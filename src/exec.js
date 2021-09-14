const { exec } = require('child_process');

module.exports = function (command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  })
}
