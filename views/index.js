const slowmode_modal = require('./slowmode_modal');
const slowmode_thread_modal = require('./slowmode_thread_modal');

/** @type {Record<string, Function>} */
const viewHandlers = {
    slowmode_modal,
    slowmode_thread_modal,
};

/** @param {import('@slack/bolt').SlackViewMiddlewareArgs & import('@slack/bolt').AllMiddlewareArgs} args */
async function handleViews(args) {
    const { body } = args;
    try {
        const viewId = body.view.callback_id;

        if (!Object.hasOwn(viewHandlers, viewId)) {
            console.warn(`No handler found for view: ${viewId}`);
            return;
        }
        const viewHandler = viewHandlers[viewId];
        await viewHandler(args);
    } catch (error) {
        console.error(`Error handling view ${body.view.callback_id}:`, error);
    }
}

module.exports = handleViews;
