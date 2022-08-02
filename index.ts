const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
  const url = core.getInput('url');
  const token = core.getInput('token');

  const payload = JSON.stringify(github.context.payload, undefined, 2);

  console.log(payload);

  const commitMessage = github.context.payload?.commits?.[0]?.message;
  const commitUrl = github.context.payload?.commits?.[0]?.url;
  const compareUrl = github.context.payload?.compare;
  const ref = github.context.payload?.ref;

  const commitMessages = github.context.payload?.commits?.map((commit) => {
    const {
      message,
      url,
      author: { name },
    } = commit;

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Author:* ${name} *Commit:* ${message}  <${url}|PR URL>`,
      },
    };
  });

  console.log(commitMessages);

  try {
    axios.post(
      url,
      {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New Release :rocket:',
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          ...commitMessages,
          {
            type: 'divider',
          },
          {
            type: 'context',
            elements: [
              {
                type: 'plain_text',
                text: 'Made with 💜 Product Science',
                emoji: true,
              },
            ],
          },
        ],
      },
      { headers: { authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
    core.setOutput('success', false);
  }

  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
