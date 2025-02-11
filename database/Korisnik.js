const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    const Korisnik = sequelize.define("Korisnik", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prezime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        tableName: 'Korisnik',
        timestamps: false
    });
    return Korisnik;
};