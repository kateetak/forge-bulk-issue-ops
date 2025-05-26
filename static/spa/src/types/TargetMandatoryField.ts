
export interface FieldValue {
  retain: boolean;
  type: 'raw' | 'adf';
  value: any; // Using 'any' since value can be of different types
}

// This is an attribute within the bulk move payload. See https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-move-post
export type TargetMandatoryFields = {
  // A map of field IDs to their values
  fields: {
    [key: string]: FieldValue;
  }
}


const example_A_TargetMandatoryFields: TargetMandatoryFields = {
  fields: {}
}

const example_B_TargetMandatoryFields: TargetMandatoryFields = {
  fields: {
    customfield_10091: {
      retain: false,
      type: "raw",
      value: ['10021'] // <- ID of the option
    }
  }
}

const example_D_TargetMandatoryFields: TargetMandatoryFields = 
  {
    "fields": {
      "customfield_10000": {
        "retain": false,
        "type": "raw",
        "value": [
          "value-1",
          "value-2"
        ]
      },
      "description": {
        "retain": true,
        "type": "adf",
        "value": {
          "content": [
            {
              "content": [
                {
                  "text": "New description value",
                  "type": "text"
                }
              ],
              "type": "paragraph"
            }
          ],
          "type": "doc",
          "version": 1
        }
      },
      "fixVersions": {
        "retain": false,
        "type": "raw",
        "value": [
          "10009"
        ]
      },
      "labels": {
        "retain": false,
        "type": "raw",
        "value": [
          "label-1",
          "label-2"
        ]
      }
    }
  };
 