import { Issue } from "../types/Issue";
import { IssueSearchInfo } from "../types/IssueSearchInfo"

export const getIssueSearchInfo = async (projectId: string): Promise<IssueSearchInfo> => {
  const issueA = {
    id: '',
    key: 'FEAT-1',
    fields: {
      summary: `My test issue`,
      description: ``,
      issuetype: {
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
      status: {
        name: ``,
        id: ``,
        description: ``,
        iconUrl: ``,
        self: ``,
        statusCategory: {
          id: 0,
          key: ``,
          name: ``,
          colorName: ``,
        }
      },
      // assignee: {

      // },
      labels: [
        'test'
      ]
    }
  }
  const issueB = Object.assign({}, issueA);
  issueB.fields = Object.assign({}, issueA.fields);
  issueB.key = 'FEAT-2';
  issueB.fields.summary = `Another issue`;
  const issues: Issue[] = [
    issueA,
    issueB
  ];
  const issueSearchInfo: IssueSearchInfo = {
    "maxResults": 50,
    "startAt": 0,
    "total": issues.length,
    "isLast": true,
    "issues": issues
  }
  return issueSearchInfo;
}