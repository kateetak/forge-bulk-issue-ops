
export interface FieldSchema {
  type: string; // Data type of the field (e.g., "string", "number", "array")
  custom?: string; // Custom field type (e.g., "com.atlassian.jira.plugin.system.customfieldtypes:textfield")
  customId?: number; // ID of the custom field (if applicable)
  items?: string; // Type of items in an array (e.g., "string", "option")
  system?: string; // System field name (e.g., "summary", "description")
}
