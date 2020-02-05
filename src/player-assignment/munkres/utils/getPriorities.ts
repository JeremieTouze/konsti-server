import { Result } from 'typings/result.typings';

export const getPriorities = (
  results: readonly Result[],
  signupMatrix: ReadonlyArray<readonly number[]>
) => {
  // Show the priorities players were assigned to
  const priorities = [];
  for (let i = 0; i < results.length; i += 1) {
    const matrixValue = signupMatrix[results[i][0]][results[i][1]];
    const selectedPlayer = parseInt(results[i][1], 10);
    priorities.push({
      // @ts-ignore
      playerId: selectedPlayer,
      // @ts-ignore
      priorityValue: matrixValue,
    });
  }
  return priorities;
};