import { IssueType } from "./IssueType";
import { ProjectCategory } from "./ProjectCategory";

export interface Project {
  id: string; // e.g. "10000",
  key: string; // e.g. "FEAT",
  name: string; // e.g. "Features",
  issueTypes: IssueType[]; // This relies on expand=issueTypes being specified when searching for projects
  projectCategory?: ProjectCategory
  projectTypeKey: string; // e.g. "software",
  simplified: boolean; // e.g. false,
  style: string; // e.g. "classic",
  isPrivate: boolean; // e.g. false,
  properties: any
}