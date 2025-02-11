const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    const Nekretnina = sequelize.define("Nekretnina", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tip_nekretnine: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        naziv: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kvadratura: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cijena: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tip_grijanja: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lokacija: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        godina_izgradnje: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        datum_objave: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('datum_objave');
                if (rawValue) {
                    const date = new Date(rawValue);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mjeseci su 0-indeksirani
                    const year = date.getFullYear();
                    return `${day}.${month}.${year}`;
            }              
            },
            set(value) {
                if (typeof value === 'string') {
                    const parts = value.split('.');
                    this.setDataValue('datum_objave', new Date(`${parts[2]}-${parts[1]}-${parts[0]}`));
                } else {
                    this.setDataValue('datum_objave', value);
                }
            }
        },
        opis: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: 'Nekretnina',
        timestamps: false
    });
    return Nekretnina;
};