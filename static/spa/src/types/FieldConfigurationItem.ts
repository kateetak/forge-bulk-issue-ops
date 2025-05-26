
// These are returned from https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfiguration-id-fields-get

// TODO: This type isn't being used and could be removed

export type FieldConfigurationItem = {
  id: string; // e.g. "environment",
  isHidden: boolean; // e.g. false,
  isRequired: boolean; // e.g. false
  description: string; // e.g. For example operating system, software platform and/or hardware specifications (include as appropriate for the issue).",
}
