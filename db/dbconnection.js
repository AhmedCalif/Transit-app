import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize('freedb_craftersconnect', 'freedb_ahmedcalif', 'zCY!xbum3j#HFj8', {
    host: 'sql.freedb.tech',
    dialect: 'mysql',
    logging: console.log
});

export default sequelize;
