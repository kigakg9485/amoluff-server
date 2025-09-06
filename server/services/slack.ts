import { type ChatPostMessageArguments, WebClient } from "@slack/web-api"

// Use
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN environment variable must be set");
}

if (!process.env.SLACK_CHANNEL_ID) {
  throw new Error("SLACK_CHANNEL_ID environment variable must be set");
}

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Sends a structured message to a Slack channel using the Slack Web API
 * Prefer using Channel ID to Channel names because they don't change when the
 * channel is renamed.
 * @param message - Structured message to send
 * @returns Promise resolving to the sent message's timestamp
 */
async function sendSlackMessage(
  message: ChatPostMessageArguments
): Promise<string | undefined> {
  try {
    // Send the message
    const response = await slack.chat.postMessage(message);

    // Return the timestamp of the sent message
    return response.ts;
  } catch (error) {
    console.error('Error sending Slack message:', error);
    throw error;
  }
}

// Example usage
async function sendSlackMessageExampleUsage() {
  const channel = process.env.SLACK_CHANNEL_ID;

  // Example of sending a simple text message
  await sendSlackMessage({
    channel,
    text: 'Hello, Slack!'
  });

  // Example of sending a more structured message with blocks
  await sendSlackMessage({
    channel: '#team-updates',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Team Update* :rocket:'
        }
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'Our latest project is making great progress!'
        }
      }
    ]
  });
}


/**
 * Reads the history of a channel
 * @param channel_id - Channel ID to read message history from
 * @returns Promise resolving to the messages
 */
async function readSlackHistory(
  channel_id: string,
  messageLimit: number = 100,
): Promise<any> {
  try {
    // Get messages
    return await slack.conversations.history({
      channel: channel_id,
      limit: messageLimit,
    });
  } catch (error) {
    console.error('Error reading Slack history:', error);
    throw error;
  }
}


// Example usage
async function readSlackHistoryExampleUsage() {
  // Example Channel ID, get real channel id from user
  const generalChannelId = "C084HL619LG";

  // Example of reading message history
  const result = await readSlackHistory(generalChannelId);

  let html = "";
  result.messages?.forEach((message: any) => {
    html += `<div class="message">${message.user}: ${message.text}</div>`;
  });
}


export { sendSlackMessage, readSlackHistory };
