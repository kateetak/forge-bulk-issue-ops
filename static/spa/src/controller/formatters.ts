import { IssueType } from "src/types/IssueType";
import { Project } from "../types/Project";

export const formatProject = (project: Project): string => {
  return `${project.name} (${project.key})`;
}

export const formatIssueType = (issueType: IssueType): string => {
  return `${issueType.name}`;
  //   if (issueType.scope) {
  //     const maybeProject = allProjects.find(project => project.id === issueType.scope.project.id);
  //     label += ` - ${maybeProject ? maybeProject.name : issueType.scope.project.id}`;
  //   }
}
