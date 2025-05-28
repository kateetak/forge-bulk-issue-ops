import Resolver from '@forge/resolver';
import { initiateBulkMove } from './initiateBulkMove';

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

export const handler = resolver.getDefinitions();
