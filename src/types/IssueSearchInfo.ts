import { Issue } from "./Issue"

export type IssueSearchInfo = {
  maxResults: number; // e.g. 50,
  startAt: number; // e.g. 0,
  total: number; // e.g. 4,
  isLast: boolean; // e.g. true,
  issues: Issue[];
  errorMessages?: string[]; // e.g. ["Unbounded JQL queries are not allowed here. Please add a search restriction to your query"]
}
