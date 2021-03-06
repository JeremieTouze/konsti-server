import _ from 'lodash';
import { OpaAssignResults } from 'typings/opaAssign.typings';
import { UserArray, EnteredGame } from 'typings/user.typings';
import { Result } from 'typings/result.typings';

export const formatResults = (
  assignResults: OpaAssignResults,
  playerGroups: readonly UserArray[]
): readonly Result[] => {
  const selectedPlayers = playerGroups
    .filter((playerGroup) => {
      const firstMember = _.first(playerGroup);

      if (!firstMember) {
        throw new Error('Opa assign: error getting first member');
      }

      return assignResults.find(
        (assignResult) =>
          (assignResult.id === firstMember.groupCode ||
            assignResult.id === firstMember.serial) &&
          assignResult.assignment !== -1
      );
    })
    .flat();

  const getEnteredGame = (player): EnteredGame => {
    return player.signedGames.find((signedGame) => {
      return assignResults.find(
        (assignResult) =>
          (assignResult.id === player.groupCode ||
            assignResult.id === player.serial) &&
          assignResult.assignment === signedGame.gameDetails.gameId
      );
    });
  };

  const results = selectedPlayers.map((player) => {
    return {
      username: player.username,
      enteredGame: getEnteredGame(player),
    };
  });

  return results;
};
