/**
 * Lecteur de geometrie shapefile, sans dependance.
 * Ne gere que ce dont le projet a besoin : polylignes (3) et polygones (5).
 * Coordonnees en Lambert 93, donc en metres : les longueurs et les tests
 * d'appartenance se calculent directement, sans reprojection.
 */
const fs = require('fs');

function lireSHP(chemin) {
  const b = fs.readFileSync(chemin);
  if (b.readInt32BE(0) !== 9994) throw new Error('en-tete shapefile invalide');

  const formes = [];
  let o = 100;                                  // l'en-tete fait 100 octets

  while (o < b.length) {
    const longueurContenu = b.readInt32BE(o + 4) * 2;
    const debut = o + 8;
    const type = b.readInt32LE(debut);

    if (type === 3 || type === 5) {             // polyligne ou polygone
      const boite = [0, 8, 16, 24].map(d => b.readDoubleLE(debut + 4 + d));
      const nbParties = b.readInt32LE(debut + 36);
      const nbPoints  = b.readInt32LE(debut + 40);

      const parties = [];
      for (let i = 0; i < nbParties; i++) parties.push(b.readInt32LE(debut + 44 + i * 4));

      const oPoints = debut + 44 + nbParties * 4;
      const anneaux = [];
      for (let i = 0; i < nbParties; i++) {
        const d = parties[i];
        const f = i + 1 < nbParties ? parties[i + 1] : nbPoints;
        const anneau = [];
        for (let j = d; j < f; j++) {
          anneau.push([b.readDoubleLE(oPoints + j * 16), b.readDoubleLE(oPoints + j * 16 + 8)]);
        }
        anneaux.push(anneau);
      }
      formes.push({ type, boite, anneaux });
    } else {
      formes.push({ type, boite: null, anneaux: [] });   // nul ou non gere
    }
    o = debut + longueurContenu;
  }
  return formes;
}

/* longueur d'une polyligne, en metres (Lambert 93) */
function longueur(forme) {
  let t = 0;
  for (const a of forme.anneaux)
    for (let i = 1; i < a.length; i++)
      t += Math.hypot(a[i][0] - a[i-1][0], a[i][1] - a[i-1][1]);
  return t;
}

/* point au milieu du developpe d'une polyligne : plus representatif
   qu'un simple centroide, qui peut tomber hors du trait sur une courbe */
function milieu(forme) {
  const total = longueur(forme);
  let parcouru = 0;
  for (const a of forme.anneaux) {
    for (let i = 1; i < a.length; i++) {
      const d = Math.hypot(a[i][0] - a[i-1][0], a[i][1] - a[i-1][1]);
      if (parcouru + d >= total / 2) {
        const r = d === 0 ? 0 : (total / 2 - parcouru) / d;
        return [a[i-1][0] + (a[i][0] - a[i-1][0]) * r,
                a[i-1][1] + (a[i][1] - a[i-1][1]) * r];
      }
      parcouru += d;
    }
  }
  const a = forme.anneaux[0];
  return a && a.length ? a[Math.floor(a.length / 2)] : null;
}

/* appartenance d'un point a un polygone, par lancer de rayon */
function dansPolygone(pt, forme) {
  const [x, y] = pt;
  if (forme.boite && (x < forme.boite[0] || x > forme.boite[2] ||
                      y < forme.boite[1] || y > forme.boite[3])) return false;
  let dedans = false;
  for (const a of forme.anneaux) {
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
      const [xi, yi] = a[i], [xj, yj] = a[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
    }
  }
  return dedans;
}

module.exports = { lireSHP, longueur, milieu, dansPolygone };

/* distance d un point aux bords d un polygone, en unites de la projection.
   Sert au rattachement des points cotiers, qui tombent souvent juste au
   large de la limite administrative alors qu ils appartiennent sans
   ambiguite a la region qui les borde. */
function distanceAuBord(pt, forme) {
  const [x, y] = pt;
  let min = Infinity;
  for (const a of forme.anneaux) {
    for (let i = 1; i < a.length; i++) {
      const [x1, y1] = a[i-1], [x2, y2] = a[i];
      const dx = x2 - x1, dy = y2 - y1;
      const l2 = dx*dx + dy*dy;
      const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((x-x1)*dx + (y-y1)*dy) / l2));
      min = Math.min(min, Math.hypot(x - (x1 + t*dx), y - (y1 + t*dy)));
      if (min === 0) return 0;
    }
  }
  return min;
}
module.exports.distanceAuBord = distanceAuBord;
