import { Res } from "../types/init";
import { Processor } from "./processer";
import { Vellum } from "vellum-ai";

export class Handler {
  private workflowID: string
  private process: Processor

  constructor(apiKey: string, workflowID: string) {
    this.workflowID = workflowID
    this.process = new Processor(apiKey)
  }

  async MessageHandler(
    userInput: string, 
    location: string = "Toronto",
    chatHistory?: Array<{ role: string; content: string }>
  ): Promise<Res> {
    console.log("Processing message:", userInput, "at location:", location);

    // Convert chat history to Vellum format if provided
    const vellumChatHistory: Vellum.ChatMessageRequest[] = chatHistory?.map(msg => ({
      role: msg.role === 'user' ? Vellum.ChatMessageRole.User : Vellum.ChatMessageRole.Assistant,
      text: msg.content
    })) || [];

    const result = await this.process.Input(this.workflowID, userInput, location, vellumChatHistory);
    return result;
  }
}