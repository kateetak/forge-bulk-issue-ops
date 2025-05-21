import {IssueFields} from './IssueFields';

export interface Issue {
  id: string;
  key: string;
  fields: IssueFields;
}
