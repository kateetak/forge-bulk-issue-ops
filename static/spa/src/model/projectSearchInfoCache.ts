import { ProjectSearchInfo } from "src/types/ProjectSearchInfo";

class ProjectSearchInfoCache {

  cachedProjectSearchInfo: undefined | ProjectSearchInfo = undefined;

  getProjectSearchInfo = async (invoke: any): Promise<ProjectSearchInfo> => {
    if (!this.cachedProjectSearchInfo) {
      this.cachedProjectSearchInfo = await invoke('getProjectSearchInfo');
    }
    return this.cachedProjectSearchInfo;
  }

}

const projectSearchInfoCache = new ProjectSearchInfoCache();
export default projectSearchInfoCache;
