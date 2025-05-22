import { requestJira } from '@forge/bridge';
import { getMockProjectSearchInfo } from 'src/mock/mockGetProjects';
import { mockGetProjects } from 'src/model/frontendConfig';
import { BulkIssueMoveRequestData } from "src/types/BulkIssueMoveRequestData";
import { FieldConfigurationItem } from 'src/types/FieldConfigurationItem';
import { FieldConfigurationItemsResponse } from 'src/types/FieldConfigurationItemsResponse';
import { IssueMoveRequestOutcome } from "src/types/IssueMoveRequestOutcome";
import { IssueSearchInfo } from 'src/types/IssueSearchInfo';
import { IssueSearchParameters } from 'src/types/IssueSearchParameters';
import { ProjectSearchInfo } from 'src/types/ProjectSearchInfo';
import { ProjectsFieldConfigurationSchemeMappings } from 'src/types/ProjectsFieldConfigurationSchemeMappings';

export const getIssueSearchInfo = async (issueSearchParameters: IssueSearchParameters): Promise<IssueSearchInfo> => {

  console.log(`getIssueSearchInfo: building JQL from ${JSON.stringify(issueSearchParameters, null, 2)}`);

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

  console.log(` * built JQL: ${jql}`);
  return await getIssueSearchInfoByJql(jql);
}

export const getIssueSearchInfoByJql = async (jql: string): Promise<IssueSearchInfo> => {
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
export const fetchIssueTypese = async () => {
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
export const getLabelsInfo = async () => {
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

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-search-get
export const getProjectSearchInfo = async (query: string = '', maxResults: number = 100): Promise<ProjectSearchInfo> => {
  if (mockGetProjects) {
    return await getMockProjectSearchInfo(query, maxResults);
  } else {
    const response = await requestJira(`/rest/api/3/project/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`, {
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

export const initiateBulkIssuesMove = async (bulkIssueMoveRequestData: BulkIssueMoveRequestData): Promise<IssueMoveRequestOutcome> => {  
  const response = await requestJira(`/rest/api/3/bulk/issues/move`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bulkIssueMoveRequestData)
  });
  const outcomeData = await response.json();
  const outcome: IssueMoveRequestOutcome = Object.assign({statusCode: response.status}, outcomeData);
  console.log(`Bulk issue move request outcome: ${JSON.stringify(outcome, null, 2)}`);
  return outcome;
}


// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-tasks/#api-rest-api-3-task-taskid-get
export const getTaskOutcome = async (taskId: string): Promise<any> => {
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

export const getFieldConfigurationItemsForProjects = async (projectIds: string[]): Promise<FieldConfigurationItem[]> => {
  let allFieldConfigurationItems: FieldConfigurationItem[] = [];
  let loadMoreItems = true;
  let startAt = 0;
  let maxResultsPerPage = 50;
  while (loadMoreItems) {
    const projectsFieldConfigurationSchemeMappings = await getFieldConfigurationSchemesForProjects(projectIds, startAt, maxResultsPerPage);
    console.log(`projectsFieldConfigurationSchemeMappings = ${JSON.stringify(projectsFieldConfigurationSchemeMappings, null, 2)}`);
    for (const projectFieldConfigurationSchemeMapping of projectsFieldConfigurationSchemeMappings.values) {
      if (projectFieldConfigurationSchemeMapping.fieldConfigurationScheme) {
        const fieldConfigurationId = projectFieldConfigurationSchemeMapping.fieldConfigurationScheme.id;
        const fieldConfigurationItems = await getAllFieldConfigurationItems(fieldConfigurationId);
        for (const fieldConfigurationItem of fieldConfigurationItems) {
          allFieldConfigurationItems.push(fieldConfigurationItem);
        }
      }
    }
    loadMoreItems = !projectsFieldConfigurationSchemeMappings.isLast;
    startAt += maxResultsPerPage;
  }
  return allFieldConfigurationItems;
}

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfigurationscheme-project-get
export const getFieldConfigurationSchemesForProjects = async (
    projectIds: string[],
    startAt: number = 0,
    maxResults: number = 50
): Promise<ProjectsFieldConfigurationSchemeMappings> => {
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
  const outcome = await response.json();
  console.log(`Project field configuration schemes: ${JSON.stringify(outcome, null, 2)}`);
  return outcome;
}

export const getAllFieldConfigurationItems = async (fieldConfigurationId: string): Promise<FieldConfigurationItem[]> => {
  let allFieldConfigurationItems: FieldConfigurationItem[] = [];
  let loadMoreItems = true;
  let startAt = 0;
  let maxResultsPerPage = 50;
  while (loadMoreItems) {
    const fieldConfigurationItems = await getFieldConfigurationItems(fieldConfigurationId, startAt, maxResultsPerPage);
    for (const fieldConfigurationItem of fieldConfigurationItems.values) {
      allFieldConfigurationItems.push(fieldConfigurationItem);
    }
    loadMoreItems = !fieldConfigurationItems.isLast;
    startAt += maxResultsPerPage;
  }
  return allFieldConfigurationItems;
}

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfiguration-id-fields-get
export const getFieldConfigurationItems = async (
    fieldConfigurationId: string,
    startAt: number = 0,
    maxResults: number = 50): Promise<FieldConfigurationItemsResponse> => {
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



