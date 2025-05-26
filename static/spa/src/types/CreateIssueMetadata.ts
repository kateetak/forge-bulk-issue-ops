
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
  subtask: boolean; // Indicates if this is a subtask type
}

// Metadata for a single field in an issue type
export interface FieldMetadata {
  required: boolean; // Whether the field is required
  schema: FieldSchema; // Schema information of the field
  name: string; // Display name of the field
  key: string; // Key of the field
  hasDefaultValue?: boolean; // Whether the field has a default value
  operations: string[]; // Allowed operations on the field (e.g., ["set", "add"])
  allowedValues?: FieldAllowedValue[]; // Possible values for the field (if applicable)
  defaultValue?: any; // Default value of the field (if applicable)
  configuration: any; // Additional configuration for the field (if applicable)
}

// Schema information for a field
export interface FieldSchema {
  type: string; // Data type of the field (e.g., "string", "number", "array")
  custom?: string; // Custom field type (e.g., "com.atlassian.jira.plugin.system.customfieldtypes:textfield")
  customId?: number; // ID of the custom field (if applicable)
  items?: string; // Type of items in an array (e.g., "string", "option")
  system?: string; // System field name (e.g., "summary", "description")
}

// Allowed value for a field (e.g., dropdown options)
export interface FieldAllowedValue {
  id?: string; // ID of the allowed value
  value?: string; // Value of the allowed option (if applicable)
  name?: string; // Name of the allowed value (if applicable)
  child?: FieldAllowedValue[]; // Nested child allowed values (if applicable)
}
