import { IssueType } from "./IssueType";
import { Project } from "./Project";

export type IssueSearchParameters = {
  projects: Project[];
  issueTypes: IssueType[];
  labels: string[];
}
