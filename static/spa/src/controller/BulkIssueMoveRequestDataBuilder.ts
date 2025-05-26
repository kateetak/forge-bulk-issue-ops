import {
  BulkIssueMoveRequestData,
  ProjectIssueTypClassification,
  TargetClassification,
  TargetMandatoryField
} from "../types/BulkIssueMoveRequestData";

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

export class TargetMandatoryFieldBuilder {

  targetMandatoryFields: TargetMandatoryField[] = [];

  addField = (fieldName, fieldValue: any): TargetMandatoryFieldBuilder => {
    let fields: any = undefined;
    if (this.targetMandatoryFields.length === 0) {
      fields = {};
      const targetMandatoryField: TargetMandatoryField = {
        fields: fields
      }
      this.targetMandatoryFields.push(targetMandatoryField);
    } else {
      fields = this.targetMandatoryFields[0].fields;
    }
    fields[fieldName] = fieldValue;
    return this;
  }

  build = (): TargetMandatoryField[] => {
    return this.targetMandatoryFields;
  }

}

export class ProjectIssueTypeClassificationBuilder {

  classification: ProjectIssueTypClassification = {
    inferClassificationDefaults: true,
    inferFieldDefaults: true,
    inferStatusDefaults: true,
    inferSubtaskTypeDefault: true,
    issueIdsOrKeys: [],
    targetMandatoryFields: [],
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

  addTargetMandatoryField = (fieldName, fieldValue: any): ProjectIssueTypeClassificationBuilder => {
    let fields: any = undefined;
    if (this.classification.targetMandatoryFields.length === 0) {
      fields = {};
      const targetMandatoryField: TargetMandatoryField = {
        fields: fields
      }
      this.classification.targetMandatoryFields.push(targetMandatoryField);
    } else {
      fields = this.classification.targetMandatoryFields[0].fields;
    }
    fields[fieldName] = fieldValue;
    return this;
  }

  build = (): ProjectIssueTypClassification => {
    return this.classification;
  }
  
}