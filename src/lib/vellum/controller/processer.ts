import { VellumClient, Vellum } from "vellum-ai";
import { Res } from "../types/init";
import { CONFIG } from "../../../config";

export class Processor {
  private client: VellumClient;

  constructor(apiKey?: string) {
    const key = process.env.VELLUM_API_KEY ?? apiKey ?? CONFIG.VELLUM_API_KEY;
    if (!key) throw new Error("Missing VELLUM_API_KEY");
    this.client = new VellumClient({ apiKey: key });
  }

  async Call(workflowID: string, userInput: string, location?: string, chatHistory?: Vellum.ChatMessageRequest[]
  ): Promise<Res> {
    try {
      const timestamp = new Date().toISOString();

      const inputs: Vellum.WorkflowRequestInputRequest[] = [
        {
          type: "STRING",
          name: "location",
          value: location || "Toronto"
        },
        {
          type: "CHAT_HISTORY",
          name: "chat_history",
          value: chatHistory && chatHistory.length > 0 ? chatHistory : [],
        },
        {
          type: "STRING",
          name: "message",
          value: userInput
        },
        {
          type: "STRING",
          name: "timestamp",
          value: timestamp
        },
      ];

      const useWorkflowId = workflowID && workflowID.trim() !== "";

      const request: Vellum.ExecuteWorkflowStreamRequest = useWorkflowId
        ? {
          workflowDeploymentId: workflowID,
          releaseTag: "LATEST",
          inputs,
        }
        : { // fallback - both are treated as valid
          workflowDeploymentName: "hack-the-6-ix-lively-ai",
          releaseTag: "LATEST",
          inputs,
        };

      const response = await this.client.executeWorkflow(request);

      console.log(response)

      return { data: JSON.stringify(response), status: "success" };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Error executing workflow:", e.message || e);

      if (e && typeof e === "object" && "statusCode" in e) {
        console.error("Status Code:", e.statusCode);

        if ("body" in e) console.error("Response body:", e.body);
      }

      return { data: null, status: "error" };
    }
  }

  async Input(
    workflowID: string, 
    userInput: string, 
    location?: string, 
    chatHistory?: Vellum.ChatMessageRequest[]
  ): Promise<Res> {
    return this.Call(workflowID, userInput, location, chatHistory);
  }
}
