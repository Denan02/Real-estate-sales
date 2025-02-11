
let period = [];
let cijene = [];
let myChart = null;  
function iscrtajHistogram() {
    const statistika = StatistikaNekretnina();
    const listaNekretnina = [{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 32000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2009.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2003.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },
    {
        id: 2,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 3,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 4,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    }]

    const listaKorisnika = [{
        id: 1,
        ime: "Neko",
        prezime: "Nekic",
        username: "username1",
    },
    {
        id: 2,
        ime: "Neko2",
        prezime: "Nekic2",
        username: "username2",
    }]
    statistika.init(listaNekretnina, listaKorisnika);
    const histogramPodaci = statistika.histogramCijena(period, cijene);

    const ctx = document.getElementById('myChart');
    if (myChart) {
        myChart.destroy();
    }

    const labels = cijene.map(cijena => `${cijena.od} - ${cijena.do} KM`);
    
    const datasets = period.map((p, index) => {
        const data = cijene.map((cijena, cijenaIndex) => {
            return histogramPodaci.filter(d => d.indeksPerioda === index && d.indeksRasporedaCijena === cijenaIndex)
                               .map(d => d.brojNekretnina)[0] || 0;
        });

        return {
            label: `Period ${p.od} - ${p.do}`,
            data: data,
            backgroundColor: `rgba(${index * 50}, ${100 + index * 50}, 150, 0.5)`,
            borderColor: `rgba(${index * 50}, ${100 + index * 50}, 150, 1)`,
            borderWidth: 1
        };
    });

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
function dodajPeriod() {
    let a = document.getElementById("periodOd").value;
    let b = document.getElementById("periodDo").value;
    period.push({od:a, do:b});
}
function dodajCijenu() {
    let a = document.getElementById("cijenaOd").value;
    let b = document.getElementById("cijenaDo").value;
    cijene.push({od:a, do:b});
}
function ponistiUnos() {
    period = [];
    cijene = [];
}