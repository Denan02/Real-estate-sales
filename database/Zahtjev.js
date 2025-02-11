const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    const Zahtjev = sequelize.define("Zahtjev", {
        id_zahtjeva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tekst: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        trazeniDatum: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        odobren: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        tableName: 'Zahtjev',
        timestamps: false
    });
    return Zahtjev;
};