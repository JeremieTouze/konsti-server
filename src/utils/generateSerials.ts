import generator from 'generate-serial-number';
import { logger } from 'utils/logger';
import { db } from 'db/mongodb';

const isInt = (n): boolean => parseInt(n, 10) % 1 === 0;

const generateSerials = async (): Promise<void> => {
  const serials: any = [];
  const count = process.argv[2];
  if (!count || !isInt(count)) {
    logger.error('Give number parameter: "npm run generate-serials 10"');
  } else {
    for (let i = 1; i <= parseInt(count, 10); i += 1) {
      const serial = generator.generate(10);
      serials.push(serial);
      logger.info(`${serial}`);
    }

    try {
      await db.connectToDb();
    } catch (error) {
      logger.error(error);
    }

    try {
      await db.serial.removeSerials();
    } catch (error) {
      logger.error(`Error removing serials: ${error}`);
    }

    try {
      await db.serial.saveSerials(serials);
    } catch (error) {
      logger.error(`Error saving serials: ${error}`);
    }
  }

  try {
    await db.gracefulExit();
  } catch (error) {
    logger.error(error);
  }
};

generateSerials().catch((error) => {
  logger.error(error);
});
