const remote = require('electron').remote;

const messagebus = remote.require('./js/messagebus');

const COMMAND_TYPE = 'command';
const ECHO_DEVELOPMENT = 'echo "gita help is in development"';
const ECHO_INVALID_COMMAND = 'echo "The command you entered is invalid"';
const NEW_COMMAND_TYPE = 'newcommand';
const PROMPTS = ['$', '#', '+'];
const TERMINAL_TYPE = 'terminal';
const UNBLOCK_MESSAGE = 'unblock';

const COMMAND_MAP = {
    'add': 'add -n',
    'commit': 'commit --dry-run',
    'merge': 'merge --no-commit'
}

/**
 * Check if commands are safe, send message blocking terminal if not
 * @param {string} command A command to execute in a shell
 */
function handleMessage(message, type) {
    if (type !== COMMAND_TYPE) return;
    message = removePrompt(message);
    if (message.startsWith('gita help')) {
        messagebus.sendMessage(ECHO_DEVELOPMENT, NEW_COMMAND_TYPE);
    } else if (message.startsWith('gita')) {
        let command = getDryRunCommand(message);
        messagebus.sendMessage(command, NEW_COMMAND_TYPE);
    } else {
        messagebus.sendMessage(UNBLOCK_MESSAGE, TERMINAL_TYPE);
    }
}

/**
 * Gets corresponding dry-run command for gita command
 * @param {string} command gita command
 */
function getDryRunCommand(command) {
    let tokens = command.split(' ');
    if (!tokens[1]) return ECHO_INVALID_COMMAND;
    let remainder = tokens.slice(2).join(' ');
    let realCommand = 'git ' + COMMAND_MAP[tokens[1]] + ' ' + remainder;
    return realCommand;
}

/**
 * Removes the prompt from a given command and returns the result
 * @param {string} command Command with a prompt at start
 * @return {string} Command with the prompt removed
 */
function removePrompt(command) {
    let cutoff = 0;
    for (let i = 0; i < command.length; i++) {
        if (PROMPTS.includes(command[i])) {
            cutoff = i + 1;
            break;
        }
    }
    return command.substr(cutoff).trim();
}

messagebus.subscribe(handleMessage, "command");
