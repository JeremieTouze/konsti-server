/* @flow */
import logger from '/utils/logger'
import db from '/db/mongodb'
import assignPlayers from '/player-assignment/assignPlayers'
import validateAuthHeader from '/utils/authHeader'
import config from '/config'
import type { User } from '/flow/user.flow'
import type { Game } from '/flow/game.flow'

// Assign players to games
const postPlayers = async (req: Object, res: Object) => {
  logger.info('API call: POST /api/players')
  const startingTime = req.body.startingTime

  const authHeader = req.headers.authorization
  const validToken = validateAuthHeader(authHeader, 'admin')

  if (!validToken) {
    res.json({
      code: 401,
      message: 'Unauthorized',
      status: 'error',
    })
    return
  }

  const strategy = config.assignmentStrategy

  let users: Array<User> = []
  let games: Array<Game> = []
  let assignResults: Array<Object> | null = []

  try {
    try {
      users = await db.user.findUsers()
    } catch (error) {
      logger.error(`findUsers error: ${error}`)
      throw new Error('No assign results')
    }

    try {
      games = await db.game.findGames()
    } catch (error) {
      logger.error(`findGames error: ${error}`)
      throw new Error('No assign results')
    }

    try {
      /* $FlowFixMe */
      assignResults = assignPlayers(users, games, startingTime, strategy)
    } catch (error) {
      logger.error(`assignPlayers error: ${error}`)
      throw new Error('No assign results')
    }

    /* $FlowFixMe */
    if (assignResults && assignResults.results) {
      try {
        await db.results.saveAllSignupResults(
          /* $FlowFixMe */
          assignResults.results,
          startingTime
        )
      } catch (error) {
        logger.error(`saveAllSignupResults error: ${error}`)
        throw new Error('No assign results')
      }

      try {
        await Promise.all(
          /* $FlowFixMe */
          assignResults.results.map(assignResult => {
            return db.user.saveSignupResult(assignResult)
          })
        )
      } catch (error) {
        logger.error(`saveSignupResult error: ${error}`)
        throw new Error('No assign results')
      }

      res.json({
        message: 'Players assign success',
        status: 'success',
        results: assignResults,
      })
    } else {
      throw new Error('No matching assignments')
    }
  } catch (error) {
    logger.error(`Player assign error: ${error}`)
    res.json({
      message: 'Players assign failure',
      status: 'error',
      error,
    })
  }
}

export { postPlayers }
