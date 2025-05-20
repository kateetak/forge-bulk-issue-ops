import api, { route } from "@forge/api";


export const moveIssues = async () => {
  var bodyData = `{
    "sendBulkNotification": true,
    "targetToSourcesMapping": {
      "PROJECT-KEY,10001": {
        "inferClassificationDefaults": false,
        "inferFieldDefaults": false,
        "inferStatusDefaults": false,
        "inferSubtaskTypeDefault": true,
        "issueIdsOrKeys": [
          "ISSUE-1"
        ],
        "targetClassification": [
          {
            "classifications": {
              "5bfa70f7-4af1-44f5-9e12-1ce185f15a38": [
                "bd58e74c-c31b-41a7-ba69-9673ebd9dae9",
                "-1"
              ]
            }
          }
        ],
        "targetMandatoryFields": [
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
          }
        ],
        "targetStatus": [
          {
            "statuses": {
              "10001": [
                "10002",
                "10003"
              ]
            }
          }
        ]
      }
    }
  }`;
  
  const response = await api.asUser().requestJira(route`/rest/api/3/bulk/issues/move`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyData
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
}
