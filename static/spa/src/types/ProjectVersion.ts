
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-project-versions/#api-rest-api-3-project-projectidorkey-versions-get

export type ProjectVersion = {
  id: string;
  name: string;
  description: string;
  driver: string;
  releaseDate: string;
  startDate: string;
  userReleaseData: string;

  // More fields available
}
