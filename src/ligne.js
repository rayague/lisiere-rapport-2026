/**
 * ============================================================================
 * LISIÈRE, ligne.js
 * ----------------------------------------------------------------------------
 * Le morphing de la ligne, cœur du concept. C'est le seul effet spectaculaire
 * autorisé de tout le document : il relie les sections et porte l'idée qu'une
 * seule ligne parcourt le rapport en changeant de sens.
 *
 * ----------------------------------------------------------------------------
 * POURQUOI PAS DE PLUGIN
 *
 * MorphSVGPlugin est réservé aux abonnés du Club GreenSock, et flubber
 * ajouterait une dépendance pour trente lignes de code.
 *
 * Toute l'astuce tient en une phrase : deux formes construites avec le MÊME
 * nombre de points, dans le même ordre, s'interpolent terme à terme. Il suffit
 * alors d'animer un scalaire de 0 à 1 et de redessiner le path.
 *
 * Ici les points sont lus directement dans le `d` du SVG déjà présent dans la
 * page. La forme finale n'est donc jamais calculée par le JavaScript : elle est
 * dans le HTML, et le morphing part d'un état de départ pour y revenir. Si le
 * script échoue, la page reste exacte.
 * ============================================================================
 */

import gsap from 'gsap';

/* ------------------------------------------------------------- lecture */

/** Extrait les points d'un `d` composé uniquement de M et de L. */
export function lirePoints(d) {
  return d.trim().split(/(?=[ML])/)
    .map(s => s.replace(/^[ML]\s*/, '').trim())
    .filter(Boolean)
    .map(s => s.split(/[\s,]+/).map(Number))
    .filter(p => p.length === 2 && p.every(Number.isFinite));
}

export const versD = pts =>
  pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ');

/** Interpolation terme à terme. Les deux formes doivent avoir le même N. */
export const melanger = (a, b, t) =>
  a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);


/* ------------------------------------------------------------ morphing */

/**
 * Fait apparaître une courbe en la dépliant depuis une ligne plate.
 * La ligne plate est construite à partir de la courbe elle-même : mêmes
 * abscisses, ordonnée unique. Le nombre de points est donc identique par
 * construction, sans avoir à le déclarer.
 */
export function deplier(path, { base, duree = 0.7, reduit = false, declencheur }) {
  const cible = lirePoints(path.getAttribute('d'));
  if (cible.length < 2) return;

  const plat = cible.map(p => [p[0], base]);
  path.setAttribute('d', versD(plat));

  if (reduit) {
    gsap.set(path, { attr: { d: versD(cible) } });
    return;
  }

  const etat = { t: 0 };
  gsap.to(etat, {
    t: 1,
    duration: duree,
    ease: 'power2.inOut',
    onUpdate() { path.setAttribute('d', versD(melanger(plat, cible, etat.t))); },
    scrollTrigger: { trigger: declencheur || path, start: 'top 60%', once: true }
  });
}


/**
 * Trace une ligne de gauche à droite par stroke-dasharray.
 * Utilisé pour le littoral du hero : la ligne se dessine, elle n'apparaît pas.
 */
export function tracer(path, { duree = 0.9, retard = 0, reduit = false } = {}) {
  if (reduit) return gsap.timeline();

  const l = path.getTotalLength();
  gsap.set(path, { strokeDasharray: l, strokeDashoffset: l });

  return gsap.timeline().to(path, {
    strokeDashoffset: 0,
    duration: duree,
    ease: 'power2.inOut',
    delay: retard
  });
}
