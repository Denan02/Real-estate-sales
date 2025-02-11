
window.onload =function(){
        const urlParams = new URLSearchParams(window.location.search);
        const idNekretnine = urlParams.get('id');
        PoziviAjax.getNekretnina(idNekretnine, function(err, data) {
            if(err != null){    	
                window.alert(err)
            }else {
                let niz = [];
                if(data.upiti.length != 0) {
                    for(upit of data.upiti) {
                        const glavni = document.createElement('div');
                        glavni.classList.add('glavni');
            
                        const upitDiv = document.createElement('div');
                        upitDiv.classList.add('upit');
            
                        const usernameParagraf = document.createElement('p');
                        usernameParagraf.innerHTML = `<strong>User id: </strong>${upit.korisnik_id}`;
                        upitDiv.appendChild(usernameParagraf);
            
                        const tekstParagraf = document.createElement('p');
                        tekstParagraf.innerHTML = `<strong>Text upita:</strong> ${upit.tekst_upita}`;
                        upitDiv.appendChild(tekstParagraf);
                        glavni.appendChild(upitDiv)
                        niz.push(glavni);
                    }
                    const carouselWrapper = document.getElementById("upiti");
                    const carousel = postaviCarousel(carouselWrapper, niz, 0, idNekretnine);
                    const dugmeLijevo = document.getElementById("nazad");
                    const dugmeDesno = document.getElementById("naprijed");
                    dugmeLijevo.addEventListener("click", carousel.fnLijevo);
                    dugmeDesno.addEventListener("click", carousel.fnDesno);
                }else {
                    const divZaUpite = document.getElementById("upiti");
                    const upitDiv = document.createElement('div');
                    upitDiv.classList.add('upit');
                    pElement = document.createElement('p');
                    pElement.textContent = "Za ovu nekretninu nema postavljenih upita";
                    upitDiv.appendChild(pElement);
                    divZaUpite.appendChild(upitDiv);
                }
                upisiPodatke(data);
            }
        });


        document.getElementById("lokacija").addEventListener("click", function() {
            PoziviAjax.getTop5Nekretnina(document.getElementById("lokacija").innerHTML, function(err, data) {
                if(err != null){
                    window.alert(err)
                }else {
                    const mjestoZaTop5Nekretnina = document.getElementById("topNekretnine");
                    mjestoZaTop5Nekretnina.innerHTML = "";
                    for(nekretnina of data) {
                        const htmlZaNekretninu = `<div class="nekretnina">
                                                    <img class="slika-nekretnine" src="../Resources/${nekretnina.id}.jpg" alt="Slika">
                                                    <div class="detalji-nekretnine">
                                                        <h3>${nekretnina.tip_nekretnine}</h3>
                                                        <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                                                    </div>
                                                    <div class="cijena-nekretnine">
                                                        <p>Cijena: ${nekretnina.cijena} €</p>
                                                    </div>
                                                    <a href="../html/detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
                                                </div>`;
                        mjestoZaTop5Nekretnina.innerHTML += htmlZaNekretninu;
                    }
                }
            });
        });
}

function upisiPodatke(podaci) {
    /*                      Osnovno                 */
    const osnovnoDiv = document.getElementById("osnovno");

    const slikaElement = document.createElement('img');
    slikaElement.classList.add('slika-nekretnine');
    slikaElement.src = `../Resources/${podaci.id}.jpg`;
    slikaElement.alt = podaci.naziv;
    osnovnoDiv.appendChild(slikaElement);

    let pElement = document.createElement('p');
    let strongElement = document.createElement('strong');
    strongElement.textContent = 'Naziv:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.naziv));  // Dodavanje teksta
    osnovnoDiv.appendChild(pElement);

    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Kvadratura:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.kvadratura));  // Dodavanje teksta
    osnovnoDiv.appendChild(pElement);

    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Cijena:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.cijena));  // Dodavanje teksta
    osnovnoDiv.appendChild(pElement);

    /*             Detalji            */
    const kolona1 = document.getElementById("kolona1");
    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Tip grijanja:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.tip_grijanja));  // Dodavanje teksta
    kolona1.insertBefore(pElement, kolona1.firstChild);

    const lokacijaMjesto = document.getElementById("lokacija");
    lokacijaMjesto.innerHTML = `${podaci.lokacija}`;


    const kolona2 = document.getElementById("kolona2");
    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Godina izgradnje:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.godina_izgradnje));  // Dodavanje teksta
    kolona2.appendChild(pElement);

    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Datum objave oglasa:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.datum_objave));  // Dodavanje teksta
    kolona2.appendChild(pElement);


    const opis = document.getElementById("opis");
    pElement = document.createElement('p');
    strongElement = document.createElement('strong');
    strongElement.textContent = 'Opis:';
    pElement.appendChild(strongElement);
    pElement.appendChild(document.createTextNode(podaci.opis));  // Dodavanje teksta
    opis.appendChild(pElement);
}