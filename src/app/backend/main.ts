// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Handler } = require("./lib/controller/route");

const apiKey = process.env.VELLUM_API_KEY || ""
const promptDeploymentName = process.env.WORKFLOWID || process.env.ALTWORKFLOWID || "";

const handler = new Handler(apiKey, promptDeploymentName)

async function main() {
  const userInput = "I want to know where I can sleep"
  const result = await handler.MessageHandler(userInput)

  if (result.status === 'success') {
    console.log('Success:', result.data);
  } else {
    console.log('Error:', result.message);
  }
}

main()
