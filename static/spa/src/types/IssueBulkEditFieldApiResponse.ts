
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-fields-get


// Field option types
export interface PriorityOption {
  priority: string;
  id: string;
  description: string;
}

export interface FieldOption {
  optionId: string;
  value: string;
  isDisabled: boolean;
}

export interface IssueTypeOption {
  id: string;
  issueType: string;
  description: string;
}

// Main field types
export type MultiSelectOption = "ADD" | "REMOVE" | "REPLACE" | "REMOVE_ALL";

export interface BaseField {
  type: string;
  id: string;
  name: string;
  isRequired: boolean;
  description?: string;
  unavailableMessage?: string;
  searchUrl?: string;
}

export interface VersionField extends BaseField {
  type: "versions" | "fixVersions";
  multiSelectFieldOptions: MultiSelectOption[];
}

export interface AssigneeField extends BaseField {
  type: "assignee";
}

export interface ComponentsField extends BaseField {
  type: "components";
  multiSelectFieldOptions: MultiSelectOption[];
}

export interface DueDateField extends BaseField {
  type: "duedate";
}

export interface LabelsField extends BaseField {
  type: "labels";
  multiSelectFieldOptions: MultiSelectOption[];
}

export interface PriorityField extends BaseField {
  type: "priority";
  fieldOptions: PriorityOption[];
}

export interface CustomDateTimeField extends BaseField {
  type: "com.atlassian.jira.plugin.system.customfieldtypes:datetime";
}

export interface SelectField extends BaseField {
  type: "com.atlassian.jira.plugin.system.customfieldtypes:select";
  fieldOptions: FieldOption[];
}

export interface NumberField extends BaseField {
  type: "com.atlassian.jira.plugin.system.customfieldtypes:float";
  fieldOptions: FieldOption[];
}

export interface IssueTypeField extends BaseField {
  type: "issuetype";
  fieldOptions: IssueTypeOption[];
}

export interface CommentField extends BaseField {
  type: "comment";
}

export interface CascadingFieldOption {
  parentOption: FieldOption;
  childOptions: FieldOption[];
}

export interface CascadingSelectField extends BaseField {
  fieldOptions: CascadingFieldOption[];
  /*
    Example shape:
    {
    "type": "com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect",
    "id": "customfield_10289",
    "name": "Animal Type",
    "description": "",
    "isRequired": false,
    "fieldOptions": [
      {
        "parentOption": {
          "optionId": 10053,
          "value": "Mammal",
          "isDisabled": false
        },
        "childOptions": [
          {
            "optionId": 10055,
            "value": "Dog",
            "isDisabled": false
          },
          {
            "optionId": 10056,
            "value": "Cat",
            "isDisabled": false
          }
        ]
      },
      {
        "parentOption": {
          "optionId": 10054,
          "value": "Marsupial",
          "isDisabled": false
        },
        "childOptions": [
          {
            "optionId": 10057,
            "value": "Koala",
            "isDisabled": false
          },
          {
            "optionId": 10058,
            "value": "Quokka",
            "isDisabled": false
          },
          {
            "optionId": 10059,
            "value": "Thylacine",
            "isDisabled": false
          }
        ]
      }
    ]
  }
  */
}

export type IssueBulkEditField = 
  | BaseField
  | VersionField
  | AssigneeField
  | ComponentsField
  | DueDateField
  | LabelsField
  | PriorityField
  | CustomDateTimeField
  | SelectField
  | NumberField
  | IssueTypeField
  | CommentField
  | CascadingSelectField

// Main response export interface
export interface IssueBulkEditFieldApiResponse {
  fields: Array<IssueBulkEditField>;
  startingAfter: string;
}
