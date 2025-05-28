import { IssueType } from "./IssueType";
import { Project } from "./Project";

export interface ProjectWithIssueTypes extends Project {
  issueTypes: IssueType[];
}