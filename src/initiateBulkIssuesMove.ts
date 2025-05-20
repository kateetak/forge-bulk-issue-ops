import api, { route } from "@forge/api";
import { BulkIssueMoveRequestData } from "./types/BulkIssueMoveRequestData";
import { IssueMoveRequestOutcome } from "./types/IssueMoveRequestOutcome";

export const initiateBulkIssuesMove = async (bulkIssueMoveRequestData: BulkIssueMoveRequestData): Promise<IssueMoveRequestOutcome> => {  
  const response = await api.asUser().requestJira(route`/rest/api/3/bulk/issues/move`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bulkIssueMoveRequestData)
  });
  
  const outcomeData = await response.json();
  const outcome: IssueMoveRequestOutcome = Object.assign({statusCode: response.status}, outcomeData);
  console.log(`Bulk issue move request outcome: ${JSON.stringify(outcome, null, 2)}`);
  return outcome;
}