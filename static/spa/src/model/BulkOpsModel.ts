import { ImportStepName, StepName } from "./BulkOperationsWorkflow";
import { CompletionState } from "src/types/CompletionState";
import ListenerGroup from "./ListenerGroup";

export const importStepSequence: ImportStepName[] = ['file-upload'];

export class BulkOpsModel<StepNameSubtype extends StepName> {

  private stepSequence: StepNameSubtype[];
  private stepCompletionStateChangeListenerGroup;
  private stepNamesToCompletionStates: Record<StepNameSubtype, CompletionState>;

  constructor(modelName: string, stepSequence: StepNameSubtype[]) {
    this.stepSequence = stepSequence;
    this.stepCompletionStateChangeListenerGroup = new ListenerGroup(`${modelName}-step-completion`);
    this.stepNamesToCompletionStates = {} as Record<StepNameSubtype, CompletionState>;
    stepSequence.forEach((stepName) => {
      this.stepNamesToCompletionStates[stepName] = 'incomplete';
    });
  }

  public getStepSequence = (): StepNameSubtype[] => {
    return this.stepSequence;
  }

  public setStepCompletionState = (stepName: StepNameSubtype, completionState: CompletionState): void => {
    this.stepNamesToCompletionStates[stepName] = completionState;
    console.log(`Step "${stepName}" completion state changed to "${completionState}"`);
    this.notifyStepCompletionStateChangeListeners(stepName, completionState);
  }

  public registerStepCompletionStateChangeListener = (listener: any) => {
    this.stepCompletionStateChangeListenerGroup.registerListener(listener);
  };

  public unregisterStepCompletionStateChangeListener = (listener: any) => {
    this.stepCompletionStateChangeListenerGroup.unregisterListener(listener);
  };

  protected notifyStepCompletionStateChangeListeners = (stepName: StepName, completionState: CompletionState) => {
    this.stepCompletionStateChangeListenerGroup.notifyListeners(stepName, completionState);
  };

}
