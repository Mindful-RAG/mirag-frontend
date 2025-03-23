export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  markdown?: string;
  status?: string;
  type?: string;
};

export type Query = {
  query: string;
  short_answer: string;
  long_answer: string;
  status: string;
  markdown: string;
};

export type Health = {
  status: string;
  message: string;
};
