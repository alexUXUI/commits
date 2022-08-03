const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
  const url = core.getInput('url', { required: true });
  const token = core.getInput('token', { required: true });

  const payload = JSON.stringify(github.context.payload, undefined, 2);

  const commitUrl = github.context.payload?.commits?.[0]?.url;
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
        text: `${capitalize(message)} - ${name}`,
      },
    };
  });

  try {
    axios
      .post(
        url,
        {
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'New Release',
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `The following commits have been merged to branch: \`${ref.substring(
                  11
                )}\`. \n See the entire change <${commitUrl}|here>.`,
              },
            },
            {
              type: 'divider',
            },
            ...commitMessages,
          ],
        },
        { headers: { authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        core.setOutput('success', true);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
        core.setFailed(error.message);
        core.setOutput('success', false);
      });
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
    core.setOutput('success', false);
  }
} catch (error) {
  core.setFailed(error.message);
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}
