import { getIssueSearchInfo } from "./mockGetIssues";
import { getIssueTypes } from "./mockGetIssueTypes";
import { getLabelsInfo } from "./mockGetLabelsInfo";
import { getProjectSearchInfo } from "./mockGetProjects";
import mockMoveIssues from "./mockMoveIssues";

export const mockInvoke = async (method: string, args: any): Promise<any> => {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // console.log(`Mock invoke called with method: "${method}", args:`, args);
      if (method === 'getProjectSearchInfo') {
        resolve(getProjectSearchInfo());
      } else if (method === 'getIssueSearchInfo') {
        const projectId = args.projectId;
        resolve(getIssueSearchInfo(projectId));
      } else if (method === 'getIssueTypes') {
        const projectId = args.projectId;
        resolve(getIssueTypes(projectId));
      } else if (method === 'getLabelsInfo') {
        resolve(getLabelsInfo());
      } else if (method === 'initiateMove') {
        resolve(mockMoveIssues.initiateMove());
      } else if (method === 'getIssueMoveOutcome') {
        const taskId = args.taskId;
        resolve(mockMoveIssues.getIssueMoveOutcome(taskId));
      } else {
        resolve(`Unknown method: ${method}`);
      }
    }, 1000);
  });
}
