

// Allowed value for a field (e.g., dropdown options)
export interface FieldAllowedValue {
  id?: string; // ID of the allowed value
  value?: string; // Value of the allowed option (if applicable)
  name?: string; // Name of the allowed value (if applicable)
  child?: FieldAllowedValue[]; // Nested child allowed values (if applicable)
}
