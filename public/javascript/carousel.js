function postaviCarousel(glavniElement, sviElementi, indeks=0, idNekretnine) {
    if (!glavniElement || !sviElementi || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }
    glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    let pageParam = 1;
    let smijemPozvati = 0;
    // Funkcija za prelazak na prethodni element
    function fnLijevo() {
        indeks--;
        if(indeks < 0){
            indeks = sviElementi.length-1;
            if(indeks < 0)
                indeks = 0;              
        }
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    }

    // Funkcija za prelazak na sledeći element
    function fnDesno() {
        indeks++;
        if(indeks > sviElementi.length-1){
            if (smijemPozvati == 0) {
                PoziviAjax.getNextUpiti(idNekretnine, pageParam, function(err, data) {
                    if(err != null){
                        smijemPozvati = 1;
                        indeks = 0;
                        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
                    }else {
                        pageParam++;
                        for(upit of data) {
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
                            sviElementi.push(glavni);
                            glavniElement.innerHTML = sviElementi[indeks].innerHTML;
                        }
                    }
                });
            }else {
                indeks = 0;
                glavniElement.innerHTML = sviElementi[indeks].innerHTML;
            }
        }else {
            glavniElement.innerHTML = sviElementi[indeks].innerHTML;
        }
    }

    // Vraćanje objekta sa funkcijama
    return {
        fnLijevo,
        fnDesno
    };
}