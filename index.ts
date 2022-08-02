const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
  const url = core.getInput('url');
  const token = core.getInput('token');

  const payload = JSON.stringify(github.context.payload, undefined, 2);

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
        text: `${capitalize(message)} - ${name} - <${url}|Pull Request>`,
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
                text: 'New Release :rocket:',
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `The following commits have been merged from the PR Branch ${ref.substring(
                  11
                )}. 🎯 \n See the entire difference <${commitUrl}|here 📝>.`,
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
