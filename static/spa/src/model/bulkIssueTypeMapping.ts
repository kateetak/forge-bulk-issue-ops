// import ListenerGroup from "src/model/ListenerGroup";

import { Issue } from "../types/Issue";
import { IssueType } from "../types/IssueType";

class BulkIssueTypeMapping {

  // listenerGroup = new ListenerGroup('BulkIssueTypeMapping');
  sourceToTargetIssueTypeIds = new Map<string, string>();
  sourceIssueTypes: IssueType[] = [];

  areAllIssueTyesMapped = (issues: Issue[]): boolean => {
    // console.log(`BulkIssueTypeMapping: computing is all issue types are mapped based on selected issues = ${issues.map(issue => issue.key).join(', ')}`);
    for (const issue of issues) {
      const targetIssueTypeId = this.getTargetIssueTypeId(issue.fields.project.id, issue.fields.issuetype.id);
      if (!targetIssueTypeId) {
        return false;
      }
    }
    return true;
  }

  addMapping = (sourceProjectId: string, sourceIssueTypeId: string, targetIssueTypeId: string): void => {
    console.log(`BulkIssueTypeMapping.addMapping: ${sourceProjectId}, ${sourceIssueTypeId} -> ${targetIssueTypeId}`);
    const key = this.buildKey(sourceProjectId, sourceIssueTypeId);
    this.sourceToTargetIssueTypeIds.set(key, targetIssueTypeId);
    // this.notifyListeners();
  }

  getTargetIssueTypeId = (sourceProjectId: string, sourceIssueTypeId: string): string | undefined => {
    const key = this.buildKey(sourceProjectId, sourceIssueTypeId);
    return this.sourceToTargetIssueTypeIds.get(key);
  }

  private buildKey = (sourceProjectId: string, sourceIssueTypeId: string): string => {
    return `${sourceProjectId},${sourceIssueTypeId}`;
  }

  // registerListener = (listener: any) => {
  //   this.listenerGroup.registerListener(listener);
  // };

  // unregisterListener = (listener: any) => {
  //   this.listenerGroup.unregisterListener(listener);
  // };

  // private notifyListeners = () => {
  //   this.listenerGroup.notifyListeners(undefined);
  // };

}

export default new BulkIssueTypeMapping();
