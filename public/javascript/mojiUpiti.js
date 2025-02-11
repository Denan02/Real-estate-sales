window.onload =function(){
    const mjestoZaKomentare = document.getElementById("mjestoZaKomentare");
    PoziviAjax.getMojiUpiti(function(err, data) {
        if(err != null){
            window.alert(err)
        }else {
            if(data.length === 0){
                const pElement1 = document.createElement('p');
                pElement1.textContent = "Vi nemate postavljen ni jedan komentar";
                mjestoZaKomentare.appendChild(pElement1);
            }else {
                for(komentar of data) {
                    const divElement = document.createElement('div');
                    divElement.className = 'upit';
                    divElement.style.backgroundColor = '#d3d3d3';
                    const pElement1 = document.createElement('p');
                    pElement1.textContent = `Id nekretnine: ${komentar.id_nekretnine}`;
                    pElement1.className = 'idUpita';
                    const pElement2 = document.createElement('p');
                    pElement2.textContent = `Text upita: ${komentar.tekst_upita}`;
                    pElement2.className = 'textUpita';
                    divElement.appendChild(pElement1);
                    divElement.appendChild(pElement2);
                    mjestoZaKomentare.appendChild(divElement);
                }
            }
        }
    });
}