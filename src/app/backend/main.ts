import "dotenv/config";
import { CONFIG } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Handler } = require("./lib/controller/route");

const apiKey = CONFIG.VELLUM_API_KEY || "";
const promptDeploymentName = CONFIG.WORKFLOWID || CONFIG.ALTWORKFLOWID || "";

const handler = new Handler(apiKey, promptDeploymentName);

async function main() {
  const userInput = "Where should I eat tomorrow?";
  const userInput2 = "Probably something for breakfast.";
  const result = await handler.MessageHandler(userInput);
  console.log(result)
  const result2 = await handler.MessageHandler(userInput2)
  console.log(result2)

  if (result.status === "success") {
    console.log("Success:", result.data);
  } else {
    console.log("Error:", result.message);
  }
}

main();
