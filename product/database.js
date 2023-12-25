const { Sequelize } = require('sequelize');

const dbConfig = {
    HOST: "postgresql",
    USER: "postgres",
    PASSWORD: "postgres",
    DB: "postgres",
    dialect: "postgres",
    PORT:5433,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
  }
}

const sequelize = new Sequelize(
  dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD
  , {
    host: dbConfig.HOST,
  dialect: 'postgres',
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(error => console.error('Unable to connect to the database:', error));

module.exports = sequelize;