import { requestJira } from '@forge/bridge';
import { invoke } from '@forge/bridge';
import { getMockFieldConfigurationItems } from '../mock/mockGetMockFieldConfigurationItems';
import { getMockFieldConfigurationSchemesForProjects } from '../mock/mockGetMockFieldConfigurationSchemesForProjects';
import { getMockProjectSearchInfo } from '../mock/mockGetProjects';
import { invokeBulkOpsApisAsTheAppUser, mockGetFieldConfigurationItems, mockGetFieldConfigurationSchemesForProjects, mockGetProjects } from './config';
import { BulkIssueMoveRequestData } from "../types/BulkIssueMoveRequestData";
import { CustomFieldsContextItem } from '../types/CustomFieldsContextItem';
import { Field } from '../types/Field';
import { FieldConfigurationItem } from '../types/FieldConfigurationItem';
import { IssueMoveEditRequestOutcome } from "../types/IssueMoveRequestOutcome";
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
import { EditIssueMetadata } from '../types/EditIssueMetadata';
import { CreateIssueMetadata, ProjectCreateIssueMetadata } from '../types/CreateIssueMetadata';
import { InvocationResult } from '../types/InvocationResult';
import { ProjectWithIssueTypes } from '../types/ProjectWithIssueTypes';
import { IssueBulkEditFieldApiResponse, IssueBulkEditField } from '../types/IssueBulkEditFieldApiResponse';
import { Issue } from 'src/types/Issue';
import { User } from 'src/types/User';
import { BulkIssueEditRequestData } from 'src/types/BulkIssueEditRequestData';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { ProjectCategory } from 'src/types/ProjectCategory';

class JiraDataModel {

  private cachedProjectKeysToProjects = new Map<string, Project>();
  private cachedIssueTypes: IssueType[] = [];
  private cachedFields: Field[] = [];
  private fieldAndContextIdsToCustomFieldContextOptions = new Map<string, CustomFieldContextOption[]>();
  private projectIdsToProjectCreateIssueMetadata = new Map<string, ProjectCreateIssueMetadata>();
  private issueIdsOrKeysToEditIssueMetadata = new Map<string, EditIssueMetadata>();
  private labelPagesToLabels: ObjectMapping<string[]> = {};

  // It is assumed project categories will not change during the a user session of using the app.
  private cachedProjectCategoriesResponse: InvocationResult<ProjectCategory[]> = {
    ok: false,
    status: 0,
    data: [],
    errorMessage: 'Not yet fetched'
  };


  // This cache can not be changed to be on a per page basis since each page of results includes a cursor that
  // only makes sense for the entire set of results.
  private projectAndIssueTypeIdsToIssueBulkEditFields = new Map<string, IssueBulkEditField[]>();

  constructor() {
    // Eagerly load cachable data is separate threads in order for it to be faster to
    // load when needed...
    setTimeout(this.getissueTypes);
    setTimeout(this.getAllFields);
  }

