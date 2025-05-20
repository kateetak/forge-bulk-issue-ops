import Resolver from '@forge/resolver';
import { getIssueTypes } from './getIssueTypes';
import { getLabelsInfo } from './getLabelsInfo';
import { getProjectSearchInfo } from './getProjectSearchInfo';
import { getIssueSearchInfo } from './getIssueSearchInfo';
import { initiateBulkIssuesMove } from './initiateBulkIssuesMove';
import { BulkIssueMoveRequestData } from './types/BulkIssueMoveRequestData';
import { getTaskOutcome } from './getTaskOutcome';
import { IssueSearchParameters } from './types/IssueSearchParameters';

const resolver = new Resolver();

resolver.define('getProjectSearchInfo', async (args: any) => {
  // console.log(args);
  const projects = await getProjectSearchInfo();
  return projects;
});

resolver.define('getIssueSearchInfo', async (args: any) => {
  const { payload, context } = args;
  // console.log(`payload = ${JSON.stringify(payload, null, 2)}`);
  // console.log(`context = ${JSON.stringify(context, null, 2)}`);
  const issueSearchParameters: IssueSearchParameters = payload.issueSearchParameters;
  const issueSearchInfo = await getIssueSearchInfo(issueSearchParameters);
  return issueSearchInfo;
});

resolver.define('getIssueTypes', async (args: any) => {
  // console.log(args);
  const issueTypes = await getIssueTypes();
  return issueTypes;
});

resolver.define('getLabelsInfo', async (args: any) => {
  // console.log(args);
  const labels = await getLabelsInfo();
  return labels;
});

resolver.define('initiateMove', async (args: any) => {
  // console.log(args);
  const bulkIssueMoveRequestData: BulkIssueMoveRequestData = args.payload.bulkIssueMoveRequestData;
  return await initiateBulkIssuesMove(bulkIssueMoveRequestData);
});

resolver.define('getIssueMoveOutcome', async (args: any) => {
  // console.log(args);
  return await getTaskOutcome(args.payload.taskId);
});

export const handler = resolver.getDefinitions();
