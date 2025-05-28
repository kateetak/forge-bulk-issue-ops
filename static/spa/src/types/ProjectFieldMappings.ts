import { FieldMappingInfo } from "./FieldMappingInfo";

export type IssueTypeFieldMappings = {
  fieldIdsToFieldMappingInfos: Map<string, FieldMappingInfo>
}

export type ProjectFieldMappings = {
  targetIssueTypesToMappings: Map<string, IssueTypeFieldMappings>;
}
