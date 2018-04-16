let listeners = {};

/**
 * Subscribe to messages of a certain type
 *
 * @param {function} listener Function to call when a message is heard
 * @param {string} type Type of message to listen for
 */
function subscribe(listener, type) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(listener);
}

/**
 * Send a message to all listeners who want to hear it
 *
 * @param {string} message Message to send to listeners
 * @param {string} type Type of message that will be sent
 */
function sendMessage(message, type) {
    let listener = listeners[type];
    for (let i = 0; i < listener.length; i++) {
        listener[i](message, type);
    }
}

module.exports = {
    subscribe: subscribe,
    sendMessage: sendMessage
};
