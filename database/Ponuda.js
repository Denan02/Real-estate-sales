const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    const Ponuda = sequelize.define("Ponuda", {
        id_ponude: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tekst: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cijenaPonude: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        datumPonude: {
            type: DataTypes.DATE,
            allowNull: false
        },
        odbijenaPonuda: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        tableName: 'Ponuda',
        timestamps: false
    });
    return Ponuda;
};