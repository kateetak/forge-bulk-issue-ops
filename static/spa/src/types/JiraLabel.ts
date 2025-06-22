

// Example query https://your-tenant.atlassian.net/rest/api/3/jql/autocompletedata/suggestions?fieldName=labels&fieldValue=test

export type LabelsQueryResponse = {
  results: JiraLabel[];
}

export type JiraLabel = {
  value: string;
  displayName: string;
}
