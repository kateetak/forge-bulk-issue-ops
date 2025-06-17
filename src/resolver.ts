import Resolver from '@forge/resolver';
import { webTrigger } from "@forge/api";
import { initiateBulkEdit, initiateBulkMove } from './initiateBulkOperations';

const resolver = new Resolver();

resolver.define('initiateBulkMove', async (request: any) => {
  // console.log(`initiateBulkMove request: ${JSON.stringify(request, null, 2)}`);
  const context = request.context;
  const payload = request.payload;
  const accountId = context.accountId;
  // console.log(`initiateBulkMove payload: ${JSON.stringify(payload, null, 2)}`);
  const bulkIssueMoveRequestData = payload.bulkIssueMoveRequestData;
  return await initiateBulkMove(accountId, bulkIssueMoveRequestData);
});

resolver.define('initiateBulkEdit', async (request: any) => {
  // console.log(`initiateBulkEdit request: ${JSON.stringify(request, null, 2)}`);
  const context = request.context;
  const payload = request.payload;
  const accountId = context.accountId;
  // console.log(`initiateBulkEdit payload: ${JSON.stringify(payload, null, 2)}`);
  const bulkIssueEditRequestData = payload.bulkIssueEditRequestData;
  return await initiateBulkEdit(accountId, bulkIssueEditRequestData);
});

export const handler = resolver.getDefinitions();
