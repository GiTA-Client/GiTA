const remote = require('electron').remote;

const getopts = require('getopts');
const messagebus = remote.require('./js/messagebus');

let prompt = ['$', '#', '+'];

/**
 * Check if commands are safe, send message blocking terminal if not
 * @param {string} command A command to execute in a shell
 */
function inputChecker(command) {
    let trimCmd = removePrompt(command);
    let safetyCheck = gitCheckForce(trimCmd);
    if (!safetyCheck.pass) {
        console.log(safetyCheck.errMsg);
        messagebus.sendMessage("block", "terminal");
    } else {
        messagebus.sendMessage("unblock", "terminal")
    }
}

/**
 * Removes the prompt from a given command and returns the result
 * @param {string} command Command with a prompt at start
 * @return {string} Command with the prompt removed
 */
function removePrompt(command) {
    let cutoff = 0;
    for (let i = 0; i < command.length; i++) {
        if (prompt.includes(command[i])) {
            cutoff = i + 1;
            break;
        }
    }
    return command.substr(cutoff).trim();
}

/**
 * @typedef {Object} CheckerResult
 * @property {boolean} pass Whether the command is safe to execute
 * @property {string} errMsg The error message, in case command is unsafe
 */

/**
 * Checks if command is a git force operation.
 * @param {string} command Command to execute
 * @return {CheckerResult} Whether the command is safe and corresponding error
 */
function gitCheckForce(command) {
    if (!command.startsWith("git ")) {
        return { pass: true };
    }
    const options = getopts(command.split(" ").splice(1), {
        alias: {
            f: "force"
        }
    });

    let result;
    if (options.force) {
        result = {
            pass: false,
            errMsg: "Forcing a git operation is dangerous!"
        };
    } else {
        result = {
            pass: true
        }
    }
    return result;
}

messagebus.subscribe(inputChecker, "command");
