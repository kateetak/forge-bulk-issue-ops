import { fetchIssueTypese } from "src/controller/jiraClient";
import { IssueType } from "../types/IssueType";

class IssueTypesCache {

  cachedIssueTypes: IssueType[] = [];

  // TODO: Implement memoization
  getissueTypes = async (invoke: any): Promise<IssueType[]> => {
    const cachKey = `issue-types`;
    if (this.cachedIssueTypes.length === 0) {
      // this.cachedIssueTypes = await invoke('getIssueTypes');
      this.cachedIssueTypes = await fetchIssueTypese();
    }
    return this.cachedIssueTypes;
  }

}

const issueTypesCache = new IssueTypesCache();
export default issueTypesCache;
function getIssueTypese(): IssueType[] | PromiseLike<IssueType[]> {
  throw new Error("Function not implemented.");
}

