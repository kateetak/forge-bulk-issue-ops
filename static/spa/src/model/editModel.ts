import { EditStepName } from "./BulkOperationsWorkflow";
import { BulkOpsModel } from "./BulkOpsModel";

export const editStepSequence: EditStepName[] = ['filter', 'issue-selection', 'edit-fields', 'move-or-edit'];

class MoveModel extends BulkOpsModel<EditStepName> {

  constructor() {
    super('EditModel', editStepSequence);
  }

  // TODO: relocate editedFieldsModel implementation to here.

}

export default new MoveModel();
