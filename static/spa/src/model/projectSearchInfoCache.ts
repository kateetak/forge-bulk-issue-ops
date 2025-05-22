import { getProjectSearchInfo } from "../controller/jiraClient";
import { ProjectSearchInfo } from "../types/ProjectSearchInfo";

class ProjectSearchInfoCache {

  cachedProjectSearchInfo: undefined | ProjectSearchInfo = undefined;

  // TODO: Implement memoization
  getProjectSearchInfo = async (): Promise<ProjectSearchInfo> => {
    if (!this.cachedProjectSearchInfo) {
      // this.cachedProjectSearchInfo = await invoke('getProjectSearchInfo');
      this.cachedProjectSearchInfo = await getProjectSearchInfo();
    }
    return this.cachedProjectSearchInfo;
  }

}

const projectSearchInfoCache = new ProjectSearchInfoCache();
export default projectSearchInfoCache;
