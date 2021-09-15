const { exec } = require('child_process');

/**
 *
 * @param {string} command
 * @param [options]
 * @param {string} [options.cwd] - working directory to run command from
 * @param {boolean} [options.forwardStdout] - forwarding stdout of the command to console.log
 * @returns {Promise<string>}
 */
module.exports = function (command, options = {}) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, options, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });

    if (options.forwardStdout) {
      childProcess.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
    }
  })
}
