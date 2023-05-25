export interface CreateTaskReply {
  text?: string;
  message_id?: string;
  category?: string;
  assistant_response?: string;
  [key: string]: string | undefined; // Force at least one of the above.
}

export interface EvaluateTaskReply {
  ranking: number[];
  not_rankable: boolean;
}

export interface LabelTaskReply {
  text: string;
  labels: Record<string, number>;
  message_id: string;
}

export type AllTaskReplies = CreateTaskReply | EvaluateTaskReply | LabelTaskReply;