  // TODO: Implement memoization
  public getissueTypes = async (): Promise<IssueType[]> => {
    if (this.cachedIssueTypes.length === 0) {
      this.cachedIssueTypes = await this.fetchIssueTypes();
    }
    return this.cachedIssueTypes;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-fields/#api-rest-api-3-field-get
  public getAllFields = async (): Promise<Field[]> => {
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

  public getIssueSearchInfo = async (issueSearchParameters: IssueSearchParameters): Promise<IssueSearchInfo> => {
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
  
  public getIssueSearchInfoByJql = async (jql: string): Promise<IssueSearchInfo> => {
    const maxResults = 100;
    // Note that the following limits the amount of fields to be returned for performance reasons, but
    // also could result in certain fields in the Issue type not being populated if these fields do 
    // not cover them all.
    const fields = 'summary,description,issuetype,project';
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
  public fetchIssueTypes = async () => {
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
  public getAllLabels = async () => {
    // const maxResultsPerPage = 1000;
    const maxResultsPerPage = 1000;
    let startAt = 0;
    let allLabels: string[] = [];
    let index = 0;
    while (true && index < 3) {
      const labelsPage = await this.pageOfLabels(startAt, maxResultsPerPage);
      allLabels = allLabels.concat(labelsPage.values);
      if (labelsPage.isLast) {
        break;
      }
      startAt += maxResultsPerPage;
      index++;
    }
    // console.log(`getAllLabels: All labels: ${JSON.stringify(allLabels, null, 2)}`);
    return allLabels;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-labels/#api-rest-api-3-label-get
  private pageOfLabels = async (startAt: number, maxResults: number) => {
    const cacheKey = `page-${startAt}-${maxResults}`;
    const cachedLabels = this.labelPagesToLabels[cacheKey];
    if (cachedLabels) {
      return cachedLabels;
    } else {
      const response = await requestJira(`/rest/api/3/label?startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const labelsPage = await response.json();
      // console.log(`Labels: ${JSON.stringify(labels, null, 2)}`);
      this.labelPagesToLabels[cacheKey] = labelsPage;
      console.log(`getAllLabels: Page labels: ${JSON.stringify(labelsPage, null, 2)}`);
      return labelsPage;
    }
  }

  public getAllProjectCategories = async (): Promise<InvocationResult<ProjectCategory[]>> => {
    if (this.cachedProjectCategoriesResponse.ok) {
      return this.cachedProjectCategoriesResponse;
    } else {
      const response = await requestJira(`/rest/api/3/projectCategory`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const invocationResult = await this.readResponse<ProjectCategory[]>(response);
      if (invocationResult.ok) {
        this.cachedProjectCategoriesResponse = invocationResult;
      }
      // console.log(`Project Categories: ${JSON.stringify(invocationResult, null, 2)}`);
      return invocationResult;
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get
  // KNOWN-1: This API has been deprecated, however, there appears to be no follow through. See https://developer.atlassian.com/changelog/#CHANGE-1304.
  public getCreateIssueMetadataForProject = async (projectId: string): Promise<ProjectCreateIssueMetadata> => {
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
        const projectCreateIssueMetadata = createIssueMetadata.projects[0];
        this.projectIdsToProjectCreateIssueMetadata.set(projectId, projectCreateIssueMetadata);
        // console.log(`Project createIssueMetadata: ${JSON.stringify(projectCreateIssueMetadata, null, 2)}`);
        return projectCreateIssueMetadata;
      } else {
        throw new Error(`Expected exactly one project in create issue metadata for projectId ${projectId}: ${JSON.stringify(createIssueMetadata)}`, );
      }
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-editmeta-get
  public getEditIssueMetadata = async (issueIdOrKey: string): Promise<EditIssueMetadata> => {
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

  public getProjectByKey = async (targetProjectKey: string): Promise<undefined | Project> => {
    const cachedProject = this.cachedProjectKeysToProjects.get(targetProjectKey);
    if (cachedProject) {
      return cachedProject;
    }
    let loadMoreItems = true;
    let startAt = 0;
    let maxResultsPerPage = 50;
    while (loadMoreItems) {
      const projectSearchInfo = await this.pageOfProjectSearchInfo(targetProjectKey, startAt, maxResultsPerPage);
      const cachedProject = this.cachedProjectKeysToProjects.get(targetProjectKey);
      if (cachedProject) {
        return cachedProject;
      }
      loadMoreItems = !projectSearchInfo.isLast;
      startAt += maxResultsPerPage;
    }
    return undefined;
  }

  private cacheProjects = (projects: Project[]) => {
    for (const project of projects) {
      this.cachedProjectKeysToProjects.set(project.key, project);
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-search-get
  public pageOfProjectSearchInfo = async (
    query: string = '',
    startAt: number = 0,
    maxResults: number = 100
  ): Promise<ProjectSearchInfo> => {
    if (mockGetProjects) {
      return await getMockProjectSearchInfo(query, maxResults);
    } else {
      const response = await requestJira(`/rest/api/3/project/search?query=${encodeURIComponent(query)}&startAt=${startAt}&maxResults=${maxResults}&expand=issueTypes`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // console.log(`Response: ${response.status} ${response.statusText}`);
      const projectSearchInfo = await response.json();
      this.cacheProjects(projectSearchInfo.values);
      // console.log(`Projects: ${JSON.stringify(projects, null, 2)}`);
      return projectSearchInfo;
    }
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-user-search/#api-rest-api-3-user-search-get
  public searchUsers = async (query: string, includeAppUsers: boolean = false, startAt: number = 0, maxResults: number = 100): Promise<User[]> => {
    // console.log(`JiraDataModel.searchUsers: Searching for users with query "${query}" starting at ${startAt} with max results ${maxResults}`);
    const path = `/rest/api/3/user/search?query=${encodeURIComponent(query)}&startAt=${startAt}&maxResults=${maxResults}`;
    // console.log(`JiraDataModel.searchUsers: path = ${path}`);
    const response = await requestJira(path, {
      headers: {
        'Accept': 'application/json'
      }
    });
    // console.log(`Response: ${response.status} ${response.statusText}`);
    const users = await response.json();
    const filteredUsers = users.filter((user: User) => {
      if (!includeAppUsers && user.accountType === 'app') {
        return false;
      }
      return true;
    });
    // console.log(`Users: ${JSON.stringify(filteredUsers, null, 2)}`);
    return filteredUsers;
  }

  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-projectidorkey-get
  public getProjectById = async (projectIdOrKey: string): Promise<InvocationResult<ProjectWithIssueTypes>> => {
    const response = await requestJira(`/rest/api/3/project/${projectIdOrKey}?expand=issueTypes`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const invocationResult = await this.readResponse<ProjectWithIssueTypes>(response);
    return invocationResult;
  }
  
  public initiateBulkIssuesMove = async (
    bulkIssueMoveRequestData: BulkIssueMoveRequestData
  ): Promise<InvocationResult<IssueMoveEditRequestOutcome>> => {
    let invocationResult: InvocationResult<IssueMoveEditRequestOutcome>;
    if (invokeBulkOpsApisAsTheAppUser) {
      invocationResult = await invoke('initiateBulkMove', { bulkIssueMoveRequestData });
    } else {
      const response = await requestJira(`/rest/api/3/bulk/issues/move`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkIssueMoveRequestData)
      });
      invocationResult = await this.readResponse<IssueMoveEditRequestOutcome>(response);
    }
    console.log(`Bulk issue move invocation result: ${JSON.stringify(invocationResult, null, 2)}`);
    return invocationResult;
  }

  public initiateBulkIssuesEdit = async (
    bulkIssueEditRequestData: BulkIssueEditRequestData
  ): Promise<InvocationResult<IssueMoveEditRequestOutcome>> => {
    let invocationResult: InvocationResult<IssueMoveEditRequestOutcome>;
    if (invokeBulkOpsApisAsTheAppUser) {
      invocationResult = await invoke('initiateBulkEdit', { bulkIssueEditRequestData });
    } else {
      const response = await requestJira(`/rest/api/3/bulk/issues/fields`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkIssueEditRequestData)
      });
      invocationResult = await this.readResponse<IssueMoveEditRequestOutcome>(response);
    }
    console.log(`Bulk issue edit invocation result: ${JSON.stringify(invocationResult, null, 2)}`);
    return invocationResult;
  }

  public readResponse = async <T>(response: any): Promise<InvocationResult<T>> => {
    const invocationResult: InvocationResult<T> = {
      ok: response.ok,
      status: response.status
    }
    if (response.ok) {
      const data = await response.json();
      invocationResult.data = data as T;
    } else {
      const errorMessage = await response.text();
      console.error(`jiraDataModel.readResponse: Error response: ${errorMessage}`);
      invocationResult.errorMessage = errorMessage;
    }
    return invocationResult;
  }
  
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-tasks/#api-rest-api-3-task-taskid-get
  public getTaskOutcome = async (taskId: string): Promise<any> => {
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
  
  public getFieldConfigurationSchemeForProject = async (
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
  public pageOfFieldConfigurationSchemesForProjects = async (
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
  
  public getAllFieldConfigurationItems = async (
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
  
  public getAllCustomFieldContextProjectMappings = async (
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
  
  public getAllCustomFieldContexts = async (
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
  
  public getAllCustomFieldOptions = async (
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
  public pageOfCustomFieldOptions = async (
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

  public getAllIssueBulkEditFields = async (issues: Issue[]): Promise<IssueBulkEditField[]> => {
    const key = this.buildProjectAndIssueTypeIdsKey(issues);
    const cachedIssueBulkEditFields = this.projectAndIssueTypeIdsToIssueBulkEditFields.get(key);
    if (cachedIssueBulkEditFields) {
      return cachedIssueBulkEditFields;
    } else {
      const fields: IssueBulkEditField[] = [];
      if (issues.length === 0) {
        return fields;
      }
      let errorDetected = false;
      let loadMoreFields = true;
      let startingAfter = '';
      while (loadMoreFields) {
        const invocationResult = await this.pageOfIssueBulkEditFieldApiResponse(issues, startingAfter);
        if (invocationResult.ok) {
          if (invocationResult.data) {
            fields.push(...invocationResult.data.fields);
            startingAfter = invocationResult.data.startingAfter || '';
            loadMoreFields = startingAfter !== '';
          } else {
            console.warn(`No data in IssueBulkEditFieldApiResponse for issueIdsOrKeys: ${issues.map(issue => issue.key).join(', ')}`);
            loadMoreFields = false;
            errorDetected = true;
          }
        } else {
          console.warn(`Failed to retrieve IssueBulkEditFieldApiResponse for issueIdsOrKeys: ${issues.map(issue => issue.key).join(', ')}. Error: ${invocationResult.errorMessage}`);
          loadMoreFields = false;
          errorDetected = true;
        }
        // Delay to avoid hitting API rate limits...
        await this.delay(100);
      }
      if (!errorDetected) {
        this.projectAndIssueTypeIdsToIssueBulkEditFields.set(key, fields);
      }
      // console.log(`getAllIssueBulkEditFields: Loaded fields ${JSON.stringify(fields, null, 2)}`);
      // const taskFields = fields.filter(field => field.name.toLowerCase().indexOf('task') >= 0);
      // console.log(`getAllIssueBulkEditFields: Loaded task fields ${JSON.stringify(taskFields, null, 2)}`);
      return fields;
    }
  }

  private delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private pageOfIssueBulkEditFieldApiResponse = async (issues: Issue[], startingAfter: string): Promise<InvocationResult<IssueBulkEditFieldApiResponse>> => {
    console.log(`JiraDataModel.pageOfIssueBulkEditFieldApiResponse: Fetching fields after "${startingAfter}"...`);
    let queryOptions = '';
    for (const issue of issues) {
      const separator = queryOptions ? '&' : '?';
      queryOptions += `${separator}issueIdsOrKeys=${issue.key}`;
    }
    if (startingAfter) {
      queryOptions += `&startingAfter=${encodeURIComponent(startingAfter)}`;
    }
    // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-fields-get
    const path = `/rest/api/3/bulk/issues/fields${queryOptions}`;
    console.log(`JiraDataModel.pageOfIssueBulkEditFieldApiResponse: Fetching fields for ${issues.length} issues;- path="${path}"`);
    const response = await requestJira(path, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const invocationResult = await this.readResponse<IssueBulkEditFieldApiResponse>(response);
    return invocationResult;
  }

  private buildProjectAndIssueTypeIdsKey = (issues: Issue[]): string => {
    let key = '';
    const projectIssueTypePairs = new Set<string>();
    for (const issue of issues) {
      const projectIssueTypePair = `${issue.fields.project.id},${issue.fields.issuetype.id}`;
      if (!projectIssueTypePairs.has(projectIssueTypePair)) {
        projectIssueTypePairs.add(projectIssueTypePair);
        key += (key ? ',' : '') + projectIssueTypePair;
      }
    }
    return key;
  }

}

export default new JiraDataModel();


