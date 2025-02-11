let StatistikaNekretnina = function() {
    //privatni atributi modula
    let listaNekretnina = [];
    let listaKorisnika = [];
/*                                                             DOBIJENE FUNKCIJE                                                      */
    let filtrirajNekretnine = function (kriterij) {
        return listaNekretnina.filter(nekretnina => {
            // Filtriranje po tipu nekretnine
            if (kriterij.tip_nekretnine && nekretnina.tip_nekretnine !== kriterij.tip_nekretnine) {
                return false;
            }

            // Filtriranje po minimalnoj kvadraturi
            if (kriterij.min_kvadratura && nekretnina.kvadratura < kriterij.min_kvadratura) {
                return false;
            }

            // Filtriranje po maksimalnoj kvadraturi
            if (kriterij.max_kvadratura && nekretnina.kvadratura > kriterij.max_kvadratura) {
                return false;
            }

            // Filtriranje po minimalnoj cijeni
            if (kriterij.min_cijena && nekretnina.cijena < kriterij.min_cijena) {
                return false;
            }

            // Filtriranje po maksimalnoj cijeni
            if (kriterij.max_cijena && nekretnina.cijena > kriterij.max_cijena) {
                return false;
            }

            return true;
        });
    }

    let ucitajDetaljeNekretnine = function (id) {
        return listaNekretnina.find(nekretnina => nekretnina.id === id) || null;
    }
/*                                                             MOJE FUNKCIJE                                                      */
    let init = function (listaNekretninaP, listaKorisnikaP) {
        listaNekretnina = listaNekretninaP;
        listaKorisnika = listaKorisnikaP;
    }
    let prosjecnaKvadratura = function (kriterij) {
        let filtriraniNizNekretnina = filtrirajNekretnine(kriterij);
        let prosjecnaKvadraturaPovratna = 0.0;
        if(filtriraniNizNekretnina.length == 0)
            return 0;
        for(let i = 0; i < filtriraniNizNekretnina.length; i++) {
            prosjecnaKvadraturaPovratna += filtriraniNizNekretnina[i].kvadratura;
        }
        return prosjecnaKvadraturaPovratna/filtriraniNizNekretnina.length;
    }
    let outlier = function(kriterij,nazivSvojstva) {
        if(listaNekretnina.length == 0)
            return null;
        let srednjaVrijednost = 0.0;
        for(let i = 0; i < listaNekretnina.length; i++) {
            srednjaVrijednost += listaNekretnina[i][nazivSvojstva];
        }
        srednjaVrijednost = srednjaVrijednost / listaNekretnina.length;
        let filtriraniNizNekretnina = filtrirajNekretnine(kriterij);
        if(filtriraniNizNekretnina.length == 0)
            return null;
        let objekatZaReturn = filtriraniNizNekretnina[0];
        for(let i = 0; i < filtriraniNizNekretnina.length; i++) {
            if(Math.abs(filtriraniNizNekretnina[i][nazivSvojstva] - srednjaVrijednost)> Math.abs(objekatZaReturn[nazivSvojstva] - srednjaVrijednost))
                objekatZaReturn = filtriraniNizNekretnina[i];
        }

        return objekatZaReturn;
    }
    let mojeNekretnine = function(korisnik) {
        let listaZaVracanje = [];
        for(let i = 0; i < listaNekretnina.length; i++) {
            if(listaNekretnina[i].upiti.filter(upit => upit.korisnik_id === korisnik.id).length > 0) 
                listaZaVracanje.push(listaNekretnina[i]);
        }
        listaZaVracanje.sort((a, b) => b.upiti.length - a.upiti.length);
        return listaZaVracanje;
    }
    let histogramCijena = function(periodi,rasponiCijena) {
        let vratiListu = [];
        for(let i = 0; i < periodi.length; i++) {
            filtriraneNekretninePoPeriodu = listaNekretnina.filter(nekretnina => {
                const godinaObjave = parseInt(nekretnina.datum_objave.split(".")[2]);

                return godinaObjave >= periodi[i].od && godinaObjave <= periodi[i].do;
            });
            for(let j = 0; j < rasponiCijena.length; j++) {
                filtriraneNekretninePoCijeni = filtriraneNekretninePoPeriodu.filter(nekretnina => {
                    return nekretnina.cijena >= rasponiCijena[j].od && nekretnina.cijena <= rasponiCijena[j].do;
                });
                vratiListu.push({indeksPerioda:i,indeksRasporedaCijena:j,brojNekretnina:filtriraneNekretninePoCijeni.length});
            }
        }
        return vratiListu;
    }
    return{
        init : init,
        prosjecnaKvadratura : prosjecnaKvadratura,
        outlier : outlier,
        mojeNekretnine : mojeNekretnine,
        histogramCijena : histogramCijena
    }
};