import { ProjectSearchInfo } from "../types/ProjectSearchInfo";

export const nilProjectSearchInfo = (): ProjectSearchInfo => {
  return {
      maxResults: 0,
      startAt: 0,
      total: 0,
      isLast: true,
      values: []
    }
}
