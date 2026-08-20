/**
 * ============================================================================
 * LISIÈRE, graphiques/classement.js
 * ----------------------------------------------------------------------------
 * Les barres régionales poussent depuis leur origine.
 *
 * C'est la section la plus animée du document, donc celle qui doit finir le
 * plus vite : 500 ms de course, décalage de 40 ms entre les barres, soit
 * 780 ms pour la dernière. Sous le plafond de 800 ms du brief.
 *
 * Le décalage est de 40 ms et non de 120 comme dans SÈVE : là-bas on
 * cherchait la respiration, ici on cherche la lecture.
 *
 * Chaque barre se dessine une fois, à l'entrée, puis s'arrête. Jamais de
 * boucle, jamais de rejeu au scroll inverse : un graphique qui rebouge est un
 * graphique qu'on ne peut pas lire.
 *
 * On anime scaleX et non l'attribut width : seuls transform, opacity et
 * filter sont autorisés, les autres déclenchent un recalcul de mise en page
 * à chaque frame.
 * ============================================================================
 */

import gsap from 'gsap';

export function initClassement({ reduit }) {
  const svg = document.querySelector('.graphe--barres');
  if (!svg) return;

  const valeurs = svg.querySelectorAll('.barre__valeur');
  const textes  = svg.querySelectorAll('.barre__part');
  if (!valeurs.length) return;

  if (reduit) return;                    // les barres restent à leur longueur

  gsap.set(valeurs, { transformOrigin: 'left center', scaleX: 0 });
  gsap.set(textes,  { opacity: 0 });

  gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 72%', once: true } })
    .to(valeurs, {
      scaleX: 1,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.04
    })
    /* Les pourcentages n'apparaissent qu'une fois la barre en place :
       un chiffre qui se déplace pendant qu'on le lit est illisible. */
    .to(textes, { opacity: 1, duration: 0.2, stagger: 0.04 }, '-=0.35');
}
