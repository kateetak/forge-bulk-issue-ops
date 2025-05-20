import { IssueSearchInfo } from "src/types/IssueSearchInfo"

export const nilIssueSearchInfo = (): IssueSearchInfo => {
  return {
    maxResults: 0,
    startAt: 0,
    total: 0,
    isLast: false,
    issues: []
  }
}
