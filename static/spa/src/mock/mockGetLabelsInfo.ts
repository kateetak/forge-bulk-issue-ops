
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-labels/#api-rest-api-3-label-get

export const getLabelsInfo = async () => {
  return {
    "maxResults": 1000,
    "startAt": 0,
    "total": 1,
    "isLast": true,
    "values": [
      "test",
      "flagged-for-move"
    ]
  }
}