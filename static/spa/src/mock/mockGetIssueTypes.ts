
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-types/#api-rest-api-3-issuetype-get

import { IssueType } from "../types/IssueType"

export const getIssueTypes = async (projectId: string) => {
  const allIssueTypes: IssueType[] = [
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10036",
      id: "10036",
      description: "Subtasks track small pieces of work that are part of a larger task.",
      iconUrl: "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10316?size=medium",
      name: "Subtask",
      untranslatedName: "Subtask",
      subtask: true,
      avatarId: 10316,
      hierarchyLevel: -1,
      scope: {
        type: "PROJECT",
        project: {
          id: "10033"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10003",
      "id": "10003",
      "description": "A small piece of work that's part of a larger task.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10316?size=medium",
      "name": "Sub-task",
      "untranslatedName": "Sub-task",
      "subtask": true,
      "avatarId": 10316,
      "hierarchyLevel": -1
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10039",
      "id": "10039",
      "description": "Subtasks track small pieces of work that are part of a larger task.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10316?size=medium",
      "name": "Subtask",
      "untranslatedName": "Subtask",
      "subtask": true,
      "avatarId": 10316,
      "hierarchyLevel": -1,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10034"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10002",
      "id": "10002",
      "description": "A small, distinct piece of work.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      "name": "Task",
      "untranslatedName": "Task",
      "subtask": false,
      "avatarId": 10318,
      "hierarchyLevel": 0
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10040",
      "id": "10040",
      "description": "Bugs track problems or errors.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
      "name": "Bug",
      "untranslatedName": "Bug",
      "subtask": false,
      "avatarId": 10303,
      "hierarchyLevel": 0,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10033"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10034",
      "id": "10034",
      "description": "Tasks track small, distinct pieces of work.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      "name": "Task",
      "untranslatedName": "Task",
      "subtask": false,
      "avatarId": 10318,
      "hierarchyLevel": 0,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10033"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10004",
      "id": "10004",
      "description": "A problem or error.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium",
      "name": "Bug",
      "untranslatedName": "Bug",
      "subtask": false,
      "avatarId": 10303,
      "hierarchyLevel": 0
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10037",
      "id": "10037",
      "description": "Tasks track small, distinct pieces of work.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      "name": "Task",
      "untranslatedName": "Task",
      "subtask": false,
      "avatarId": 10318,
      "hierarchyLevel": 0,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10034"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10001",
      "id": "10001",
      "description": "Functionality or a feature expressed as a user goal.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium",
      "name": "Story",
      "untranslatedName": "Story",
      "subtask": false,
      "avatarId": 10315,
      "hierarchyLevel": 0
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10038",
      "id": "10038",
      "description": "Epics track collections of related bugs, stories, and tasks.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
      "name": "Epic",
      "untranslatedName": "Epic",
      "subtask": false,
      "avatarId": 10307,
      "hierarchyLevel": 1,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10034"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10035",
      "id": "10035",
      "description": "Epics track collections of related bugs, stories, and tasks.",
      "iconUrl": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
      "name": "Epic",
      "untranslatedName": "Epic",
      "subtask": false,
      "avatarId": 10307,
      "hierarchyLevel": 1,
      "scope": {
        "type": "PROJECT",
        "project": {
          "id": "10033"
        }
      }
    },
    {
      // "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/issuetype/10000",
      "id": "10000",
      "description": "A big user story that needs to be broken down. Created by Jira Software - do not edit or delete.",
      "iconUrl": "https://workflow-enforcer-demo.atlassian.net/images/icons/issuetypes/epic.svg",
      "name": "Epic",
      "untranslatedName": "Epic",
      "subtask": false,
      "hierarchyLevel": 1
    }
  ];
  // console.log(`Getting issue types for project ID ${projectId}`);
  const matchingIssueTypes: IssueType[] = [];
  for (const issueType of allIssueTypes) {
    if (issueType.scope) {
      // console.log(` - checking issue type scope ${JSON.stringify(issueType.scope)}`);
      if (issueType.scope.project.id === projectId) {
        matchingIssueTypes.push(issueType);
      }
    } else {
      matchingIssueTypes.push(issueType);
    }
  }
  return matchingIssueTypes;
}