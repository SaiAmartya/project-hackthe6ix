import { VellumClient, Vellum } from "vellum-ai";
import { Res } from '../../lib/types/init';

export class Processor {
  private client: VellumClient;

  constructor(apiKey: string) {
    this.client = new VellumClient({ apiKey });
  }

  async Call(
    workflowID: string,
    userInput: string,
    location?: string,
    chatHistory?: unknown[]
  ): Promise<Res> {
    try {
      console.log("testing workflowID:", workflowID);
      console.log("testing user input:", userInput);

      const timestamp = new Date().toISOString();

      const inputs: Vellum.WorkflowRequestInputRequest[] = [
        {
          type: "STRING",
          name: "prompt_inputs.user_location",
          value: location || "Toronto",
        },
        {
          type: "CHAT_HISTORY",
          name: "prompt_inputs.chat_history",
          value:
            chatHistory && chatHistory.length > 0
              ? (chatHistory as Vellum.ChatMessageRequest[])
              : [
                {
                  role: Vellum.ChatMessageRole.User,
                  text: userInput,
                },
              ],
        },
        {
          type: "STRING",
          name: "prompt_inputs.message",
          value: userInput,
        },
        {
          type: "STRING",
          name: "prompt_inputs.timestamp",
          value: timestamp,
        },
      ];


      const request: Vellum.ExecuteWorkflowStreamRequest = {
        workflowDeploymentName: "hack-the-6-ix-lively-ai",
        releaseTag: "LATEST",
        inputs,
      };

      const outputs: Record<string, string> = {};

      const stream = await this.client.executeWorkflowStream(request);

      for await (const event of stream) {
        if (event.type !== "WORKFLOW") continue;

        if (event.data.state === "REJECTED") {
          throw new Error(event.data.error?.message || "Workflow rejected");
        }

        if (event.data.state === "STREAMING" && event.data.output) {
          const name = event.data.output?.name;
          const delta = event.data.output?.delta;
          const value = event.data.output?.value;

          if (name) {
            if (delta) {
              outputs[name] = (outputs[name] || "") + delta;
            } else if (value) {
              outputs[name] = String(value);
            }
          }
        }

        if (event.data.state === "FULFILLED" && event.data.outputs) {
          Object.assign(outputs, event.data.outputs);
          break;
        }
      }

      return {
        data: JSON.stringify(outputs),
        status: "success",
      };
    } catch (e) {
      console.error("error executing workflow:", e);
      return {
        data: null,
        status: "error",
      };
    }
  }

  async Input(
    userInput: string,
    workflowID: string,
    location?: string
  ): Promise<Res> {
    return await this.Call(workflowID, userInput, location);
  }
}
