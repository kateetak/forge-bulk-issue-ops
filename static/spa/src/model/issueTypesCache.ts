import { IssueType } from "../types/IssueType";

class IssueTypesCache {

  cachedIssueTypes: IssueType[] = [];

  // TODO: Implement memoization
  getissueTypes = async (invoke: any): Promise<IssueType[]> => {
    const cachKey = `issue-types`;
    if (this.cachedIssueTypes.length === 0) {
      this.cachedIssueTypes = await invoke('getIssueTypes');
    }
    return this.cachedIssueTypes;
  }

}

const issueTypesCache = new IssueTypesCache();
export default issueTypesCache;
