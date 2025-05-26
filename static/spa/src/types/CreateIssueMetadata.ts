import { FieldMetadata } from "./FieldMetadata";

// Root type representing the API response for create issue metadata
export interface CreateIssueMetadata {
  expand: string; // The expand parameter that was used, e.g., "projects.issuetypes.fields"
  projects: ProjectCreateIssueMetadata[]; // List of projects with their metadata
}

// Metadata for a single project in the response
export interface ProjectCreateIssueMetadata {
  id: string; // Project ID
  key: string; // Project key
  name: string; // Project name
  issuetypes: IssueTypeMetadata[]; // List of issue types for this project
}

// Metadata for a single issue type within a project
export interface IssueTypeMetadata {
  id: string; // Issue type ID
  name: string; // Issue type name (e.g., "Task", "Bug")
  description: string; // Description of the issue type
  fields: Record<string, FieldMetadata>; // Metadata for the fields associated with this issue type
  // fields: Record<string, Field>; // Metadata for the fields associated with this issue type
  subtask: boolean; // Indicates if this is a subtask type
}
