
export interface EditIssueMetadata {
  fields: Record<string, FieldMetadata>;
}

// Metadata for each field in the issue
export interface FieldMetadata {
  required: boolean; // Whether the field is required
  schema: FieldSchema; // Schema information for the field
  name: string; // Display name of the field
  key?: string; // Key of the field (optional, sometimes included)
  hasDefaultValue?: boolean; // Whether the field has a default value
  operations?: string[]; // Allowed operations (e.g., ["set", "add"])
  allowedValues?: FieldAllowedValue[]; // Possible values for the field (if applicable)
  defaultValue?: any; // Default value of the field (if applicable)
}

// Schema information for a field
export interface FieldSchema {
  type: string; // Data type (e.g., "string", "number", "array", etc.)
  system?: string; // System field name (e.g., "summary", "description")
  custom?: string; // Custom field type (e.g., "com.atlassian.jira.plugin.system.customfieldtypes:textfield")
  customId?: number; // ID of the custom field (if applicable)
  items?: string; // Type of items in an array (e.g., "string", "option")
}

// Allowed value for a field (e.g., dropdown options)
export interface FieldAllowedValue {
  id?: string | number; // ID of the allowed value
  name?: string; // Name of the allowed value
  value?: string; // Value of the allowed option (if applicable)
  child?: FieldAllowedValue[]; // Nested child allowed values (if applicable)
}

  