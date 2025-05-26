import { CustomFieldOption } from "./CustomFieldOption";

export type ProjectFieldOptionMappings = {
  issueTypesToMappings: Map<string, IssueTypeFieldOptionMappings>;
}

export type IssueTypeFieldOptionMappings = {
  fieldIdsToOptions: Map<string, CustomFieldOption[]>
}
