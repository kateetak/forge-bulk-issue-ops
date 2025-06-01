

/**
 * Represents the value of a field being edited in the bulk edit form. 
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-fields-get
 */

import { MultiSelectOption } from "./IssueBulkEditFieldApiResponse";

export type MultiSelectFieldEditOption = MultiSelectOption; //'ADD' | 'REMOVE' | 'REPLACE' | 'REMOVE_ALL';
export const multiSelectFieldEditOptions = ['ADD', 'REMOVE', 'REPLACE', 'REMOVE_ALL'] as MultiSelectFieldEditOption[];

export type FieldEditValue = {
  value: any;
  fieldOption?: string;
  multiSelectFieldOption?: MultiSelectFieldEditOption;
}
