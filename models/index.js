const Sequelize = require("sequelize");
const sequelize = new Sequelize("forest_test", "root", "root", {
  host: "127.0.0.1",
  dialect: "mysql",
  operatorsAliases: false,
});
const db = {};
db.Sequelize = Sequelize;

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

db.sequelize = sequelize;
db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
module.exports = db;
