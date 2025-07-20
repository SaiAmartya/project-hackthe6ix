import { Res } from "../types/init";
import { Processor } from "./processer";

export class Handler {
  private workflowID: string
  private process: Processor

  constructor(apiKey: string, workflowID: string) {
    this.workflowID = workflowID
    this.process = new Processor(apiKey)
  }

  async MessageHandler(userInput: string, location: string): Promise<Res> {
    console.log("message test reached, view user input ", userInput)
    location = "Toronto"

    const result = await this.process.Input(this.workflowID, userInput, location)
    return result
  }
}