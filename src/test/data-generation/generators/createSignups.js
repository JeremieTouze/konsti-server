/* @flow */
import faker from 'faker'
import moment from 'moment'
import _ from 'lodash'
import { logger } from 'utils/logger'
import { db } from 'db/mongodb'
import type { User, SignedGame } from 'flow//user.flow'
import type { Game } from 'flow/game.flow'

const getRandomSignup = (
  games: $ReadOnlyArray<Game>,
  user: User
): Array<SignedGame> => {
  const signedGames = []
  let randomIndex

  const startTimes = games.map(game =>
    moment(game.startTime)
      .utc()
      .format()
  )
  const uniqueTimes = Array.from(new Set(startTimes))

  // Select three random games for each starting time
  uniqueTimes.forEach(startingTime => {
    logger.debug(`Generate signups for time ${startingTime}`)
    const gamesForTime = games.filter(
      games =>
        moment(games.startTime).format() === moment(startingTime).format()
    )

    const numberOfSignups = Math.min(gamesForTime.length, 3)

    for (let i = 0; i < numberOfSignups; i += 1) {
      randomIndex = faker.random.number({
        min: 0,
        max: gamesForTime.length - 1,
      })

      const randomGame = gamesForTime[randomIndex]

      const duplicate = !!signedGames.find(
        signedGame => signedGame.gameDetails.gameId === randomGame.gameId
      )

      if (duplicate) {
        i -= 1
      } else {
        signedGames.push({
          gameDetails: randomGame,
          priority: i + 1,
          time: randomGame.startTime,
        })
      }
    }
  })

  return signedGames
}

const signup = (games: $ReadOnlyArray<Game>, user: User): Promise<any> => {
  const signedGames = getRandomSignup(games, user)

  return db.user.saveSignup({
    username: user.username,
    signedGames: signedGames,
  })
}

const signupMultiple = (
  games: $ReadOnlyArray<Game>,
  users: $ReadOnlyArray<User>
): Promise<any> => {
  const promises = []

  for (const user of users) {
    if (user.username !== 'admin' /* && user.username !== 'test' */) {
      promises.push(signup(games, user))
    }
  }

  return Promise.all(promises)
}

const signupGroup = async (
  games: $ReadOnlyArray<Game>,
  users: $ReadOnlyArray<User>
): Promise<any> => {
  // Generate random signup data for the first user
  const signedGames = getRandomSignup(games, _.first(users))

  // Assign same signup data for group members
  const promises = []
  for (let i = 0; i < users.length; i++) {
    const signupData = {
      username: users[i].username,
      signedGames: i === 0 ? signedGames : [],
    }

    promises.push(db.user.saveSignup(signupData))
  }

  return Promise.all(promises)
}

export const createSignups = async (strategy: string): Promise<any> => {
  logger.info('Generate signup data')

  let games = []
  try {
    games = await db.game.findGames()
  } catch (error) {
    logger.error(`db.game.findGames error: ${error}`)
  }

  let users = []
  try {
    users = await db.user.findUsers()
  } catch (error) {
    logger.error(`db.game.findUsers error: ${error}`)
  }

  logger.info(`Signup: ${games.length} games`)
  logger.info(`Signup: ${users.length} users`)
  logger.info(`Signup: Generate signup data for ${users.length} users`)

  if (strategy === 'munkres') {
    await signupMultiple(games, users)
  } else if (strategy === 'group') {
    // Group all unique group numbers
    const groupedUsers = users.reduce((acc, user) => {
      acc[user['groupCode']] = acc[user['groupCode']] || []
      acc[user['groupCode']].push(user)
      return acc
    }, {})

    for (const [key: String, value: $ReadOnlyArray<User>] of Object.entries(
      groupedUsers
    )) {
      // $FlowFixMe
      const array = [...value]
      if (key === '0') {
        logger.info('SIGNUP INDIVIDUAL USERS')
        await signupMultiple(games, array)
      } else {
        logger.info(`SIGNUP GROUP ${key}`)
        await signupGroup(games, array)
      }
    }
  }
}
