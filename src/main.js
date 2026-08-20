/**
 * ============================================================================
 * LISIÈRE, main.js
 * ----------------------------------------------------------------------------
 * Chef d'orchestre.
 *
 * LA RÈGLE QUI PRIME ICI N'EST PAS CELLE DE SÈVE.
 *
 * Dans SÈVE, l'animation était le contenu. Ici elle est au service du nombre :
 * une animation ne doit jamais retarder la compréhension d'un chiffre. Si un
 * lecteur doit attendre pour lire une valeur, l'animation est ratée, quelle
 * que soit sa beauté.
 *
 * Plafond absolu : 800 ms pour qu'un graphique atteigne son état final.
 *
 * Pas de flou de vitesse : il servait la caméra dans SÈVE, ici il rendrait
 * les chiffres flous. Supprimé, et Lenis n'est là que pour la fluidité du
 * défilement et la synchronisation de ScrollTrigger.
 *
 * Tout part d'un HTML déjà complet et exact. Le JavaScript pose un état de
 * départ puis revient à l'état du document. S'il échoue, rien ne manque.
 * ============================================================================
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { playSignature } from './signature.js';
import { tracer } from './ligne.js';
import { compter } from './compteur.js';
import { initSerie } from './graphiques/serie.js';
import { initClassement } from './graphiques/classement.js';

gsap.registerPlugin(ScrollTrigger);

const racine = document.documentElement;
racine.classList.add('js');

const REDUIT = matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ═══════════════════════════════════════════════════════════════ tokens
   Le module de signature est autonome et ne lit aucun token. C'est main.js
   qui les lui passe, ce qui fait tenir ensemble deux règles opposées :
   aucun hexadécimal hors de tokens.css, et un module copiable dans une
   page vide.                                                              */

const cs = getComputedStyle(racine);
const jeton = n => cs.getPropertyValue(n).trim();

const TOKENS = {
  papier: jeton('--papier'),
  encre:  jeton('--encre'),
  recul:  jeton('--recul')
};


/* ═══════════════════════════════════════════════════════════════ scroll */

const lenis = new Lenis({ duration: 1.0, smoothWheel: true });
lenis.stop();

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);


/* ═══════════════════════════════════════════════════════ entrée du hero
   La ligne se trace, le chiffre compte, le titre monte. Les trois EN MÊME
   TEMPS, pas l'un après l'autre : le lecteur vient chercher un chiffre, il
   ne doit pas attendre la fin d'une chorégraphie pour l'obtenir.          */

function entreeHero() {
  const titre  = document.querySelector('.hero .display');
  const sous   = document.querySelector('.hero .etiquette--sous');
  const chiffre = document.querySelector('.hero .chiffre');
  const note   = document.querySelector('.hero .note--large');
  const littoral = document.querySelector('.ligne--littoral path');

  if (REDUIT) {
    gsap.set([titre, sous, chiffre, note].filter(Boolean), { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline();

  tl.fromTo([titre, sous, chiffre, note].filter(Boolean),
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, 0);

  /* Le tracé est déjà amorcé au démarrage : on ne fait que le dérouler. */
  if (littoral) {
    tl.to(littoral, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.1);
  }

  // le compteur démarre AVEC le tracé, pas après : le lecteur vient
  // chercher un chiffre, il ne doit pas attendre la fin d'une chorégraphie
  compter(document.querySelector('.hero .chiffre__valeur'),
          { duree: 0.7, reduit: REDUIT, cible: cibleHero });
}


/* ══════════════════════════════════════════════════════ 04, la section nue
   Le chiffre compte. Point final. Pas de graphique, pas de ligne, rien
   d'autre sur l'écran. C'est le silence de la méthode transposé au registre
   documentaire : sans lui, le rapport n'est qu'une succession de graphiques. */

function initEnjeu() {
  const section = document.querySelector('.enjeu');
  if (!section) return;
  compter(section.querySelector('.chiffre__valeur'),
          { duree: 0.9, reduit: REDUIT, declencheur: section });
}


/* ═════════════════════════════════════════════════════ 05, méthode
   Un fondu montant de 16 px. Rien d'autre. C'est la conclusion, pas un
   pied de page, et elle n'a pas besoin d'être mise en scène.              */

function initMethode() {
  const section = document.querySelector('.methode');
  if (!section) return;

  gsap.fromTo(section.children,
    { y: REDUIT ? 0 : 16, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: REDUIT ? 0.2 : 0.5,
      ease: 'power2.out',
      stagger: REDUIT ? 0 : 0.05,
      scrollTrigger: { trigger: section, start: 'top 75%', once: true }
    });
}


/* ═════════════════════════════════════════════════════════════ démarrage */

/* État de départ posé IMMÉDIATEMENT, pas au moment de l'entrée. Sans cela,
   lorsque la signature est sautée parce qu'elle a déjà été vue, elle se
   résout après un fondu de 0,3 s et le lecteur voit le chiffre final sauter
   à zéro avant de remonter. Le même sursaut vaut pour le titre et la ligne. */

let cibleHero;

if (!REDUIT) {
  gsap.set(['.hero .display', '.hero .etiquette--sous', '.hero .chiffre', '.hero .note--large'],
           { y: 16, opacity: 0 });

  const compteurHero = document.querySelector('.hero .chiffre__valeur');
  if (compteurHero) {
    cibleHero = Number(compteurHero.textContent.replace(/[^\d]/g, ''));
    compteurHero.textContent = '0';
  }

  const littoral = document.querySelector('.ligne--littoral path');
  if (littoral) {
    const l = littoral.getTotalLength();
    gsap.set(littoral, { strokeDasharray: l, strokeDashoffset: l });
  }
}

initSerie({ reduit: REDUIT });
initClassement({ reduit: REDUIT });
initEnjeu();
initMethode();

/* La signature en dernier. Raccourcie à 1,6 s : un lecteur venu chercher un
   chiffre n'a aucune patience, et savoir raccourcir sa propre signature
   selon le contexte fait partie du métier.

   Troisième palette du studio, troisième démonstration que la signature est
   une chorégraphie et non une palette. */
playSignature({
  peau:  TOKENS.recul,
  chair: TOKENS.papier,
  fond:  TOKENS.encre,
  duration: 1.6,
  oncePerSession: true,
  storageKey: 'lisiere-signature-vue'
}).then(() => {
  lenis.start();
  entreeHero();
  ScrollTrigger.refresh();
});
