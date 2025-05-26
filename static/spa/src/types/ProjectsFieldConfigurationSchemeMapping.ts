
import { FieldConfigurationScheme } from "./FieldConfigurationScheme";

// This is the type returned from https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfigurationscheme-project-get

export type ProjectsFieldConfigurationSchemeMapping = {
  projectIds: string[];
  fieldConfigurationScheme?: FieldConfigurationScheme;
}

