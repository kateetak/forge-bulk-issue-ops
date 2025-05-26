import { Field } from "../types/Field";
import jiraDataModel from "../model/jiraDataModel";
import { ProjectsFieldConfigurationSchemeMapping } from "../types/ProjectsFieldConfigurationSchemeMapping";
import { ProjectCustomFieldContextMappings } from "src/types/ProjectCustomFieldContextMappings";
import { DataRetrievalResponse } from "src/types/DataRetrievalResponse";
import { CustomFieldContextOption } from "src/types/CustomFieldContextOption";
import { DataRetrievalResponseBuilder } from "src/model/DataRetrievalResponseBuilder";
import { Project } from "src/types/Project";
import { CustomFieldOption } from "src/types/CustomFieldOption";
import { IssueTypeFieldOptionMappings, ProjectFieldOptionMappings } from "src/types/ProjectFieldOptionMappings";


export const findProjectByKey = async (projectKey: string): Promise<DataRetrievalResponse<Project>> => {
  try {
    const project = await jiraDataModel.getProjectByKey(projectKey);
    return new DataRetrievalResponseBuilder<Project>().setData(project).build();
  } catch (error) {
    return new DataRetrievalResponseBuilder<Project>().setErrorMessage(error.message).build();
  }
}

export const getFieldOptionsForProject = async (
  targetProjectId: string,
): Promise<DataRetrievalResponse<ProjectFieldOptionMappings>> => {
  // const fieldIdsToOptions = new Map<string, CustomFieldOption[]>();
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
      const isFieldRequired = field.required;
      const isCustomField = field.schema && field.schema.customId;
      if (isCustomField) {
        console.log(`getFieldOptionsForProject: Found custom field: ${fieldId}`);

        if (fieldId === "customfield_10091") {
          console.log(` ***** getFieldOptionsForProject: Found R2D2 Team field (customfield_10091)`);

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
        }
      } else {
        // console.log(`getFieldOptionsForProject: Skipping non-custom field: ${fieldName}`);
      }
    }
  }
  return new DataRetrievalResponseBuilder<ProjectFieldOptionMappings>()
    .setData(projectFieldOptionMappings)
    .build();
}

export const OLD_getFieldOptionsForProject = async (
  targetProjectId: string,
): Promise<DataRetrievalResponse<Map<string, CustomFieldOption[]>>> => {
  const fieldIdsToOptions = new Map<string, CustomFieldOption[]>();
  const projectCreateIssueMetadata = await jiraDataModel.getCreateIssueMetadataForProject(targetProjectId);
  for (const issueType of projectCreateIssueMetadata.issuetypes) {
    for (const fieldId in issueType.fields) {
      const field = issueType.fields[fieldId];
      const isFieldRequired = field.required;
      const isCustomField = field.schema && field.schema.customId;
      if (isCustomField) {
        console.log(`getFieldOptionsForProject: Found custom field: ${fieldId}`);

        if (fieldId === "customfield_10091") {
          console.log(` ***** getFieldOptionsForProject: Found R2D2 Team field (customfield_10091)`);

        }

        if (field.allowedValues) {
          for (const allowedValue of field.allowedValues) {
            if (allowedValue.value) {
              const customFieldOption: CustomFieldOption = {
                id: allowedValue.id,
                name: allowedValue.value,
              };
              const existingOptions = fieldIdsToOptions.get(fieldId);
              if (existingOptions) {
                existingOptions.push(customFieldOption);
              } else {
                fieldIdsToOptions.set(fieldId, [customFieldOption]);
              }
            } else {
              console.log(`getFieldOptionsForProject: Skipping allowed value without a value: ${JSON.stringify(allowedValue)}`);
            }
          }
        }
      } else {
        // console.log(`getFieldOptionsForProject: Skipping non-custom field: ${fieldName}`);
      }
    }
  }
  return new DataRetrievalResponseBuilder<Map<string, CustomFieldOption[]>>()
      .setData(fieldIdsToOptions)
      .build();

  // return fieldIdsToOptions;





  // // const matchingField: Field = allFields.find(field => field.name === fieldName);

  // // if (!matchingField) {
  // //   return new DataRetrievalResponseBuilder<Map<string, CustomFieldOption[]>>()
  // //     .setErrorMessage(`Unable to find field "${fieldName}".`)
  // //     .build();
  // // }

  // // const contextIds: string[] = [];
  // // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-contexts/#api-rest-api-3-field-fieldid-context-projectmapping-get
  // const allCustomFieldContextProjectMappings: ProjectCustomFieldContextMappings[] =
  //   await jiraDataModel.getAllCustomFieldContextProjectMappings(matchingField.id, contextIds);

  // // Pass onlyOptions = true
  // const customFieldContextProjectMappingsForTargetProject = allCustomFieldContextProjectMappings.find((mapping) => {
  //   return mapping.projectId === targetProjectId;
  // });

  // if (!customFieldContextProjectMappingsForTargetProject) {
  //   return new DataRetrievalResponseBuilder<Map<string, CustomFieldOption[]>>()
  //     .setErrorMessage(`Unable to find custom field context for project "${targetProjectId}" with field name ${fieldName}.`)
  //     .build();
  // }





  // const fieldConfigurationScheme = await jiraDataModel.getFieldConfigurationSchemeForProject(targetProjectId);
  // if (!fieldConfigurationScheme) {
  //   // Field configuration schemes for team-managed projects are not returned.
  //   return new DataRetrievalResponseBuilder<Map<string, CustomFieldOption[]>>()
  //     .setData(fieldIdsToOptions)
  //     .build();
  // }


  // // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfigurationscheme-mapping-get




  // // TODO: ????????????
  // const fieldConfigurationId = fieldConfigurationScheme.id;
  
  
  
  
  // const fieldConfigurationItems = await jiraDataModel.getAllFieldConfigurationItems(fieldConfigurationId);
  // for (const fieldConfigurationItem of fieldConfigurationItems) {
  //   const fieldId = dddd ;
  //   if (!includeRequiredFieldsOnly || (includeRequiredFieldsOnly && fieldConfigurationItem.isRequired)) {

  //     const onlyOptions = true;
  //     const options = await jiraDataModel.getAllCustomFieldOptions(fieldId, contextId, onlyOptions);

  //     fieldIdsToOptions.set(fieldConfigurationItem.id, options);
  //   }
  // }
  // return new DataRetrievalResponseBuilder<Map<string, CustomFieldOption[]>>()
  //   .setData(fieldIdsToOptions)
  //   .build();

}







