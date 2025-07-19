export interface Req {
  userInput: string
  workflowID: string
}

export interface Res {
  data: string | null
  status: 'success' | "error" | "null"
}