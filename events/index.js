const message = require('./message');

/** @type {Record<string, Function>} */
const eventHandlers = {
    message,
};

/** @param {import('@slack/bolt').SlackEventMiddlewareArgs & import('@slack/bolt').AllMiddlewareArgs} args */
async function handleEvent(args) {
    const { event } = args;
    try {
        const eventName = event.type;

        if (!Object.hasOwn(eventHandlers, eventName)) {
            return;
        }
        const eventHandler = eventHandlers[eventName];
        await eventHandler(args);
    } catch (error) {
        console.error(`Error handling event ${event.type}:`, error);
    }
}

module.exports = handleEvent;
