import { FieldMappingInfo } from "./FieldMappingInfo";

export type IssueTypeFieldMappings = {
  fieldIdsToFieldMappingInfos: Map<string, FieldMappingInfo>
}

export type ProjectFieldMappings = {
  issueTypesToMappings: Map<string, IssueTypeFieldMappings>;
}