// const getCustomFieldAndOptionsInProjectByName = async (
//   targetProjectId: string,
//   fieldName: string,
//   allFields: Field[],
//   includeRequiredFieldsOnly: boolean = true
// ): Promise<DataRetrievalResponse<CustomFieldContextOption[]>> => {
  
//   // const matchingField: Field = allFields.filter(field => field.name === fieldName);
//   const matchingField: Field = allFields.find(field => field.name === fieldName);

//   if (!matchingField) {
//     return new DataRetrievalResponseBuilder<CustomFieldContextOption[]>()
//       .setErrorMessage(`Unable to find field "${fieldName}".`)
//       .build();
//   }

//   const contextIds: string[] = [];
//   // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-contexts/#api-rest-api-3-field-fieldid-context-projectmapping-get
//   const allCustomFieldContextProjectMappings: ProjectCustomFieldContextMappings[] =
//     await jiraDataModel.getAllCustomFieldContextProjectMappings(matchingField.id, contextIds);

//   // Pass onlyOptions = true
//   const customFieldContextProjectMappingsForTargetProject = allCustomFieldContextProjectMappings.find((mapping) => {
//     return mapping.projectId === targetProjectId;
//   });

//   if (!customFieldContextProjectMappingsForTargetProject) {
//     return new DataRetrievalResponseBuilder<CustomFieldContextOption[]>()
//       .setErrorMessage(`Unable to find custom field context for project "${targetProjectId}" with field name ${fieldName}.`)
//       .build();
//   }

//   const fieldConfigurationScheme = await jiraDataModel.getFieldConfigurationSchemeForProject(targetProjectId);
//   if (!fieldConfigurationScheme) {
//     // Field configuration schemes for team-managed projects are not returned.
//     return new DataRetrievalResponseBuilder<CustomFieldContextOption[]>()
//       .setData([])
//       .build();
//   }

//   const fieldConfigurationItems = await jiraDataModel.getAllFieldConfigurationItems(fieldConfigurationScheme.id);
//   const fieldIdsToOptions = new Map<string, CustomFieldOption[]>();
//   for (const item of fieldConfigurationItems) {
//     if (item.id === matchingField.id) {
//       // This is the field we are interested in
//       const options = await jiraDataModel.getCustomFieldOptionsForFieldConfigurationItem(item.id);
//       fieldIdsToOptions.set(item.fieldId, options);
//     }
//   }

//   if (!fieldConfigurationSchemes.fieldConfigurationSchemeMappings) {
//     return new DataRetrievalResponseBuilder<CustomFieldContextOption[]>()
//       .setErrorMessage(`No field configuration scheme mappings found for project ${targetProjectId}.`)
//       .build();

//   }

  // getAllFieldConfigurationItems

  // projectFieldConfigurationScheme

  // Since only 

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-options/#api-rest-api-3-field-fieldid-context-contextid-option-get
//   const customFieldOptions = await jiraDataModel.getAllCustomFieldOptions(matchingField.id, customFieldContextProjectMappingsForTargetProject.contextId);
//   return new DataRetrievalResponseBuilder<CustomFieldContextOption[]>()
//     .setData(customFieldOptions)
//     .build();
// }

// const findMappingForProject = (
//   targetProjectId: number,
//   mappings: ProjectsFieldConfigurationSchemeMapping[]):
// ProjectsFieldConfigurationSchemeMapping => {
//   for (const mapping of mappings) {
//     const projectInMapping = mapping.projectIds.includes(targetProjectId);
//     if (projectInMapping) {
//       return mapping;
//     }
//   }
//   return undefined;
// }