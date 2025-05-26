// import { CustomFieldOption } from "./CustomFieldOption";
import { FieldMetadata } from "./FieldMetadata";

// export type IssueTypeFieldOptionMappings = {
//   fieldIdsToOptions: Map<string, CustomFieldOption[]>
// }

// export type ProjectFieldOptionMappings = {
//   issueTypesToMappings: Map<string, IssueTypeFieldOptionMappings>;
// }

export type IssueTypeFieldMappings = {
  fieldIdsToFieldMetadata: Map<string, FieldMetadata>
}

export type ProjectFieldMappings = {
  issueTypesToMappings: Map<string, IssueTypeFieldMappings>;
}
