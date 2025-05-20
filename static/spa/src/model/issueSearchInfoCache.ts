import { IssueSearchInfo } from "src/types/IssueSearchInfo";

class IssueSearchInfoCache {

  cachKeysToIssueSearchInfo = new Map<string, IssueSearchInfo>();

  getissueTypes = async (invoke: any, projectId: string, labels: string[]): Promise<IssueSearchInfo> => {
    const cachKey = `key-${projectId}`;
    let cachedIssueSearchInfo = this.cachKeysToIssueSearchInfo.get(cachKey);
    if (!cachedIssueSearchInfo) {
      cachedIssueSearchInfo = await invoke('getIssueSearchInfo', { projectId: projectId, labels: labels });
      this.cachKeysToIssueSearchInfo.set(cachKey, cachedIssueSearchInfo);
    }
    return cachedIssueSearchInfo;
  }

}

const issueSearchInfoCache = new IssueSearchInfoCache();
export default issueSearchInfoCache;
