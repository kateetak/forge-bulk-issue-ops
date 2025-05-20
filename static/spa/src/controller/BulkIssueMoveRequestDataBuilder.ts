import { BulkIssueMoveRequestData, ProjectIssueTypClassification, TargetClassification, TargetMandatoryField } from "src/types/BulkIssueMoveRequestData";

export class BulkIssueMoveRequestDataBuilder {

  bulkIssueMoveRequestData: BulkIssueMoveRequestData = {
    sendBulkNotification: false,
    targetToSourcesMapping: {}
  }

  addMapping = (destinationProjectIdOrKey: string, destinationIssueTypeId: string, classification: ProjectIssueTypClassification): BulkIssueMoveRequestDataBuilder => {
    const projectAndIssueTypeKey = `${destinationProjectIdOrKey},${destinationIssueTypeId}`;
    this.bulkIssueMoveRequestData.targetToSourcesMapping[projectAndIssueTypeKey] = classification;
    return this;
  }

  build = (): BulkIssueMoveRequestData => {
    return this.bulkIssueMoveRequestData;
  }

}

export class ProjectIssueTypClassificationBuilder {

  classification: ProjectIssueTypClassification = {
    inferClassificationDefaults: true,
    inferFieldDefaults: true,
    inferStatusDefaults: true,
    inferSubtaskTypeDefault: true,
    issueIdsOrKeys: []
  };

  setIssueIdsOrKeys = (issueIdsOrKeys: string[]): ProjectIssueTypClassificationBuilder => {
    this.classification.issueIdsOrKeys = issueIdsOrKeys;
    return this;
  }

  setInferClassificationDefaults = (inferClassificationDefaults: boolean): ProjectIssueTypClassificationBuilder => {
    this.classification.inferClassificationDefaults = inferClassificationDefaults;
    return this;
  }

  setInferFieldDefaults = (inferFieldDefaults: boolean): ProjectIssueTypClassificationBuilder => {
    this.classification.inferFieldDefaults = inferFieldDefaults;
    return this;
  }

  setInferStatusDefaults = (inferStatusDefaults: boolean): ProjectIssueTypClassificationBuilder => {
    this.classification.inferStatusDefaults = inferStatusDefaults;
    return this;
  }

  setInferSubtaskTypeDefault = (inferSubtaskTypeDefault: boolean): ProjectIssueTypClassificationBuilder => {
    this.classification.inferSubtaskTypeDefault = inferSubtaskTypeDefault;
    return this;
  }

  setTargetClassification = (targetClassification: TargetClassification[]): ProjectIssueTypClassificationBuilder => {
    this.classification.targetClassification = targetClassification;
    return this;
  }

  setTargetMandatoryFields = (targetMandatoryFields: TargetMandatoryField[]): ProjectIssueTypClassificationBuilder => {
    this.classification.targetMandatoryFields = targetMandatoryFields;
    return this;
  }

  build = (): ProjectIssueTypClassification => {
    return this.classification;
  }
  
}