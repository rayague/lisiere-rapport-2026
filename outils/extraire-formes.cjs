/**
 * Extrait les formes de LA ligne, a nombre de points constant.
 *
 * Le concept du rapport : une seule ligne parcourt le document et change de
 * sens d'une section a l'autre. Pour l'interpoler sans plugin payant, toutes
 * les formes doivent avoir le MEME nombre de points, dans le meme ordre.
 * C'est toute l'astuce.
 *
 * Ce script lit les sources brutes, non versionnees, et produit
 * data/formes.json, qui l'est. La page se reconstruit donc sans les 60 Mo.
 */
const fs = require('fs'), path = require('path');
const { lireDBF } = require('./lire-dbf.cjs');
const { lireSHP, longueur, milieu } = require('./lire-shp.cjs');

const N = 64;                       // identique pour toutes les formes
const R = path.join(__dirname, '..', 'data');

/* ---------------------------------------------------- 1. le littoral reel
   Les 7 830 segments ne forment pas une ligne continue : ce sont des troncons
   disperses autour de la France. On les ordonne par angle autour du centroide
   du littoral, ce qui redessine le contour cotier dans l'ordre du parcours. */

const lig = {
  d: lireDBF(path.join(R,'brut','extrait_N_traits_cote_naturels_recents_L','N_traits_cote_naturels_recents_fr_epsg2154_L.dbf')),
  g: lireSHP(path.join(R,'brut','extrait_N_traits_cote_naturels_recents_L','N_traits_cote_naturels_recents_fr_epsg2154_L.shp'))
};

const pts = lig.g.map((f,i) => ({ p: milieu(f), km: lig.d.lignes[i].long_km || 0 }))
                 .filter(o => o.p);
const cx = pts.reduce((s,o)=>s+o.p[0],0)/pts.length;
const cy = pts.reduce((s,o)=>s+o.p[1],0)/pts.length;

pts.forEach(o => { o.a = Math.atan2(o.p[1]-cy, o.p[0]-cx); });
pts.sort((a,b) => a.a - b.a);

/* echantillonnage regulier en angle : N points repartis sur le tour complet */
const littoral = [];
for (let i = 0; i < N; i++) {
  const cible = -Math.PI + (i / N) * 2 * Math.PI;
  let best = pts[0], d = Infinity;
  for (const o of pts) { const e = Math.abs(o.a - cible); if (e < d) { d = e; best = o; } }
  littoral.push([best.p[0], best.p[1]]);
}

/* normalisation dans un carre 0..1000, en conservant les proportions */
const xs = littoral.map(p=>p[0]), ys = littoral.map(p=>p[1]);
const [x0,x1,y0,y1] = [Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];
const ech = 1000 / Math.max(x1-x0, y1-y0);
const norm = littoral.map(([x,y]) => [
  +((x - x0) * ech).toFixed(1),
  +((y1 - y) * ech).toFixed(1)        // y inverse : SVG descend
]);

/* ------------------------------------------- 2. la courbe de distribution */
const t = JSON.parse(fs.readFileSync(path.join(R,'traite.json'),'utf8'));
const cl = t.distribution.classes;
const kmMax = Math.max(...cl.map(c=>c.km));
const tMin = t.distribution.borneMin, tMax = t.distribution.borneMax;

const distribution = [];
for (let i = 0; i < N; i++) {
  const taux = tMin + (i/(N-1)) * (tMax - tMin);
  // valeur de la classe qui contient ce taux, 0 si aucune
  const c = cl.find(c => taux >= c.taux && taux < c.taux + t.distribution.pas);
  distribution.push([
    +((i/(N-1)) * 1000).toFixed(1),
    +(1000 - (c ? c.km/kmMax : 0) * 1000).toFixed(1)
  ]);
}

/* ------------------------------------------------ 3. le classement en barres
   Huit regions etalees sur N points : chaque region occupe N/8 points a la
   meme hauteur, ce qui donne un profil en escalier interpolable. */
const reg = t.regions;
const classement = [];
for (let i = 0; i < N; i++) {
  const r = reg[Math.min(reg.length-1, Math.floor(i / (N/reg.length)))];
  classement.push([
    +((i/(N-1)) * 1000).toFixed(1),
    +(1000 - (r.partRecul / 100) * 1000).toFixed(1)
  ]);
}

/* ------------------------------------------------------- 4. le trait simple */
const trait = [];
for (let i = 0; i < N; i++) trait.push([+((i/(N-1))*1000).toFixed(1), 500]);

const sortie = { n: N, viewBox: [0,0,1000,1000],
                 formes: { littoral: norm, distribution, classement, trait } };
fs.writeFileSync(path.join(R,'formes.json'), JSON.stringify(sortie));

console.log('  N par forme : ' + N);
for (const [nom,f] of Object.entries(sortie.formes))
  console.log('  ' + nom.padEnd(14) + f.length + ' points   ' + (f.length===N ? 'ok' : 'ECART'));
console.log('');
console.log('  formes.json : ' + (fs.statSync(path.join(R,'formes.json')).size/1024).toFixed(1) + ' Ko');
