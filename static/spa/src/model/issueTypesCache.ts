import { IssueType } from "../types/IssueType";

class IssueTypesCache {

  cachedIssueTypes: IssueType[] = [];

  getissueTypes = async (invoke: any): Promise<IssueType[]> => {
    const cachKey = `issue-types`;
    if (this.cachedIssueTypes.length === 0) {
      this.cachedIssueTypes = await invoke('getIssueTypes');
    }
    return this.cachedIssueTypes;
  }

  // cachKeysToIssueTypes = new Map<string, IssueType[]>();
  //
  // getissueTypes = async (invoke: any, projectId: string): Promise<IssueType[]> => {
  //   const cachKey = `key-${projectId}`;
  //   let cachedIssueTypes = this.cachKeysToIssueTypes.get(cachKey);
  //   if (!cachedIssueTypes) {
  //     cachedIssueTypes = await invoke('getIssueTypes', { projectId: projectId });
  //     this.cachKeysToIssueTypes.set(cachKey, cachedIssueTypes);
  //   }
  //   return cachedIssueTypes;
  // }

}

const issueTypesCache = new IssueTypesCache();
export default issueTypesCache;
