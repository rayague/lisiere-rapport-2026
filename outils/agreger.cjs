/**
 * Agregation finale : kilometres de trait de cote par region et par classe
 * d evolution. Trois sources jointes spatialement, aucune valeur recopiee.
 *
 * DEUX ABSENCES, DEUX TRAITEMENTS DIFFERENTS
 *
 * Un segment hors de tout polygone d evolution est une INFORMATION : le
 * Cerema n a pas couvert cette portion. On la garde a part, on ne la comble pas.
 *
 * Un segment hors de tout polygone regional est un ARTEFACT : les points
 * cotiers sont par construction sur la limite administrative, et une moitie
 * tombe cote mer. On rattache alors a la region la plus proche, dans une
 * tolerance de 5 km. Aucune ambiguite possible : il n y a pas de region
 * concurrente de l autre cote de l eau.
 */
const path = require('path'), fs = require('fs');
const { lireDBF } = require('./lire-dbf.cjs');
const { lireSHP, longueur, milieu, dansPolygone, distanceAuBord } = require('./lire-shp.cjs');
const { versWGS84 } = require('./lambert93.cjs');

const R = path.join(__dirname, '..', 'data', 'brut');
const SENTINELLE = -9999;
const TOLERANCE  = 0.05;          // degres, environ 5 km

const poly = { d: lireDBF(path.join(R,'extrait','N_evolution_trait_cote_fr_epsg2154_S.dbf')),
               g: lireSHP(path.join(R,'extrait','N_evolution_trait_cote_fr_epsg2154_S.shp')) };
const lig  = { d: lireDBF(path.join(R,'extrait_N_traits_cote_naturels_recents_L','N_traits_cote_naturels_recents_fr_epsg2154_L.dbf')),
               g: lireSHP(path.join(R,'extrait_N_traits_cote_naturels_recents_L','N_traits_cote_naturels_recents_fr_epsg2154_L.shp')) };
const reg  = { d: lireDBF(path.join(R,'extrait_regions_osm','regions-20180101.dbf'),'utf8'),
               g: lireSHP(path.join(R,'extrait_regions_osm','regions-20180101.shp')) };

function indexer(formes, maille) {
  const m = new Map();
  formes.forEach((f, k) => {
    if (!f.boite) return;
    for (let i = Math.floor(f.boite[0]/maille); i <= Math.floor(f.boite[2]/maille); i++)
      for (let j = Math.floor(f.boite[1]/maille); j <= Math.floor(f.boite[3]/maille); j++) {
        const c = i+':'+j; if (!m.has(c)) m.set(c, []); m.get(c).push(k);
      }
  });
  return m;
}
const idxPoly = indexer(poly.g, 2000);
const idxReg  = indexer(reg.g, 0.25);

function contient(idx, formes, pt, maille) {
  for (const k of idx.get(Math.floor(pt[0]/maille)+':'+Math.floor(pt[1]/maille)) || [])
    if (dansPolygone(pt, formes[k])) return k;
  return null;
}
function plusProche(idx, formes, pt, maille, tol) {
  let best = tol, trouve = null;
  const gi = Math.floor(pt[0]/maille), gj = Math.floor(pt[1]/maille);
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++)
    for (const k of idx.get((gi+di)+':'+(gj+dj)) || []) {
      const d = distanceAuBord(pt, formes[k]);
      if (d < best) { best = d; trouve = k; }
    }
  return trouve;
}

const parRegion = new Map();
const bilan = { recul:0, stable:0, accretion:0, nonMesure:0, horsPoly:0 };
let direct = 0, parProximite = 0, sansRegion = 0, kmSansRegion = 0;

lig.g.forEach((f, k) => {
  const km = lig.d.lignes[k].long_km || longueur(f)/1000;
  const m = milieu(f); if (!m) return;

  const iPoly = contient(idxPoly, poly.g, m, 2000);
  const taux  = iPoly === null ? null : poly.d.lignes[iPoly].taux;
  const classe = iPoly === null ? 'horsPoly'
               : taux === SENTINELLE ? 'nonMesure'
               : taux < 0 ? 'recul' : taux > 0 ? 'accretion' : 'stable';
  bilan[classe] += km;

  const p = versWGS84(m[0], m[1]);
  let iReg = contient(idxReg, reg.g, p, 0.25);
  if (iReg !== null) direct++;
  else { iReg = plusProche(idxReg, reg.g, p, 0.25, TOLERANCE); if (iReg !== null) parProximite++; }
  if (iReg === null) { sansRegion++; kmSansRegion += km; return; }

  const d = reg.d.lignes[iReg];
  if (!parRegion.has(d.nom)) parRegion.set(d.nom,
    { nom: d.nom, code: d.code_insee, recul:0, stable:0, accretion:0, nonMesure:0, horsPoly:0, segments:0 });
  const r = parRegion.get(d.nom);
  r[classe] += km; r.segments++;
});

const total = lig.g.length;
console.log('=== RATTACHEMENT REGIONAL ===');
console.log('  dans la region            : ' + direct.toLocaleString('fr-FR') + '  ' + (direct/total*100).toFixed(1) + ' %');
console.log('  par proximite (max 5 km)  : ' + parProximite.toLocaleString('fr-FR') + '  ' + (parProximite/total*100).toFixed(1) + ' %');
console.log('  non rattaches             : ' + sansRegion.toLocaleString('fr-FR') + '  ' + (sansRegion/total*100).toFixed(1) + ' %  (' + kmSansRegion.toFixed(1) + ' km)');
console.log('  couverture totale         : ' + ((direct+parProximite)/total*100).toFixed(1) + ' %\n');

const lignes = [...parRegion.values()]
  .map(r => ({ ...r, mesure: r.recul + r.stable + r.accretion }))
  .filter(r => r.mesure > 0)
  .sort((a, b) => b.recul/b.mesure - a.recul/a.mesure);

console.log('=== KILOMETRES PAR REGION LITTORALE ===');
console.log('  region                        mesure    recul   stable  accret.   % recul');
for (const r of lignes)
  console.log('  ' + r.nom.padEnd(28) + r.mesure.toFixed(0).padStart(6) + r.recul.toFixed(0).padStart(9) +
              r.stable.toFixed(0).padStart(9) + r.accretion.toFixed(0).padStart(9) +
              (r.recul/r.mesure*100).toFixed(1).padStart(9) + ' %');

const sommeMesure = lignes.reduce((s,r)=>s+r.mesure,0);
const sommeRecul  = lignes.reduce((s,r)=>s+r.recul,0);
console.log('  ' + 'TOTAL'.padEnd(28) + sommeMesure.toFixed(0).padStart(6) + sommeRecul.toFixed(0).padStart(9) +
            ''.padStart(18) + (sommeRecul/sommeMesure*100).toFixed(1).padStart(9) + ' %');

console.log('\n=== BILAN NATIONAL (tous segments) ===');
for (const [n,v] of Object.entries(bilan)) console.log('  ' + n.padEnd(11) + v.toFixed(1).padStart(9) + ' km');

fs.writeFileSync(path.join(__dirname,'..','data','agregat-brut.json'),
  JSON.stringify({ bilan, regions: lignes, rattachement:{direct,parProximite,sansRegion,kmSansRegion} }, null, 2));
console.log('\n  ecrit dans data/agregat-brut.json');
