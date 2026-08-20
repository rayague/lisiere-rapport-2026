/**
 * Lecteur dBase III/IV minimal, sans dependance.
 * Le .dbf d'un shapefile est sa table d'attributs : c'est la donnee tabulaire.
 */
const fs = require('fs');

function lireDBF(chemin, encodage = 'latin1') {
  const b = fs.readFileSync(chemin);

  const nbEnregistrements = b.readUInt32LE(4);
  const longueurEntete    = b.readUInt16LE(8);
  const longueurLigne     = b.readUInt16LE(10);
  const maj = `${1900 + b[1]}-${String(b[2]).padStart(2,"0")}-${String(b[3]).padStart(2,"0")}`;

  // descripteurs de champs : 32 octets chacun, jusqu'au terminateur 0x0D
  const champs = [];
  for (let o = 32; b[o] !== 0x0D && o < longueurEntete; o += 32) {
    champs.push({
      nom:      b.toString('ascii', o, o + 11).replace(/\0.*$/, '').trim(),
      type:     String.fromCharCode(b[o + 11]),
      longueur: b[o + 16],
      decimales:b[o + 17]
    });
  }

  const lignes = [];
  let pos = longueurEntete;
  for (let i = 0; i < nbEnregistrements; i++) {
    const supprime = b[pos] === 0x2A;
    let o = pos + 1;
    const ligne = {};
    for (const c of champs) {
      const brut = b.toString(encodage, o, o + c.longueur).trim();
      o += c.longueur;
      if (c.type === 'N' || c.type === 'F') {
        ligne[c.nom] = brut === '' ? null : Number(brut);
      } else if (c.type === 'L') {
        ligne[c.nom] = /^[YyTt]$/.test(brut) ? true : /^[NnFf]$/.test(brut) ? false : null;
      } else {
        ligne[c.nom] = brut;
      }
    }
    if (!supprime) lignes.push(ligne);
    pos += longueurLigne;
  }

  return { maj, nbEnregistrements, champs, lignes };
}

module.exports = { lireDBF };

if (require.main === module) {
  const t = lireDBF(process.argv[2]);
  console.log('  derniere maj du fichier : ' + t.maj);
  console.log('  enregistrements         : ' + t.nbEnregistrements.toLocaleString('fr-FR'));
  console.log('  champs                  : ' + t.champs.length + '\n');
  t.champs.forEach(c =>
    console.log('    ' + c.nom.padEnd(14) + c.type + '  longueur ' + String(c.longueur).padStart(3) +
                (c.decimales ? '  decimales ' + c.decimales : '')));
  console.log('\n  --- premier enregistrement ---');
  console.log(JSON.stringify(t.lignes[0], null, 2));
}
