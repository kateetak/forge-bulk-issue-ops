import { IssueType } from "src/types/IssueType";
import { Project } from "../types/Project";
import { User } from "src/types/User";

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

export const formatUser = (user: User): string => {
  return `${user.displayName}`;
}
