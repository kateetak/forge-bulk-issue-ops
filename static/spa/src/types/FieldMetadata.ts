import { FieldAllowedValue } from "./FieldAllowedValue";
import { FieldSchema } from "./FieldSchema";

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
