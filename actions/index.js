const slowmode_disable_button = require('./slowmode_disable_button');
const slowmode_thread_disable_button = require('./slowmode_thread_disable_button');

/** @type {Record<string, Function>} */
const actionHandlers = {
    slowmode_disable_button,
    slowmode_thread_disable_button,
};

/** @param {import('@slack/bolt').SlackActionMiddlewareArgs<import('@slack/bolt').BlockAction> & import('@slack/bolt').AllMiddlewareArgs} args */
async function handleAction(args) {
    const { ack, body } = args;
    try {
        const firstAction = body.actions[0];
        const actionId = 'action_id' in firstAction ? firstAction.action_id : '';

        console.log('action triggered:', actionId);

        if (!Object.hasOwn(actionHandlers, actionId)) {
            console.warn(`No handler found for action: ${actionId}`);
            await ack();
            return;
        }
        const actionHandler = actionHandlers[actionId];
        await actionHandler(args);
    } catch (error) {
        console.error(`Error handling action:`, error);
        await ack();
    }
}

module.exports = handleAction;
