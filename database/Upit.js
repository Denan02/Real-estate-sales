const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    const Upit = sequelize.define("Upit", {
        id_upita: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tekst: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: 'Upit',
        timestamps: false
    });
    return Upit;
};