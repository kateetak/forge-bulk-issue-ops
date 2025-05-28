import jiraDataModel from "../model/jiraDataModel";
import { DataRetrievalResponse } from "../types/DataRetrievalResponse";
import { DataRetrievalResponseBuilder } from "../model/DataRetrievalResponseBuilder";
import { Project } from "../types/Project";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { FieldMappingInfo } from "src/types/FieldMappingInfo";


export const findProjectByKey = async (projectKey: string): Promise<DataRetrievalResponse<Project>> => {
  try {
    const project = await jiraDataModel.getProjectByKey(projectKey);
    return new DataRetrievalResponseBuilder<Project>().setData(project).build();
  } catch (error) {
    return new DataRetrievalResponseBuilder<Project>().setErrorMessage(error.message).build();
  }
}

export const buildFieldMappingsForProject = async (
  targetProjectId: string,
  onlyIncludeRequiredFields: boolean = true
): Promise<DataRetrievalResponse<ProjectFieldMappings>> => {
  const projectFieldMappings: ProjectFieldMappings = {
    issueTypesToMappings: new Map<string, IssueTypeFieldMappings>()
  }
  const projectCreateIssueMetadata = await jiraDataModel.getCreateIssueMetadataForProject(targetProjectId);
  // const projectId = projectCreateIssueMetadata.id;
  for (const issueType of projectCreateIssueMetadata.issuetypes) {
    const fieldIdsToFieldMappingInfos = new Map<string, FieldMappingInfo>();
    const issueTypeFieldMappings: IssueTypeFieldMappings = {
      fieldIdsToFieldMappingInfos: fieldIdsToFieldMappingInfos
    };
    projectFieldMappings.issueTypesToMappings.set(issueType.id, issueTypeFieldMappings);

    for (const fieldId in issueType.fields) {
      const field = issueType.fields[fieldId];
      const includeField = !onlyIncludeRequiredFields || field.required;
      if (includeField) {
        const isCustomField = field.schema && field.schema.customId;
        if (isCustomField) {
          console.log(`getFieldOptionsForProject: Found custom field: ${fieldId}`);

          if (fieldId === "customfield_10091") {
            console.log(` ***** getFieldOptionsForProject: Found R2D2 Team field (customfield_10091)`);

          }

          if (fieldId === "customfield_10124") {
            console.log(` ***** getFieldOptionsForProject: Found My Number field (customfield_10124)`);
          }

          const fieldMappingInfo: FieldMappingInfo = {
            fieldId: fieldId,
            fieldMetadata: field,
            // sourceProject: ddd
          }
          
          issueTypeFieldMappings.fieldIdsToFieldMappingInfos.set(fieldId, fieldMappingInfo);


        } else {
          // console.log(`getFieldOptionsForProject: Skipping non-custom field: ${fieldName}`);
        }
      } else {
        // console.log(`getFieldOptionsForProject: Skipping optional field: ${fieldName}`);
      }
    }
  }
  return new DataRetrievalResponseBuilder<ProjectFieldMappings>()
    .setData(projectFieldMappings)
    .build();
}
