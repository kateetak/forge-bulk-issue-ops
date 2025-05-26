import { requestJira } from '@forge/bridge';
import { getMockFieldConfigurationItems } from '../mock/mockGetMockFieldConfigurationItems';
import { getMockFieldConfigurationSchemesForProjects } from '../mock/mockGetMockFieldConfigurationSchemesForProjects';
import { getMockProjectSearchInfo } from '../mock/mockGetProjects';
import { mockGetFieldConfigurationItems, mockGetFieldConfigurationSchemesForProjects, mockGetProjects } from './config';
import { BulkIssueMoveRequestData } from "../types/BulkIssueMoveRequestData";
import { CustomFieldsContextItem } from '../types/CustomFieldsContextItem';
import { Field } from '../types/Field';
import { FieldConfigurationItem } from '../types/FieldConfigurationItem';
import { IssueMoveRequestOutcome } from "../types/IssueMoveRequestOutcome";
import { IssueSearchInfo } from '../types/IssueSearchInfo';
import { IssueSearchParameters } from '../types/IssueSearchParameters';
import { IssueType } from '../types/IssueType';
import { PageResponse } from '../types/PageResponse';
import { ProjectCustomFieldContextMappings, ProjectsFieldConfigurationSchemeMappings } from '../types/ProjectCustomFieldContextMappings';
import { ProjectSearchInfo } from '../types/ProjectSearchInfo';
import { ProjectsFieldConfigurationSchemeMapping } from '../types/ProjectsFieldConfigurationSchemeMapping';
import { CustomFieldContextOption } from '../types/CustomFieldContextOption';
import { Project } from '../types/Project';
import { FieldConfigurationScheme } from '../types/FieldConfigurationScheme';
import { EditIssueMetadata } from 'src/types/EditIssueMetadata';
import { CreateIssueMetadata, ProjectCreateIssueMetadata } from 'src/types/CreateIssueMetadata';
import { InvocationResult } from 'src/types/InvocationResult';

class JiraDataModel {

  private cachedIssueTypes: IssueType[] = [];
  private cachedFields: Field[] = [];
  private fieldAndContextIdsToCustomFieldContextOptions = new Map<string, CustomFieldContextOption[]>();
  private projectIdsToProjectCreateIssueMetadata = new Map<string, ProjectCreateIssueMetadata>();
  private issueIdsOrKeysToEditIssueMetadata = new Map<string, EditIssueMetadata>();

  constructor() {
    // Eagerly load cachable data is separate threads in order for it to be faster to
    // load when needed...
    setTimeout(this.getissueTypes);
    setTimeout(this.getAllFields);
  }

