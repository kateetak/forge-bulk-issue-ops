import { Project } from "../types/Project";
import { ProjectSearchInfo } from "../types/ProjectSearchInfo"

const buildMockProjects = (query: string, maxResults: number): Project[] => {
  const dummyProjects: Project[] = [];
  const resultCount = Math.round(Math.random() * maxResults);
  const prefix = query;
  for (let i = 0; i < resultCount; i++) {
    const project: Project = {
      id: `${10000 + i}`,
      name: `${prefix}${i + 1}`,
      key: `PPP${i}`,
      issueTypes: [],
      projectTypeKey: 'software',
      simplified: false,
      style: 'classic',
      isPrivate: false,
      properties: {},
    };
    dummyProjects.push(project);
  }
  return dummyProjects;
}

const simulateDelay = (millis: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, millis);
  });
}

export const getMockProjectSearchInfo = async (query: string, maxResults: number): Promise<ProjectSearchInfo> => {
  const mockProjects = buildMockProjects(query, maxResults);
  await simulateDelay(3000);
  const projectSearchInfo: ProjectSearchInfo = {
    maxResults: maxResults,
    startAt: 0,
    total: mockProjects.length,
    isLast: true,
    values: mockProjects
  }
  return projectSearchInfo;
}

// export const getProjectSearchInfo = async (): Promise<ProjectSearchInfo> => {
//   const projectSearchInfo: ProjectSearchInfo = {
//     // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/project/search?maxResults=50&startAt=0",
//     "maxResults": 50,
//     "startAt": 0,
//     "total": 4,
//     "isLast": true,

//     // id: string; // e.g. "10000",
//     // key: string; // e.g. "FEAT",
//     // name: string; // e.g. "Features",
//     // projectTypeKey: string; // e.g. "software",
//     // simplified: boolean; // e.g. false,
//     // style: string; // e.g. "classic",

//     "values": [
//       {
//         // "expand": "description,lead,issueTypes,url,projectKeys,permissions,insight",
//         // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/project/10000",
//         "id": "10000",
//         "key": "FEAT",
//         "name": "Features",
//         // "avatarUrls": {
//         //   "48x48": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10413",
//         //   "24x24": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=small",
//         //   "16x16": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=xsmall",
//         //   "32x32": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=medium"
//         // },
//         "projectTypeKey": "software",
//         "simplified": false,
//         "style": "classic",
//         "isPrivate": false,
//         "properties": {}
//       },
//       {
//         // "expand": "description,lead,issueTypes,url,projectKeys,permissions,insight",
//         // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/project/10001",
//         "id": "10001",
//         "key": "FT",
//         "name": "Feature Tests",
//         // "avatarUrls": {
//         //   "48x48": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10412",
//         //   "24x24": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10412?size=small",
//         //   "16x16": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10412?size=xsmall",
//         //   "32x32": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10412?size=medium"
//         // },
//         "projectTypeKey": "software",
//         "simplified": false,
//         "style": "classic",
//         "isPrivate": false,
//         "properties": {}
//       },
//       {
//         // "expand": "description,lead,issueTypes,url,projectKeys,permissions,insight",
//         // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/project/10033",
//         "id": "10033",
//         "key": "TEAMA",
//         "name": "Team A Project",
//         // "avatarUrls": {
//         //   "48x48": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10409",
//         //   "24x24": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10409?size=small",
//         //   "16x16": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10409?size=xsmall",
//         //   "32x32": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10409?size=medium"
//         // },
//         "projectTypeKey": "software",
//         "simplified": true,
//         "style": "next-gen",
//         "isPrivate": false,
//         "properties": {},
//         // "entityId": "273c3eb3-dde1-4b3f-84a7-d20e2d977976",
//         // "uuid": "273c3eb3-dde1-4b3f-84a7-d20e2d977976"
//       },
//       {
//         // "expand": "description,lead,issueTypes,url,projectKeys,permissions,insight",
//         // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/project/10034",
//         "id": "10034",
//         "key": "TEAMB",
//         "name": "Team B Project",
//         // "avatarUrls": {
//         //   "48x48": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10400",
//         //   "24x24": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10400?size=small",
//         //   "16x16": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10400?size=xsmall",
//         //   "32x32": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/universal_avatar/view/type/project/avatar/10400?size=medium"
//         // },
//         "projectTypeKey": "software",
//         "simplified": true,
//         "style": "next-gen",
//         "isPrivate": false,
//         "properties": {},
//         // "entityId": "9aa454cd-9717-4496-9b55-8470e89b3453",
//         // "uuid": "9aa454cd-9717-4496-9b55-8470e89b3453"
//       }
//     ]
//   }
//   return projectSearchInfo;
// }