const { logger } = require('../../utils/logger')
const db = require('../../db/mongodb')
// const validateAuthHeader = require('../../utils/authHeader');

// Get settings
const getSettings = (req, res) => {
  logger.info('API call: GET /api/settings')

  /*
  const authHeader = req.headers.authorization;
  const validToken = validateAuthHeader(authHeader, 'admin');

  if (!validToken) {
    res.json({
      code: 401,
      message: 'Unauthorized',
      status: 'error',
    });
  }
  */

  return db.getSettingsData().then(
    response => {
      const gamesData = {
        blacklistedGames: response.blacklisted_games,
      }

      // logger.info(response.blacklisted_games);
      // logger.info(response.signup_time);

      res.json({
        message: 'Getting settings success',
        status: 'success',
        games: gamesData,
        signupTime: response.signup_time,
      })
    },
    error => {
      logger.error(`Settings: ${error}`)
      res.json({
        message: 'Getting settings failed',
        status: 'error',
        error,
      })
    }
  )
}

module.exports = { getSettings }
