
import { FieldConfigurationScheme } from "./FieldConfigurationScheme";

// This is the type returned from https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfigurationscheme-project-get

export type ProjectsFieldConfigurationSchemeMappings = {
  isLast: boolean; // e.g. true,
  maxResults: number; // e.g. 50,
  startAt: number // e.g. 0,
  total: number; // e.g. 5,
  values: ProjectsFieldConfigurationSchemeMappingObject[]
}

export type ProjectsFieldConfigurationSchemeMappingObject = {
  projectIds: number[];
  fieldConfigurationScheme?: FieldConfigurationScheme;
}

