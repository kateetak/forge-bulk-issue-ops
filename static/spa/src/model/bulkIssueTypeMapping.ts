import ListenerGroup from "src/model/ListenerGroup";

type ProjectIssueTypePair = {
  projectId: string;
  issueTypeId: string;
}

class BulkIssueTypeMapping {

  listenerGroup = new ListenerGroup('BulkIssueTypeMapping');
  sourceToTagetIssueTypeIds = new Map<string, string>();

  addMapping = (sourceProjectId: string, sourceIssueTypeId: string, targetIssueTypeId: string): void => {
    console.log(`BulkIssueTypeMapping.addMapping: ${sourceProjectId}, ${sourceIssueTypeId} -> ${targetIssueTypeId}`);
    const key = this.buildKey(sourceProjectId, sourceIssueTypeId);
    this.sourceToTagetIssueTypeIds.set(key, targetIssueTypeId);
    this.notifyListeners();
  }

  getTargetIssueTypeId = (sourceProjectId: string, sourceIssueTypeId: string): string | undefined => {
    const key = this.buildKey(sourceProjectId, sourceIssueTypeId);
    return this.sourceToTagetIssueTypeIds.get(key);
  }

  private buildKey = (sourceProjectId: string, sourceIssueTypeId: string): string => {
    return `${sourceProjectId},${sourceIssueTypeId}`;
  }

  registerListener = (listener: any) => {
    this.listenerGroup.registerListener(listener);
  };

  unregisterListener = (listener: any) => {
    this.listenerGroup.unregisterListener(listener);
  };

  private notifyListeners = () => {
    this.listenerGroup.notifyListeners(undefined);
  };

}

export default new BulkIssueTypeMapping();
