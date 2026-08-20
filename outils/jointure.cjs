/**
 * Jointure spatiale : rattache chaque segment de trait de cote naturel recent
 * au polygone d'evolution qui le contient, pour obtenir des KILOMETRES par
 * classe d'evolution et non de simples comptages de segments.
 *
 * Sans cette jointure, la seule chose disponible serait « 27,7 % des segments
 * reculent ». Multiplier ce pourcentage par la longueur totale supposerait des
 * segments de longueur egale, ce qui est faux. Ce serait un chiffre invente.
 */
const path = require('path');
const { lireDBF } = require('./lire-dbf.cjs');
const { lireSHP, longueur, milieu, dansPolygone } = require('./lire-shp.cjs');

const RACINE = path.join(__dirname, '..', 'data', 'brut');
const SENTINELLE = -9999;

const poly = {
  d: lireDBF(path.join(RACINE, 'extrait', 'N_evolution_trait_cote_fr_epsg2154_S.dbf')),
  g: lireSHP(path.join(RACINE, 'extrait', 'N_evolution_trait_cote_fr_epsg2154_S.shp'))
};
const ligne = {
  d: lireDBF(path.join(RACINE, 'extrait_N_traits_cote_naturels_recents_L', 'N_traits_cote_naturels_recents_fr_epsg2154_L.dbf')),
  g: lireSHP(path.join(RACINE, 'extrait_N_traits_cote_naturels_recents_L', 'N_traits_cote_naturels_recents_fr_epsg2154_L.shp'))
};

console.log('  polygones d evolution : ' + poly.g.length.toLocaleString('fr-FR'));
console.log('  segments de trait     : ' + ligne.g.length.toLocaleString('fr-FR'));

/* index en grille sur les boites englobantes : sans lui, 161 millions de tests */
const MAILLE = 2000;                                   // 2 km, en metres
const grille = new Map();
const cle = (i, j) => i + ':' + j;
poly.g.forEach((f, k) => {
  if (!f.boite) return;
  const [x0, y0, x1, y1] = f.boite;
  for (let i = Math.floor(x0 / MAILLE); i <= Math.floor(x1 / MAILLE); i++)
    for (let j = Math.floor(y0 / MAILLE); j <= Math.floor(y1 / MAILLE); j++) {
      const c = cle(i, j);
      if (!grille.has(c)) grille.set(c, []);
      grille.get(c).push(k);
    }
});
console.log('  mailles de l index    : ' + grille.size.toLocaleString('fr-FR'));

const classes = {
  recul:     { km: 0, n: 0 },
  stable:    { km: 0, n: 0 },
  accretion: { km: 0, n: 0 },
  nonMesure: { km: 0, n: 0 },   // sentinelle -9999 : le producteur n a pas mesure
  horsPoly:  { km: 0, n: 0 }    // aucun polygone ne couvre ce segment
};

const detail = [];
ligne.g.forEach((f, k) => {
  const km = ligne.d.lignes[k].long_km || longueur(f) / 1000;
  const m = milieu(f);
  if (!m) { classes.horsPoly.km += km; classes.horsPoly.n++; return; }

  const candidats = grille.get(cle(Math.floor(m[0] / MAILLE), Math.floor(m[1] / MAILLE))) || [];
  let trouve = null;
  for (const idx of candidats) if (dansPolygone(m, poly.g[idx])) { trouve = idx; break; }

  if (trouve === null) { classes.horsPoly.km += km; classes.horsPoly.n++; return; }

  const taux = poly.d.lignes[trouve].taux;
  const c = taux === SENTINELLE ? 'nonMesure' : taux < 0 ? 'recul' : taux > 0 ? 'accretion' : 'stable';
  classes[c].km += km; classes[c].n++;
  if (c !== 'nonMesure') detail.push({ km, taux, x: m[0], y: m[1] });
});

const total = Object.values(classes).reduce((s, c) => s + c.km, 0);
console.log('\n=== KILOMETRES PAR CLASSE ===');
for (const [nom, c] of Object.entries(classes))
  console.log('  ' + nom.padEnd(11) + String(c.n).padStart(5) + ' segments   ' +
              c.km.toFixed(1).padStart(8) + ' km   ' + (c.km / total * 100).toFixed(1).padStart(5) + ' %');
console.log('  ' + 'TOTAL'.padEnd(11) + String(ligne.g.length).padStart(5) + ' segments   ' + total.toFixed(1).padStart(8) + ' km');

const mesure = classes.recul.km + classes.stable.km + classes.accretion.km;
console.log('\n=== SUR LE LINEAIRE REELLEMENT MESURE (' + mesure.toFixed(1) + ' km) ===');
for (const n of ['recul', 'stable', 'accretion'])
  console.log('  ' + n.padEnd(11) + classes[n].km.toFixed(1).padStart(8) + ' km   ' +
              (classes[n].km / mesure * 100).toFixed(1).padStart(5) + ' %');

require('fs').writeFileSync(path.join(__dirname, '..', 'data', 'jointure-detail.json'),
  JSON.stringify({ classes, mesure, total, detail }, null, 0));
console.log('\n  detail ecrit dans data/jointure-detail.json');
