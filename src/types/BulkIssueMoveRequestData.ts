
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-move-post


export type TargetClassification = {
  classifications: {
    [key: string]: string[];
  }[];
}

export type TargetMandatoryField = {
  fields: {
    [key: string]: {
      retain: boolean;
      type: string;
      value?: string[] | object;
    };
  };
}

export type ProjectIssueTypClassification = {
  inferClassificationDefaults: boolean;
  inferFieldDefaults: boolean;
  inferStatusDefaults: boolean;
  inferSubtaskTypeDefault: boolean;
  issueIdsOrKeys: string[];
  targetClassification?: TargetClassification[];
  targetMandatoryFields?: TargetMandatoryField[];
}

export type BulkIssueMoveRequestData = {
  sendBulkNotification: boolean;
  targetToSourcesMapping: {
    [projectAndIssueTypeKey: string]: ProjectIssueTypClassification;
  };
}
