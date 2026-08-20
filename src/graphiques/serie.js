/**
 * ============================================================================
 * LISIÈRE, graphiques/serie.js
 * ----------------------------------------------------------------------------
 * La ligne du hero devient la courbe de distribution.
 *
 * C'est le morphing, et il doit se lire comme une TRANSFORMATION, pas comme un
 * remplacement : la courbe se déplie depuis une ligne plate posée sur l'axe,
 * exactement là où le trait de côte se trouvait.
 *
 * 700 ms, ease power2.inOut. Les annotations suivent, décalées de 40 ms.
 * Total sous le plafond de 800 ms.
 *
 * Les aires colorées apparaissent APRÈS le dépliage : elles n'ont de sens
 * qu'une fois la courbe formée, et les faire grandir en même temps
 * brouillerait la lecture de la forme.
 * ============================================================================
 */

import gsap from 'gsap';
import { deplier } from '../ligne.js';

export function initSerie({ reduit }) {
  const svg = document.querySelector('.graphe--courbe');
  if (!svg) return;

  const courbe = svg.querySelector('.courbe');
  const aires  = svg.querySelectorAll('.aire');
  const axes   = svg.querySelectorAll('.axe');
  const notes  = document.querySelectorAll('.annotations li');
  if (!courbe) return;

  if (reduit) return;                    // tout reste en état final

  /* L'ordonnée de l'axe des abscisses, lue dans le SVG : la ligne plate part
     exactement de la ligne de base, pas d'une valeur devinée. */
  const axeBas = svg.querySelector('.axe:not(.axe--zero)');
  const base = axeBas ? Number(axeBas.getAttribute('y1')) : 300;

  gsap.set(aires, { opacity: 0 });
  gsap.set(axes,  { opacity: 0 });
  gsap.set(notes, { opacity: 0, y: 8 });

  deplier(courbe, { base, duree: 0.7, reduit, declencheur: svg });

  gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 60%', once: true } })
    .to(axes,  { opacity: 1, duration: 0.3 }, 0)
    .to(aires, { opacity: 0.14, duration: 0.35 }, 0.45)
    .to(notes, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.04 }, 0.55);
}
