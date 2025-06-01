
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-fields-post


export type JiraIssueTypeField = {
  issueTypeId: string;
}

export type JiraSelectedOptionField = {
  optionId: string;
}

export type JiraCascadingSelectField = {
  fieldId: string;
  childOptionValue: JiraSelectedOptionField;
  parentOptionValue: JiraSelectedOptionField;
}

export type JiraNumberField = {
  fieldId: string;
  value: number;
}

export type JiraColorInput = {
  name: 'purple' | 'blue' | 'green' | 'teal' | 'yellow' | 'orange' | 'grey' | 'dark purple' | 'dark blue' | 'dark green' | 'dark teal' | 'dark yellow' | 'dark orange' | 'dark grey';
}

export type JiraColorField = {
  fieldId: string;
  color: JiraColorInput;
}

export type JiraDateInput = {
  formattedDate: string;
}

export type JiraDateField = {
  fieldId: string;
  date: JiraDateInput;
}

export type JiraDateTimeInput = {
  formattedDateTime: string;
}

export type JiraDateTimeField = {
  fieldId: string;
  dateTime: JiraDateTimeInput;
}

export type JiraLabelPropertiesInput = {
  name: string;
  color: 'GREY_LIGHTEST' | 'GREY_LIGHTER' | 'GREY' | 'GREY_DARKER' | 'GREY_DARKEST' | 'PURPLE_LIGHTEST' | 'PURPLE_LIGHTER' | 'PURPLE' | 'PURPLE_DARKER' | 'PURPLE_DARKEST' | 'BLUE_LIGHTEST' | 'BLUE_LIGHTER' | 'BLUE' | 'BLUE_DARKER' | 'BLUE_DARKEST' | 'TEAL_LIGHTEST' | 'TEAL_LIGHTER' | 'TEAL' | 'TEAL_DARKER' | 'TEAL_DARKEST' | 'GREEN_LIGHTEST' | 'GREEN_LIGHTER' | 'GREEN' | 'GREEN_DARKER' | 'GREEN_DARKEST' | 'LIME_LIGHTEST' | 'LIME_LIGHTER' | 'LIME' | 'LIME_DARKER' | 'LIME_DARKEST' | 'YELLOW_LIGHTEST' | 'YELLOW_LIGHTER' | 'YELLOW' | 'YELLOW_DARKER' | 'YELLOW_DARKEST' | 'ORANGE_LIGHTEST' | 'ORANGE_LIGHTER' | 'ORANGE' | 'ORANGE_DARKER' | 'ORANGE_DARKEST' | 'RED_LIGHTEST' | 'RED_LIGHTER' | 'RED' | 'RED_DARKER' | 'RED_DARKEST' | 'MAGENTA_LIGHTEST' | 'MAGENTA_LIGHTER' | 'MAGENTA' | 'MAGENTA_DARKER' | 'MAGENTA_DARKEST';
}

export type JiraLabelsInput = {
  name: string;
}

export type JiraLabelsField = {
  fieldId: string;
  bulkEditMultiSelectFieldOption: string;
  labelProperties?: JiraLabelPropertiesInput[];
  labels: JiraLabelsInput[];
}

export type JiraGroupInput = {
  groupName: string;
}

export type JiraMultipleGroupPickerField = {
  fieldId: string;
  groups: JiraGroupInput[];
}

export type JiraUserField = {
  accountId: string;
}

export type JiraMultipleSelectUserPickerField = {
  fieldId: string;
  users: JiraUserField[];
}

export type JiraMultipleSelectField = {
  fieldId: string;
  options: JiraSelectedOptionField[];
}

export type JiraVersionField = {
  versionId: string;
}

export type JiraMultipleVersionPickerField = {
  fieldId: string;
  bulkEditMultiSelectFieldOption: string;
  versions: JiraVersionField[];
}

export type JiraComponentField = {
  componentId: string;
}

export type JiraMultiSelectComponentField = {
  fieldId: string;
  bulkEditMultiSelectFieldOption: string;
  components: JiraComponentField[];
}

export type JiraDurationField = {
  originalEstimateField: string;
}

export type JiraPriorityField = {
  priorityId: string;
}

export type JiraRichTextInput = {
  adfValue: any;
}

export type JiraRichTextField = {
  fieldId: string;
  richText: JiraRichTextInput;
}

export type JiraSingleGroupPickerField = {
  fieldId: string;
  group: JiraGroupInput;
}

export type JiraSingleLineTextField = {
  fieldId: string;
  text: string;
}

export type JiraSingleSelectUserPickerField = {
  fieldId: string;
  user: JiraUserField;
}

export type JiraSingleSelectField = {
  fieldId: string;
  option: JiraSelectedOptionField;
}

export type JiraSingleVersionPickerField = {
  fieldId: string;
  version: JiraVersionField;
}

export type JiraStatusInput = {
  statusId: string;
}

export type JiraTimeTrackingField = {
  timeRemaining: string;
}

export type JiraUrlField = {
  fieldId: string;
  url: string;
}

export type JiraIssueFields = {
  issueType?: JiraIssueTypeField
  cascadingSelectFields?: JiraCascadingSelectField[];
  clearableNumberFields?: JiraNumberField[];
  colorFields?: JiraColorField[];
  datePickerFields?: JiraDateField[];
  dateTimePickerFields?: JiraDateTimeField[];
  labelsFields?: JiraLabelsField[];
  multipleGroupPickerFields?: JiraMultipleGroupPickerField[];
  multipleSelectClearableUserPickerFields?: JiraMultipleSelectUserPickerField[];
  multipleSelectFields?: JiraMultipleSelectField[];
  multipleVersionPickerFields?: JiraMultipleVersionPickerField[];
  multiselectComponents?: JiraMultiSelectComponentField[];
  originalEstimateField?: JiraDurationField;
  priority?: JiraPriorityField;
  richTextFields?: JiraRichTextField[];
  singleGroupPickerFields?: JiraSingleGroupPickerField[];
  singleLineTextFields?: JiraSingleLineTextField[];
  singleSelectClearableUserPickerFields?: JiraSingleSelectUserPickerField[];
  singleSelectFields?: JiraSingleSelectField[];
  singleVersionPickerFields?: JiraSingleVersionPickerField[];
  status?: JiraStatusInput;
  timeTrackingField?: JiraTimeTrackingField;
  urlFields?: JiraUrlField[];
}

export type BulkIssueEditRequestData = {
  editedFieldsInput: any;
  selectedActions: string[];
  selectedIssueIdsOrKeys: string[];
  sendBulkNotification: boolean;
}
