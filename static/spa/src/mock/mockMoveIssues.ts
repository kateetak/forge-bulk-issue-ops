import { TaskOutcome } from "../types/TaskOutcome";


class MockMoveIssues {

  taskIdsToIssueMoveOutcomes = new Map<string, TaskOutcome>();

  initiateMove = () => {
    const taskId = `task-${Date.now()}`;
    setTimeout(async () => {
      const outcome: TaskOutcome = {
        message: `Mock move outcome - num issues moved = ${Math.round(Math.random() * 100)}`,
        description: "",
        status: 'COMPLETE',
        progress: 0,
        result: undefined
      }
      // console.log(`MockMoveIssues: Setting issue move outcome for task ${taskId} to ${JSON.stringify(outcome)}...`);
      this.taskIdsToIssueMoveOutcomes.set(taskId, outcome);
    }, 5000);
    return taskId;
  }

  getIssueMoveOutcome = async (taskId: string): Promise<undefined | TaskOutcome> => {
    const outcome = this.taskIdsToIssueMoveOutcomes.get(taskId);
    // console.log(`MockMoveIssues: Getting issue move outcome for task ${taskId}...`);
    return outcome;
  }

}

const mockMoveIssues = new MockMoveIssues();
export default mockMoveIssues;
