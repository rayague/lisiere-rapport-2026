/**
 * ============================================================================
 * LISIÈRE, compteur.js
 * ----------------------------------------------------------------------------
 * DEUX COMPTEURS DANS TOUT LE DOCUMENT. Pas un de plus.
 *
 * Le chiffre du hero et celui de la section 04. Des nombres qui défilent
 * partout, c'est un tic, et ça rend un rapport illisible : le lecteur attend
 * la fin de l'animation avant de pouvoir citer quoi que ce soit.
 *
 * La valeur finale est lue dans le DOM, jamais passée en paramètre. Sans
 * JavaScript, le chiffre exact est déjà là et rien ne manque.
 *
 * font-variant-numeric: tabular-nums est indispensable et posé dans le CSS :
 * sans lui, la largeur du nombre change à chaque frame et toute la page
 * tremble pendant le décompte.
 * ============================================================================
 */

import gsap from 'gsap';

const FR = new Intl.NumberFormat('fr-FR');

/**
 * Compte de zéro jusqu'à la valeur déjà inscrite dans l'élément.
 * Plafond de 900 ms : au-delà, on fait patienter quelqu'un devant une
 * information, ce que le brief interdit.
 */
export function compter(el, { duree = 0.7, reduit = false, declencheur, cible } = {}) {
  if (!el) return;

  /* La valeur finale vient du texte en place, jamais d'un argument, sauf
     lorsque l'état de départ a déjà été posé au démarrage : dans ce cas
     le texte affiche zéro et la cible est transmise. */
  if (cible === undefined) cible = Number(el.textContent.replace(/[^\d]/g, ''));
  if (!Number.isFinite(cible) || cible === 0) return;

  if (reduit) return;                    // le chiffre exact reste affiché

  const etat = { v: 0 };
  gsap.to(etat, {
    v: cible,
    duration: duree,
    ease: 'power2.out',
    onUpdate() { el.textContent = FR.format(Math.round(etat.v)).replace(/ | /g, ' '); },
    onComplete() { el.textContent = FR.format(cible).replace(/ | /g, ' '); },
    scrollTrigger: declencheur ? { trigger: declencheur, start: 'top 70%', once: true } : undefined
  });

  // état de départ posé tout de suite, sinon la valeur finale clignote
  el.textContent = '0';
}
