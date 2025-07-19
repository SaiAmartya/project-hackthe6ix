import { VellumClient } from "vellum-ai";
import { Res } from '../types/init';

export class Processor {
  private client: VellumClient;

  constructor(apiKey: string) {
    this.client = new VellumClient({
      apiKey: apiKey
    });
  }

  async Call(workflowID: string, userInput: string): Promise<Res> {
    try {
      console.log("testing workflowid", workflowID);
      console.log("testing user input", userInput);

      const result = await this.client.executePrompt({
        promptDeploymentName: workflowID,
        releaseTag: "LATEST",
        inputs: [{
          type: "STRING",
          name: "user_message",
          value: userInput
        }]
      });

      if (result.state === "REJECTED") {
        throw new Error(result.error.message);
      } else if (result.state === "FULFILLED") {
        return {
          data: JSON.stringify(result.outputs),
          status: 'success'
        };
      }

      return {
        data: null,
        status: 'error'
      };
    } catch (e) {
      console.log("error executing", e);
      return {
        data: null,
        status: "error"
      };
    }
  }

  async Input(userInput: string, workflowID: string): Promise<Res> {
    const input = {
      message: userInput
    };
    return await this.Call(workflowID, input.message);
  }
}