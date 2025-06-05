import { MoveStepName } from "./BulkOperationsWorkflow";
import { BulkOpsModel } from "./BulkOpsModel";

export const moveStepSequence: MoveStepName[] = ['filter', 'issue-selection', 'target-project-selection', 'issue-type-mapping', 'field-mapping', 'move-or-edit'];

class MoveModel extends BulkOpsModel<MoveStepName> {

  constructor() {
    super('MoveModel', moveStepSequence);
  }

  // TODO: relocate bulkIssueTypeMappingModel implementation to here.

}

export default new MoveModel();
