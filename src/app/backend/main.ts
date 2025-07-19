import { Handler } from "./lib/controller/route";

const apiKey = process.env
const promptDeploymentName = process.env

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
