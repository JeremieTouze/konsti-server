/* @flow */
import moment from 'moment'
import _ from 'lodash'
import { db } from 'db/mongodb'
import { logger } from 'utils/logger'
import { opaAssignPlayers } from 'player-assignment/opa/opaAssignPlayers'
import type { User } from 'flow/user.flow'
import type { Game } from 'flow/game.flow'

export const updateWithAssign = async (
  users: $ReadOnlyArray<User>,
  games: $ReadOnlyArray<Game>
) => {
  const groupedGames = _.groupBy(games, game => moment(game.startTime).format())

  let results = []
  _.forEach(groupedGames, (value, key) => {
    const assignmentResult = opaAssignPlayers(users, games, key)
    results = results.concat(assignmentResult.results)
  })

  const signedGames = results.flatMap(result => result.enteredGame.gameDetails)

  const groupedSignups = signedGames.reduce((acc, game) => {
    acc[game.gameId] = ++acc[game.gameId] || 1
    return acc
  }, {})

  try {
    await Promise.all(
      games.map(async game => {
        if (groupedSignups[game.gameId]) {
          await db.game.saveGamePopularity(
            game.gameId,
            groupedSignups[game.gameId]
          )
        }
      })
    )
  } catch (error) {
    logger.error(`saveGamePopularity error: ${error}`)
    throw new Error('Update game popularity error')
  }
}