  // TODO: Implement memoization
  getissueTypes = async (): Promise<IssueType[]> => {
    if (this.cachedIssueTypes.length === 0) {
      // this.cachedIssueTypes = await invoke('getIssueTypes');
      this.cachedIssueTypes = await this.fetchIssueTypes();
    }
    return this.cachedIssueTypes;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-fields/#api-rest-api-3-field-get
  getAllFields = async (): Promise<Field[]> => {
    if (this.cachedFields.length === 0) {
      const path = `/rest/api/3/field`;
      const response = await requestJira(path, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      this.cachedFields = await response.json();
      // console.log(`Fields: ${JSON.stringify(this.cachedFields, null, 2)}`);
    }
    return this.cachedFields;
  }

  getIssueSearchInfo = async (issueSearchParameters: IssueSearchParameters): Promise<IssueSearchInfo> => {
    // console.log(`getIssueSearchInfo: building JQL from ${JSON.stringify(issueSearchParameters, null, 2)}`);
    let jql = '';
    if (issueSearchParameters.projects.length) {
      const projectIdsCsv = issueSearchParameters.projects.map(project => project.id).join(',');
      jql += `project in (${projectIdsCsv})`;
    }
    if (issueSearchParameters.issueTypes.length) {
      const issueTypeIdsCsv = issueSearchParameters.issueTypes.map(issueType => issueType.id).join(',');
      jql += ` and issuetype in (${issueTypeIdsCsv})`;
    }

    if (issueSearchParameters.labels.length) {
      const labelsCsv = issueSearchParameters.labels.join(',');
      jql += ` and labels in (${labelsCsv})`;
    }
    // console.log(` * built JQL: ${jql}`);
    return await this.getIssueSearchInfoByJql(jql);
  }
  
  getIssueSearchInfoByJql = async (jql: string): Promise<IssueSearchInfo> => {
    const maxResults = 100;
    // Note that the following limits the amount of fields to be returned for performance reasons, but
    // also could result in certain fields in the Issue type not being populated if these fields do 
    // not cover them all.
    const fields = 'summary,description,issuetype';
    const expand = 'renderedFields';
    // console.log(` * jql=${jql}`);
    const paramsString = `jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=${fields}&expand=${expand}`;
    // console.log(` * paramsString = ${paramsString}`);
    const queryParams = new URLSearchParams(paramsString);
    const response = await requestJira(`/rest/api/3/search/jql?${queryParams}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const issuesSearchInfo = await response.json();
    // console.log(`issuesSearchInfo: ${JSON.stringify(issuesSearchInfo, null, 2)}`);
    return issuesSearchInfo;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-types/#api-rest-api-3-issuetype-get
  fetchIssueTypes = async () => {
    const response = await requestJira(`/rest/api/3/issuetype`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const issueTypes = await response.json();
    // console.log(`Issue Types: ${JSON.stringify(issueTypes, null, 2)}`);
    return issueTypes;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-labels/#api-rest-api-3-label-get
  getLabelsInfo = async () => {
    const response = await requestJira(`/rest/api/3/label`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    // console.log(`Response: ${response.status} ${response.statusText}`);
    const labels = await response.json();
    // console.log(`Labels: ${JSON.stringify(labels, null, 2)}`);
    return labels;
  }

  getCreateIssueMetadataForProject = async (projectId: string): Promise<ProjectCreateIssueMetadata> => {
    const cachedCreateIssueMetadata = this.projectIdsToProjectCreateIssueMetadata.get(projectId);
    if (cachedCreateIssueMetadata) {
      return cachedCreateIssueMetadata;
    } else {
      const response = await requestJira(`/rest/api/3/issue/createmeta?projectIds=${projectId}&expand=projects.issuetypes.fields`, {
        headers: {
          'Accept': 'application/json'
        }
      });      
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const createIssueMetadata = await response.json() as CreateIssueMetadata;
      if (createIssueMetadata.projects && createIssueMetadata.projects.length === 1) {
        // const CreateIssueMetadata = createIssueMetadata as CreateIssueMetadata;

        const projectCreateIssueMetadata = createIssueMetadata.projects[0];
        this.projectIdsToProjectCreateIssueMetadata.set(projectId, projectCreateIssueMetadata);
        // console.log(`Project createIssueMetadata: ${JSON.stringify(projects, null, 2)}`);
        return projectCreateIssueMetadata;
      } else {
        throw new Error(`Expected exactly one project in create issue metadata for projectId ${projectId}: ${JSON.stringify(createIssueMetadata)}`, );
      }
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-editmeta-get
  getEditIssueMetadata = async (issueIdOrKey: string): Promise<EditIssueMetadata> => {
    const cachedEditIssueMetadata = this.issueIdsOrKeysToEditIssueMetadata.get(issueIdOrKey);
    if (cachedEditIssueMetadata) {
      return cachedEditIssueMetadata;
    } else {
      const response = await requestJira(`/rest/api/3/issue/${issueIdOrKey}/editmeta`, {
        headers: {
          'Accept': 'application/json'
        }
      });      
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const editIssueMetadata = await response.json();
      this.issueIdsOrKeysToEditIssueMetadata.set(issueIdOrKey, editIssueMetadata);
      // console.log(`Projects: ${JSON.stringify(projects, null, 2)}`);
      return editIssueMetadata;
    }
  }
  
  getProjectByKey = async (targetProjectKey: string): Promise<undefined | Project> => {
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const projectSearchInfo = await this.pageOfProjectSearchInfo(targetProjectKey, startAt, maxResultsPerPage);
      for (const project of projectSearchInfo.values) {
        if (project.key === targetProjectKey) {
          return project;
        }
      }
      loadMoreItems = !projectSearchInfo.isLast;
      startAt += maxResultsPerPage;
    }
    return undefined;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-search-get
  pageOfProjectSearchInfo = async (query: string = '', startAt: number = 0, maxResults: number = 100): Promise<ProjectSearchInfo> => {
    if (mockGetProjects) {
      return await getMockProjectSearchInfo(query, maxResults);
    } else {
      const response = await requestJira(`/rest/api/3/project/search?query=${encodeURIComponent(query)}&startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const projects = await response.json();
      // console.log(`Projects: ${JSON.stringify(projects, null, 2)}`);
      return projects;
    }
  }
  
  initiateBulkIssuesMove = async (bulkIssueMoveRequestData: BulkIssueMoveRequestData): Promise<InvocationResult<IssueMoveRequestOutcome>> => {  
    const response = await requestJira(`/rest/api/3/bulk/issues/move`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkIssueMoveRequestData)
    });
    const invocationResult: InvocationResult<IssueMoveRequestOutcome> = await this.readResponse<IssueMoveRequestOutcome>(response);
    console.log(`Bulk issue move invocation result: ${JSON.stringify(invocationResult, null, 2)}`);
    return invocationResult;


    // const outcomeData = await response.json();
    // const outcome: IssueMoveRequestOutcome = Object.assign({statusCode: response.status}, outcomeData);
    // console.log(`Bulk issue move request outcome: ${JSON.stringify(outcome, null, 2)}`);
    // return outcome;
  }

