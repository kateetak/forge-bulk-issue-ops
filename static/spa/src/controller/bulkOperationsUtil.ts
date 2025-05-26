import jiraDataModel from "../model/jiraDataModel";
import { DataRetrievalResponse } from "../types/DataRetrievalResponse";
import { DataRetrievalResponseBuilder } from "../model/DataRetrievalResponseBuilder";
import { Project } from "../types/Project";
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueTypeFieldOptionMappings, ProjectFieldOptionMappings } from "../types/ProjectFieldOptionMappings";


export const findProjectByKey = async (projectKey: string): Promise<DataRetrievalResponse<Project>> => {
  try {
    const project = await jiraDataModel.getProjectByKey(projectKey);
    return new DataRetrievalResponseBuilder<Project>().setData(project).build();
  } catch (error) {
    return new DataRetrievalResponseBuilder<Project>().setErrorMessage(error.message).build();
  }
}

export const buildFieldOptionsForProject = async (
  targetProjectId: string,
  onlyIncludeRequiredFields: boolean = true
): Promise<DataRetrievalResponse<ProjectFieldOptionMappings>> => {
  const projectFieldOptionMappings: ProjectFieldOptionMappings = {
    issueTypesToMappings: new Map<string, IssueTypeFieldOptionMappings>()
  }
  const projectCreateIssueMetadata = await jiraDataModel.getCreateIssueMetadataForProject(targetProjectId);
  for (const issueType of projectCreateIssueMetadata.issuetypes) {
    const fieldIdsToOptions = new Map<string, CustomFieldOption[]>();
    const issueTypeFieldOptionMappings: IssueTypeFieldOptionMappings = {
      fieldIdsToOptions: fieldIdsToOptions
    };
    projectFieldOptionMappings.issueTypesToMappings.set(issueType.id, issueTypeFieldOptionMappings);

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

          if (field.allowedValues) {
            for (const allowedValue of field.allowedValues) {
              if (allowedValue.value) {
                const customFieldOption: CustomFieldOption = {
                  id: allowedValue.id,
                  name: allowedValue.value,
                };
                const existingOptions = issueTypeFieldOptionMappings.fieldIdsToOptions.get(fieldId);
                if (existingOptions) {
                  existingOptions.push(customFieldOption);
                } else {
                  issueTypeFieldOptionMappings.fieldIdsToOptions.set(fieldId, [customFieldOption]);
                }
              } else {
                console.log(`getFieldOptionsForProject: Skipping allowed value without a value: ${JSON.stringify(allowedValue)}`);
              }
            }
          } else if (field.schema) {
            if (field.schema.type === 'number') {

            }
          }
        } else {
          // console.log(`getFieldOptionsForProject: Skipping non-custom field: ${fieldName}`);
        }
      } else {
        // console.log(`getFieldOptionsForProject: Skipping optional field: ${fieldName}`);
      }
    }
  }
  return new DataRetrievalResponseBuilder<ProjectFieldOptionMappings>()
    .setData(projectFieldOptionMappings)
    .build();
}
