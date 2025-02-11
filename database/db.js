const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("wt24", "root", "", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import modela
db.korisnik = require(__dirname + '/korisnik.js')(sequelize, DataTypes);
db.nekretnina = require(__dirname + '/nekretnina.js')(sequelize, DataTypes);
db.upit = require(__dirname + '/upit.js')(sequelize, DataTypes);
db.zahtjev = require(__dirname + '/zahtjev.js')(sequelize, DataTypes);
db.ponuda = require(__dirname + '/ponuda.js')(sequelize, DataTypes);

//veze izmedju tabela
db.nekretnina.hasMany(db.upit,{as:'vezaNekretninaUpit'});
db.nekretnina.hasMany(db.zahtjev,{as:'vezaNekretninaZahtjev'});
db.korisnik.hasMany(db.zahtjev,{as:'vezaKorisnikZahtjev'});
db.korisnik.hasMany(db.upit,{as:'vezaKorisnikUpit'});
db.korisnik.hasMany(db.ponuda,{as:'vezaKorisnikPonuda'});

db.ponuda.belongsTo(db.ponuda, { as: 'vezanaPonuda', foreignKey: 'vezanePonude' });
db.ponuda.hasMany(db.ponuda, { as: 'vezanePonudeList', foreignKey: 'vezanePonude' });


module.exports = db;
