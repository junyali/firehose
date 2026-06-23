import type { SlackEventMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';
import {
    env,
    client,
    getUserMessageCount,
    deleteMessages,
    postEphemeral,
    logInternal,
    isUserExempt,
    getThreadLink,
} from '../../utils/index.js';

const CHANNEL_THRESHOLDS: Record<string, number> = {
    'C0188CY57PZ': 200,
};

export default async function gatekeepListener({
    payload,
}: SlackEventMiddlewareArgs<'message'> & AllMiddlewareArgs): Promise<void> {
    if (!payload || payload.type !== 'message' || !('user' in payload) || !payload.user) return;
    if (payload.subtype) return;

    const threadTs = `thread_ts` in payload ? payload.thread_ts : undefined;
    if (threadTs && threadTs !== payload.ts) return;

    const { user, channel, ts } = payload;
    const threshold = CHANNEL_THRESHOLDS[channel];
    if (threshold === undefined) return;

    if (await isUserExempt(user, channel)) return;

    const messageCount = await getUserMessageCount(user);
    if (messageCount >= threshold) return;
    const messageLog: { ts?: string; user?: string; text?: string }[] = [];

    const timestamps: string[] = [];
    let cursor: string | undefined;
    do {
        try {
            const replies = await client.conversations.replies({
                channel,
                ts,
                limit: 999,
                cursor,
            });
            for (const msg of replies.messages ?? []) {
                if (msg.ts && !timestamps.includes(msg.ts)) {
                    timestamps.push(msg.ts);
                    messageLog.push(msg);
                }
            }
            cursor = replies.response_metadata?.next_cursor;
        } catch (e: any) {
            if (e?.data?.error === 'thread_not_found') break;
            throw e;
        }
    } while (cursor);

    if (!timestamps.includes(ts)) timestamps.push(ts);

    await Promise.all([
        deleteMessages(channel, timestamps),
        postEphemeral(
            channel,
            user,
            `Your post has been removed as you do not meet the minimum activity requirements to be able to post here. Feel free to return once you have familiarized yourself with the Slack!`
        ),
    ]);

    const logContent = messageLog
        .sort((a, b) => parseFloat(a.ts || '0') - parseFloat(b.ts || '0'))
        .map((msg) => `${msg.user || '(unknown user)'}: ${msg.text || '(no text)'}`)
        .join('\n');

    const logMessage = `Removed message from <@${user}> in <#${channel}> (ineligible threshold).\nLink: ${getThreadLink(channel, ts)}`;

    await Promise.all([
        logInternal(logMessage),
        client.files.uploadV2({
            channel_id: env.MIRRORCHANNEL,
            initial_comment: logMessage,
            content: logContent || '(no messages captured)',
            filename: `gatekeep_${channel}_${ts}.txt`,
            title: `Gatekept thread log`,
        }),
    ]);
}
