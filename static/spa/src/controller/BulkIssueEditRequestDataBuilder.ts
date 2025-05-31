import { Issue } from "src/types/Issue";
import {
  BulkIssueEditRequestData,
  JiraCascadingSelectField,
  JiraColorField,
  JiraDateField,
  JiraDateTimeField,
  JiraDurationField,
  JiraIssueFields,
  JiraIssueTypeField,
  JiraLabelsField,
  JiraMultipleGroupPickerField,
  JiraMultipleSelectField,
  JiraMultipleSelectUserPickerField,
  JiraMultipleVersionPickerField,
  JiraMultiSelectComponentField,
  JiraNumberField,
  JiraPriorityField,
  JiraRichTextField,
  JiraSingleGroupPickerField,
  JiraSingleLineTextField,
  JiraSingleSelectField,
  JiraSingleSelectUserPickerField,
  JiraSingleVersionPickerField,
  JiraStatusInput,
  JiraTimeTrackingField,
  JiraUrlField
} from "../types/BulkIssueEditRequestData";

export class BulkIssueEditRequestDataBuilder {

  private editedFieldsInput?: JiraIssueFields;
  private selectedActions: string[] = [];
  private selectedIssueIdsOrKeys: string[] = [];
  private sendBulkNotification: boolean = false;

  setEditedFieldsInput = (data: JiraIssueFields): BulkIssueEditRequestDataBuilder => {
    this.editedFieldsInput = data;
    return this;
  }

  setSelectedActions = (actions: string[]): BulkIssueEditRequestDataBuilder => {
    this.selectedActions = actions;
    return this;
  }

  addSelectedAction = (action: string): BulkIssueEditRequestDataBuilder => {
    this.selectedActions.push(action);
    return this;
  }

  addSelectedIssues = (issues: Issue[]): BulkIssueEditRequestDataBuilder => {
    for (const issue of issues) {
      this.addSelectedIssueIdOrKey(issue.key);
    }
    return this;
  }

  addSelectedIssueIdOrKey = (issueIdOrKey: string): BulkIssueEditRequestDataBuilder => {
    this.selectedIssueIdsOrKeys.push(issueIdOrKey);
    return this;
  }

  setSendBulkNotification = (sendBulkNotification: boolean): BulkIssueEditRequestDataBuilder => {
    this.sendBulkNotification = sendBulkNotification;
    return this;
  }

  build = () => {
    const bulkIssueEditRequestData: BulkIssueEditRequestData = {
      editedFieldsInput: this.editedFieldsInput,
      selectedActions: this.selectedActions,
      selectedIssueIdsOrKeys: this.selectedIssueIdsOrKeys,
      sendBulkNotification: this.sendBulkNotification
    };
    return bulkIssueEditRequestData;
  }

}

export class JiraIssueFieldsBuilder {

  private jiraIssueFields: JiraIssueFields = {
    issueType: undefined,
    cascadingSelectFields: [],
    clearableNumberFields: [],
    colorFields: [],
    datePickerFields: [],
    dateTimePickerFields: [],
    labelsFields: [],
    multipleGroupPickerFields: [],
    multipleSelectClearableUserPickerFields: [],
    multipleSelectFields: [],
    multipleVersionPickerFields: [],
    multiselectComponents: [],
    originalEstimateField: undefined,
    priority: undefined,
    richTextFields: [],
    singleGroupPickerFields: [],
    singleLineTextFields: [],
    singleSelectClearableUserPickerFields: [],
    singleSelectFields: [],
    singleVersionPickerFields: [],
    status: undefined,
    timeTrackingField: undefined,
    urlFields: [],
  }

  setIssueType = (issueType: JiraIssueTypeField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.issueType = issueType;
    return this;
  }

  addCascadingSelectField = (field: JiraCascadingSelectField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.cascadingSelectFields.push(field);
    return this;
  }

  addClearableNumberField = (field: JiraNumberField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.clearableNumberFields.push(field);
    return this;
  }

  addColorField = (field: JiraColorField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.colorFields.push(field);
    return this;
  }

  addDatePickerField = (field: JiraDateField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.datePickerFields.push(field);
    return this;
  }
  
  addDataTimePickerField = (field: JiraDateTimeField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.dateTimePickerFields.push(field);
    return this;
  }

  addLabelsField = (field: JiraLabelsField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.labelsFields.push(field);
    return this;
  }

  addMultipleGroupPickerField = (field: JiraMultipleGroupPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.multipleGroupPickerFields.push(field);
    return this;
  }

  addMultipleSelectClearableUserPickerField = (field: JiraMultipleSelectUserPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.multipleSelectClearableUserPickerFields.push(field);
    return this;
  }

  addMultipleSelectField = (field: JiraMultipleSelectField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.multipleSelectFields.push(field);
    return this;
  }
  
  addMultipleVersionPickerField = (field: JiraMultipleVersionPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.multipleVersionPickerFields.push(field);
    return this;
  }

  setMultiselectComponents = (field: JiraMultiSelectComponentField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.multiselectComponents = [field];
    return this;
  }

  setOriginalEstimateField = (field: JiraDurationField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.originalEstimateField = field;
    return this;
  }

  setPriority = (field: JiraPriorityField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.priority = field; // Assuming field is of type JiraPriorityField
    return this;
  }

  addRichTextField = (field: JiraRichTextField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.richTextFields.push(field);
    return this;
  }

  addSingleGroupPickerField = (field: JiraSingleGroupPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.singleGroupPickerFields.push(field);
    return this;
  }

  addSingleLineTextField = (field: JiraSingleLineTextField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.singleLineTextFields.push(field);
    return this;
  }

  addSingleSelectClearableUserPickerField = (field: JiraSingleSelectUserPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.singleSelectClearableUserPickerFields.push(field);
    return this;
  }

  addSingleSelectField = (field: JiraSingleSelectField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.singleSelectFields.push(field);
    return this;
  }
  
  addSingleVersionPickerField = (field: JiraSingleVersionPickerField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.singleVersionPickerFields.push(field);
    return this;
  }

  setStatus = (status: JiraStatusInput): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.status = status;
    return this;
  }

  setTimeTrackingField = (field: JiraTimeTrackingField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.timeTrackingField = field;
    return this;
  }

  addUrlField = (field: JiraUrlField): JiraIssueFieldsBuilder => {
    this.jiraIssueFields.urlFields.push(field);
    return this;
  }
  
  build = () => {
    return this.jiraIssueFields;
  }

}