  readResponse = async <T>(response: any): Promise<InvocationResult<T>> => {
    const invocationResult: InvocationResult<T> = {
      ok: response.ok,
      status: response.status
    }
    if (response.ok) {
      const data = await response.json();
      invocationResult.data = data as T;
    } else {
      const errorMessage = await response.text();
      // console.error(`Error response: ${errorText}`);
      invocationResult.errorMessage = errorMessage;
    }
    return invocationResult;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-tasks/#api-rest-api-3-task-taskid-get
  getTaskOutcome = async (taskId: string): Promise<any> => {
    const response = await requestJira(`/rest/api/3/task/${taskId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
   
    // console.log(`Response: ${response.status} ${response.statusText}`);
    const outcome = await response.json();
    console.log(`Task outcome: ${JSON.stringify(outcome, null, 2)}`);
    return outcome;
  }
  
  // getFieldConfigurationSchemesForProjects = async (
  //   projectIds: string[]):
  // Promise<FieldConfigurationItem[]> => {
  //   const allFieldConfigurationItems: FieldConfigurationItem[] = [];
  //   let loadMoreItems = true;
  //   let startAt = 0;
  //   let maxResultsPerPage = 50;
  //   while (loadMoreItems) {
  //     const projectsFieldConfigurationSchemeMappings = await this.pageOfFieldConfigurationSchemesForProjects(
  //       projectIds, startAt, maxResultsPerPage);
  //     console.log(`projectsFieldConfigurationSchemeMappings = ${JSON.stringify(projectsFieldConfigurationSchemeMappings, null, 2)}`);
  //     for (const projectFieldConfigurationSchemeMapping of projectsFieldConfigurationSchemeMappings.values) {
  //       if (projectFieldConfigurationSchemeMapping.fieldConfigurationScheme) {
  //         const fieldConfigurationId = projectFieldConfigurationSchemeMapping.fieldConfigurationScheme.id;
  //         const fieldConfigurationItems = await this.getAllFieldConfigurationItems(fieldConfigurationId);
  //         for (const fieldConfigurationItem of fieldConfigurationItems) {
  //           allFieldConfigurationItems.push(fieldConfigurationItem);
  //         }
  //       }
  //     }
  //     loadMoreItems = !projectsFieldConfigurationSchemeMappings.isLast;
  //     startAt += maxResultsPerPage;
  //   }
  //   return allFieldConfigurationItems;
  // }
  
  getFieldConfigurationSchemeForProject = async (
    projectId: string):
  Promise<undefined | FieldConfigurationScheme> => {
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const projectsFieldConfigurationSchemeMappings = await this.pageOfFieldConfigurationSchemesForProjects(
        [projectId], startAt, maxResultsPerPage);
      console.log(`projectsFieldConfigurationSchemeMappings = ${JSON.stringify(projectsFieldConfigurationSchemeMappings, null, 2)}`);
      for (const projectFieldConfigurationSchemeMapping of projectsFieldConfigurationSchemeMappings.values) {
        if (projectFieldConfigurationSchemeMapping.projectIds.includes(projectId)) {
          return projectFieldConfigurationSchemeMapping.fieldConfigurationScheme;
        }
      }
      loadMoreItems = !projectsFieldConfigurationSchemeMappings.isLast;
      startAt += maxResultsPerPage;
    }
    return undefined;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfigurationscheme-project-get
  pageOfFieldConfigurationSchemesForProjects = async (
      projectIds: string[],
      startAt: number = 0,
      maxResults: number = 50
  ): Promise<PageResponse<ProjectsFieldConfigurationSchemeMapping>> => {
    if (mockGetFieldConfigurationSchemesForProjects) {
      return await getMockFieldConfigurationSchemesForProjects(projectIds, startAt, maxResults);
    } else {
      let projectQueryArgs = '';
      let nextSeparator = '';
      for (const projectId of projectIds) {
        projectQueryArgs += `${nextSeparator}projectId=${projectId}`;
        nextSeparator = '&';
      }
      const response = await requestJira(`/rest/api/3/fieldconfigurationscheme/project?${projectQueryArgs}&startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const outcome = await response.json() as PageResponse<ProjectsFieldConfigurationSchemeMapping>;
      console.log(`Project field configuration schemes: ${JSON.stringify(outcome, null, 2)}`);
      return outcome;  
    }
  }
  
  getAllFieldConfigurationItems = async (
    fieldConfigurationId: string):
  Promise<FieldConfigurationItem[]> => {
    const allItems: FieldConfigurationItem[] = [];
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const pageItems = await this.pageOfFieldConfigurationItems(fieldConfigurationId, startAt, maxResultsPerPage);
      for (const fieldConfigurationItem of pageItems.values) {
        allItems.push(fieldConfigurationItem);
      }
      loadMoreItems = !pageItems.isLast;
      startAt += maxResultsPerPage;
    }
    return allItems;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfiguration-id-fields-get
  private pageOfFieldConfigurationItems = async (
    fieldConfigurationId: string,
    startAt: number = 0,
    maxResults: number = 50):
  Promise<PageResponse<FieldConfigurationItem>> => {
    if (mockGetFieldConfigurationItems) {
      return await getMockFieldConfigurationItems(fieldConfigurationId, startAt, maxResults);
    } else {
      const response = await requestJira(`/rest/api/3/fieldconfiguration/${fieldConfigurationId}/fields?startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const outcome = await response.json();
      console.log(`Field configuration items: ${JSON.stringify(outcome, null, 2)}`);
      return outcome;
    }
  }
  
  getAllCustomFieldContextProjectMappings = async (
    fieldId: string,
    contextIds: string[]):
  Promise<ProjectCustomFieldContextMappings[]> => {
    const allItems: ProjectCustomFieldContextMappings[] = [];
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const pageItems = await this.pageOfCustomFieldContextProjectMappings(fieldId, contextIds, startAt, maxResultsPerPage);
      for (const fieldConfigurationItem of pageItems.values) {
        allItems.push(fieldConfigurationItem);
      }
      loadMoreItems = !pageItems.isLast;
      startAt += maxResultsPerPage;
    }
    return allItems;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-contexts/#api-rest-api-3-field-fieldid-context-projectmapping-get
  private pageOfCustomFieldContextProjectMappings = async (
    fieldId: string,
    contextIds: string[],  
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<PageResponse<ProjectCustomFieldContextMappings>> => {
    let path = `/rest/api/3/field/${fieldId}/context/projectmapping?startAt=${startAt}&maxResults=${maxResults}`;
    for (const contextId of contextIds) {
      path += `&contextId=${contextId}`;
    }
    const response = await requestJira(path, {
      headers: {
        'Accept': 'application/json'
      }
    });
    // console.log(`Response: ${response.status} ${response.statusText}`);
    const outcome = await response.json();
    console.log(`Custom field context project mappings: ${JSON.stringify(outcome, null, 2)}`);
    return outcome;
  }
  
  getAllCustomFieldContexts = async (
    fieldId: string,
    isGlobalContext: boolean):
  Promise<CustomFieldsContextItem[]> => {
    const allItems: CustomFieldsContextItem[] = [];
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const pageItems = await this.pageOfCustomFieldContexts(fieldId, isGlobalContext, maxResultsPerPage);
      for (const fieldConfigurationItem of pageItems.values) {
        allItems.push(fieldConfigurationItem);
      }
      loadMoreItems = !pageItems.isLast;
      startAt += maxResultsPerPage;
    }
    return allItems;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-contexts/#api-rest-api-3-field-fieldid-context-get
  private pageOfCustomFieldContexts = async (
    fieldId: string,
    isGlobalContext: boolean,
    startAt: number = 0,
    maxResults: number = 50):
  Promise<PageResponse<CustomFieldsContextItem>> => {
    const response = await requestJira(`/rest/api/3/field/${fieldId}/context?startAt=${startAt}&maxResults=${maxResults}&isGlobalContext=${isGlobalContext}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    // console.log(`Response: ${response.status} ${response.statusText}`);
    const outcome = await response.json();
    console.log(`getCustomFieldContexts response: ${JSON.stringify(outcome, null, 2)}`);
    return outcome;
  }
  
  getAllCustomFieldOptions = async (
    fieldId: string,
    contextId: string,
    onlyOptions: boolean = false
  ): Promise<CustomFieldContextOption[]> => {
    const key = `${fieldId}-${contextId}-${onlyOptions}`;
    const existingOptions = this.fieldAndContextIdsToCustomFieldContextOptions.get(key);
    if (existingOptions) {
      return existingOptions;
    } else {
      const allItems: CustomFieldContextOption[] = [];
      let loadMoreOptions = true;
      let startAt = 0;
      let maxResultsPerPage = 50;
      while (loadMoreOptions) {
        const pageOptions = await this.pageOfCustomFieldOptions(fieldId, contextId, onlyOptions, startAt, maxResultsPerPage);
        for (const option of pageOptions.values) {
          allItems.push(option);
        }
        loadMoreOptions = !pageOptions.isLast;
        startAt += maxResultsPerPage;
      }
      this.fieldAndContextIdsToCustomFieldContextOptions.set(key, allItems);
      return allItems;
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-options/#api-rest-api-3-field-fieldid-context-contextid-option-get
  pageOfCustomFieldOptions = async (
    fieldId: string,
    contextId: string,
    onlyOptions: boolean = false,
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<PageResponse<CustomFieldContextOption>> => {
    const response = await requestJira(`/rest/api/3/field/${fieldId}/context/${contextId}/option?onlyOptions=${onlyOptions}&startAt=${startAt}&maxResults=${maxResults}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const outcome = await response.json();
    return outcome;
  }

}

export default new JiraDataModel();


