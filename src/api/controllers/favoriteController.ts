import { logger } from 'utils/logger';
import { db } from 'db/mongodb';
import { validateAuthHeader } from 'utils/authHeader';
import { Request, Response } from 'express';
import { UserGroup } from 'typings/user.typings';

// Add favorite data for user
const postFavorite = async (req: Request, res: Response): Promise<unknown> => {
  logger.info('API call: POST /api/favorite');
  const favoriteData = req.body.favoriteData;

  const validToken = validateAuthHeader(
    req.headers.authorization,
    UserGroup.user
  );

  if (!validToken) {
    return res.sendStatus(401);
  }

  try {
    const saveFavoriteResponse = await db.user.saveFavorite(favoriteData);

    return res.json({
      message: 'Update favorite success',
      status: 'success',
      favoritedGames: saveFavoriteResponse.favoritedGames,
    });
  } catch (error) {
    return res.json({
      message: 'Update favorite failure',
      status: 'error',
      error,
    });
  }
};

export { postFavorite };
