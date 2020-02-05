import { logger } from 'utils/logger';
import { User } from 'typings/user.typings';

export const getGroupMembers = (
  groupLeaders: readonly User[],
  players: readonly User[]
): readonly User[] => {
  logger.debug('Add group members to groups');

  const selectedPlayersWithSignups = [];

  for (const groupLeader of groupLeaders) {
    // Skip individual users
    if (groupLeader.groupCode !== '0') {
      for (const player of players) {
        // User is in the group but is not the leader
        if (
          player.groupCode === groupLeader.groupCode &&
          player.username !== groupLeader.username
        ) {
          // player.signedGames = groupLeader.signedGames
          selectedPlayersWithSignups.push(
            // @ts-ignore
            Object.assign({
              ...player,
              signedGames: groupLeader.signedGames,
            })
          );
        }
      }
    }
  }

  logger.debug(`Found ${selectedPlayersWithSignups.length} group members`);

  return selectedPlayersWithSignups;
};