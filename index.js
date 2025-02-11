const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

//////////////////////////////Kreiranje baze
const db = require('./database/db'); // Ako je db.js u istoj putanji

// Sinhronizacija sa bazom
db.sequelize.sync()
  .then(() => {
    console.log("Baza podataka i tabele su kreirane (ako nisu već).");
  })
  .catch((error) => {
    console.log("Greška pri sinhronizaciji: ", error);
  });
  const KorisnikIzBaze = db.korisnik;
  const NekretninaIzBaze = db.nekretnina;
  const UpitIzBaze = db.upit;
/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}
async function saveTxtFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.txt`);
  try {
    await fs.appendFile(filePath, data+'\n', 'utf-8');
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
const loginAttempts = {};
app.post('/login', async (req, res) => {
  const jsonObj = req.body;
  const username = jsonObj.username;
  const password = jsonObj.password;
  const uspijesnaPrijava = `[${new Date().toISOString()}] - username: ${username} - status: uspješno`;
  const neuspijesnaPrijava = `[${new Date().toISOString()}] - username: ${username} - status: neuspješno`;

  if (loginAttempts[username] && loginAttempts[username].lockUntil > Date.now()) {
    const remainingTime = Math.ceil((loginAttempts[username].lockUntil - Date.now()) / 1000);
    saveTxtFile("prijave", neuspijesnaPrijava);
    return res.status(429).json({ "greska": "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu."});
  }
  try {
    ///////////////////////////Spirala4
    let found = false;
    const korisnik = await KorisnikIzBaze.findOne({ where: { username } });
    if(korisnik){
        const isPasswordMatched = await bcrypt.compare(password, korisnik.password);
        if (isPasswordMatched) {
          req.session.username = korisnik.username;
          found = true;
          loginAttempts[username] = { attempts: 0, lockUntil: 0 };
        }
    }

    if (found) {
      saveTxtFile("prijave", uspijesnaPrijava);
      res.json({ poruka: 'Uspješna prijava' });
    } else {
      if (!loginAttempts[username]) {
        loginAttempts[username] = { attempts: 0, lockUntil: 0 };
      }
      loginAttempts[username].attempts++;
      saveTxtFile("prijave", neuspijesnaPrijava);
      // Ako je broj pokušaja prešao 3, blokiramo korisnika na 1 minut
      if (loginAttempts[username].attempts >= 3) {
        loginAttempts[username].attempts = 0;
        loginAttempts[username].lockUntil = Date.now() + 60000; // 1 minut
        res.status(429).json({ "greska": "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu." });
      } else
        res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file

    // Find the user by username
    /////////////////////////////////Spirala4
    const user = await KorisnikIzBaze.findOne({ where: { username } });

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const username = req.session.username
    const id = nekretnina_id;
    const loggedInUser = await KorisnikIzBaze.findOne({ where: { username } });
    const nekretnina = await NekretninaIzBaze.findOne({ where: { id } });

    if (!nekretnina) {
      // Property not found
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }
    //Provjera broja upita
    const upitiVraceni = await UpitIzBaze.findAll({
      where: {
        NekretninaId: id,
        KorisnikId: loggedInUser.id
      }
    });
    if(upitiVraceni.length >= 3) {
      return res.status(429).json({ "greska": "Previse upita za istu nekretninu." });
    }else {
      const upitUpita = await UpitIzBaze.create({
        tekst: tekst_upita,
        KorisnikId: loggedInUser.id,
        NekretninaId: id
      });
      res.status(200).json({ poruka: 'Upit je uspješno dodan' });
    }

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/upiti/moji', async(req, res)=>{
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({greska: 'Neautorizovan pristup'});
  }
  try{
    ////////////////////////////Spirala4
    const username = req.session.username;
    const user = await KorisnikIzBaze.findOne({ where: { username } });
    const KorisnikId = user.id;
    const upiti = await UpitIzBaze.findAll({ where: { KorisnikId } });

    const sviKomentari = [];
    for(const upit of upiti) {
        sviKomentari.push({id_nekretnine:upit.NekretninaId, tekst_upita: upit.tekst});
    }
    if(sviKomentari.length > 0)
      res.status(200).json(sviKomentari);
    else
      res.status(404).json(sviKomentari);
    }catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ greska: 'Internal Server Error' });
    }
});
/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const loggedInUser = await KorisnikIzBaze.findOne({ where: { username: req.session.username } });
    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username; // Pretpostavljamo da je `newUsername` novi username
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }
    await loggedInUser.save();
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    ////////////////Spirala4
    const nekretnineData = await NekretninaIzBaze.findAll();
    const nekretnineJSON = nekretnineData.map(nekretnina => nekretnina.toJSON());
    res.json(nekretnineJSON);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;
  try{
    const nekretnineFiltrirane = await NekretninaIzBaze.findAll({ where: { lokacija } });
    const nekretnineJSON = nekretnineFiltrirane.map(nekretnina => nekretnina.toJSON());
    
    const napraviDatum = function(datumString) {
      const brojevi = datumString.split('.');
      return new Date(`${brojevi[2]}-${brojevi[1]}-${brojevi[0]}`);
    }
    const sortiraneNekretnine = nekretnineJSON.sort((a, b) => {
      return napraviDatum(b.datum_objave) - napraviDatum(a.datum_objave); // Sortira od najnovijeg
    });
    const top5Nekretnine = sortiraneNekretnine.slice(0, 5);
    res.status(200).json(top5Nekretnine);
  }catch(error) {

  }
});


/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async(req, res)=>{

  try {
    const id = parseInt(req.params.id, 10);
    const nekretninaSaId = await NekretninaIzBaze.findOne({ where: { id } });
    const nekretninaJSON = nekretninaSaId.toJSON();
    const NekretninaId  = id;
    const triUpita = await UpitIzBaze.findAll({
      where: { NekretninaId },
      order: [['id_upita', 'DESC']],
      limit: 3
    });
    const upitiJSON = triUpita.map(upit => ({
      korisnik_id: upit.KorisnikId,
      tekst_upita: upit.tekst
    }));
    nekretninaJSON.upiti = upitiJSON;
    res.status(200).json(nekretninaJSON);
  }catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/next/upiti/nekretnina:id', async(req, res)=>{
  try {
    const NekretninaId = parseInt(req.params.id, 10);
    const pageParametar = parseInt(req.query.page, 10);

    const upitiDobijeni = await UpitIzBaze.findAll({ where: { NekretninaId } });
    let brojUpita = upitiDobijeni.length;
    const upitiJSON = upitiDobijeni.map(upit => ({
      korisnik_id: upit.KorisnikId,
      tekst_upita: upit.tekst
    }));

    if(pageParametar > (brojUpita-1)/3.)
      return res.status(404).json();
    if(brojUpita % 3 == 0) {
      const upitiZaVracanje = upitiJSON.slice(brojUpita-3-(pageParametar)*3, brojUpita-(pageParametar)*3)
      res.status(200).json(upitiZaVracanje);
    }
    if(brojUpita % 3 == 1) {
      const pomocna = brojUpita-3-(pageParametar)*3;
      if(pomocna === -2){
        const upitiZaVracanje = upitiJSON.slice(0, 1);
        res.status(200).json(upitiZaVracanje);
      }else {
        const upitiZaVracanje = upitiJSON.slice(brojUpita-3-(pageParametar)*3, brojUpita-(pageParametar)*3)
        res.status(200).json(upitiZaVracanje);
      }
    }
    if(brojUpita % 3 == 2) {
      const pomocna = brojUpita-3-(pageParametar)*3;
      if(pomocna === -1){
        const upitiZaVracanje = upitiJSON.slice(0, 2);
        res.status(200).json(upitiZaVracanje);
      }else {
        const upitiZaVracanje = upitiJSON.slice(brojUpita-3-(pageParametar)*3, brojUpita-(pageParametar)*3)
        res.status(200).json(upitiZaVracanje);
      }
    }
  }catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
