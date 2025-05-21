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

export class ProjectIssueTypeClassificationBuilder {

  classification: ProjectIssueTypClassification = {
    inferClassificationDefaults: true,
    inferFieldDefaults: true,
    inferStatusDefaults: true,
    inferSubtaskTypeDefault: true,
    issueIdsOrKeys: []
  };

  addIssueIdOrKey = (issueIdOrKey: string): ProjectIssueTypeClassificationBuilder => {
    this.classification.issueIdsOrKeys.push(issueIdOrKey);
    return this;
  }

  setInferClassificationDefaults = (inferClassificationDefaults: boolean): ProjectIssueTypeClassificationBuilder => {
    this.classification.inferClassificationDefaults = inferClassificationDefaults;
    return this;
  }

  setInferFieldDefaults = (inferFieldDefaults: boolean): ProjectIssueTypeClassificationBuilder => {
    this.classification.inferFieldDefaults = inferFieldDefaults;
    return this;
  }

  setInferStatusDefaults = (inferStatusDefaults: boolean): ProjectIssueTypeClassificationBuilder => {
    this.classification.inferStatusDefaults = inferStatusDefaults;
    return this;
  }

  setInferSubtaskTypeDefault = (inferSubtaskTypeDefault: boolean): ProjectIssueTypeClassificationBuilder => {
    this.classification.inferSubtaskTypeDefault = inferSubtaskTypeDefault;
    return this;
  }

  setTargetClassification = (targetClassification: TargetClassification[]): ProjectIssueTypeClassificationBuilder => {
    this.classification.targetClassification = targetClassification;
    return this;
  }

  setTargetMandatoryFields = (targetMandatoryFields: TargetMandatoryField[]): ProjectIssueTypeClassificationBuilder => {
    this.classification.targetMandatoryFields = targetMandatoryFields;
    return this;
  }

  build = (): ProjectIssueTypClassification => {
    return this.classification;
  }
  
}