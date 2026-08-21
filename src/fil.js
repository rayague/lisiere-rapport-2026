/**
 * ============================================================================
 * LISIÈRE, fil.js
 * ----------------------------------------------------------------------------
 * LE FIL CONTINU. Une seule ligne qui traverse tout le document.
 *
 * Le concept du projet tient en une phrase : un trait de côte EST une ligne.
 * Elle est le littoral dans le hero, devient une courbe de distribution, puis
 * le profil d'un classement, puis redevient un trait sous la conclusion.
 *
 * CE MODULE EST PUREMENT ADDITIF, ET C'EST DELIBERE.
 *
 * Il ne remplace aucun graphique et n'en masque aucun tant qu'il n'a pas
 * réussi. Les quatre SVG de la page restent la source de vérité : ce sont eux
 * qui portent les données, les tableaux équivalents et les libellés. Le fil se
 * contente de leur emprunter leur forme. S'il échoue, ou si le JavaScript ne
 * s'exécute pas, la page reste exactement celle d'aujourd'hui.
 *
 * POURQUOI LE CACHE EST EN COORDONNEES UTILISATEUR
 *
 * Les quatre formes vivent dans quatre viewBox différents : 1000x1000 pour le
 * littoral, 1000x340 pour la courbe, 820x464 pour les barres, 1000x4 pour le
 * trait. Echantillonner un chemin coûte cher, la matrice de projection non.
 * Les points sont donc calculés UNE FOIS dans l'espace de leur propre SVG,
 * puis reprojetés à chaque image par getScreenCTM. Le fil se pose ainsi
 * exactement sur le graphique réel à toutes les tailles d'écran, sans qu'une
 * seule coordonnée soit devinée ni codée en dur.
 * ============================================================================
 */

/* Toutes les formes sont rééchantillonnées sur ce nombre de points. Une
   interpolation terme à terme exige des tableaux de même longueur : c'est le
   même principe que le morphing de serie.js, appliqué à quatre formes qui
   n'ont au départ ni le même nombre de points ni la même échelle. */
const POINTS = 160;


/* ═══════════════════════════════════════════════════ lecture des formes */

/** Echantillonne un <path> en POINTS points, dans SON espace utilisateur. */
function pointsDuChemin(chemin) {
  const total = chemin.getTotalLength();
  if (!total) return null;
  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    const p = chemin.getPointAtLength((i / (POINTS - 1)) * total);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

/**
 * Construit le profil du classement à partir des barres elles-mêmes.
 *
 * Les barres sont des <rect>, pas un chemin : il n'y a rien à échantillonner.
 * Le fil trace donc l'extrémité droite de chaque barre, ce qui donne un profil
 * en escalier. C'est la forme que prend une ligne quand elle devient un
 * classement, et elle reste lue depuis la géométrie réelle des barres, jamais
 * depuis les données recopiées.
 */
function pointsDesBarres(svg) {
  const barres = [...svg.querySelectorAll('.barre__valeur')];
  if (barres.length < 2) return null;

  const noeuds = barres.map(r => ({
    x: parseFloat(r.getAttribute('x')) + parseFloat(r.getAttribute('width')),
    y: parseFloat(r.getAttribute('y')) + parseFloat(r.getAttribute('height')) / 2
  }));

  // rééchantillonnage linéaire du profil sur POINTS points
  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    const t = (i / (POINTS - 1)) * (noeuds.length - 1);
    const j = Math.min(Math.floor(t), noeuds.length - 2);
    const f = t - j;
    pts.push({
      x: noeuds[j].x + (noeuds[j + 1].x - noeuds[j].x) * f,
      y: noeuds[j].y + (noeuds[j + 1].y - noeuds[j].y) * f
    });
  }
  return pts;
}


/* ═══════════════════════════════════════════════════════════ projection */

/** Reprojette des points d'un espace SVG vers les pixels de la fenêtre. */
function projeter(pts, svg) {
  const m = svg.getScreenCTM();
  if (!m) return null;
  return pts.map(p => ({
    x: m.a * p.x + m.c * p.y + m.e,
    y: m.b * p.x + m.d * p.y + m.f
  }));
}

/** Interpolation terme à terme entre deux formes de même longueur. */
function melanger(a, b, t) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = { x: a[i].x + (b[i].x - a[i].x) * t, y: a[i].y + (b[i].y - a[i].y) * t };
  }
  return out;
}

const versD = pts =>
  pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');

// adoucit la transition d'une station à l'autre, sans jamais l'accélérer
const adoucir = t => t * t * (3 - 2 * t);


/* ══════════════════════════════════════════════════════════════ montage */

export function initFil({ reduit = false } = {}) {
  /* En mouvement réduit, le fil n'existe pas. Une ligne qui se déforme en
     permanence au défilement est exactement ce que ce réglage refuse, et les
     quatre graphiques d'origine suffisent à porter l'information. */
  if (reduit) return null;

  const sources = [
    document.querySelector('.ligne--littoral'),
    document.querySelector('.graphe--courbe'),
    document.querySelector('.graphe--barres'),
    document.querySelector('.ligne--trait')
  ];
  if (sources.some(s => !s)) return null;

  // les formes, lues une fois dans leur propre espace
  let cache;
  try {
    cache = [
      pointsDuChemin(sources[0].querySelector('path')),
      pointsDuChemin(sources[1].querySelector('.courbe')),
      pointsDesBarres(sources[2]),
      pointsDuChemin(sources[3].querySelector('path'))
    ];
  } catch (_) { return null; }
  if (cache.some(c => !c)) return null;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'fil');
  svg.setAttribute('aria-hidden', 'true');       // décoratif : le sens est dans les SVG d'origine
  svg.setAttribute('preserveAspectRatio', 'none');
  const trait = document.createElementNS(NS, 'path');
  trait.setAttribute('class', 'fil__trait');
  svg.appendChild(trait);
  document.body.appendChild(svg);

  let W = 0, H = 0;
  const mesurer = () => {
    W = window.innerWidth; H = window.innerHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  };
  mesurer();

  let arme = false;
  let priseActuelle = -1;

  function dessiner() {
    /* POINT DE POSE DE CHAQUE STATION, en position de défilement.

       Un repère fixe au milieu de la fenêtre ne marche pas : le littoral du
       hero est en haut de page et ne peut JAMAIS être centré, si bien qu'au
       premier écran le fil se croyait déjà en route vers la courbe et
       affichait un littoral déformé.

       La première station se pose donc en haut du document et la dernière
       tout en bas, par définition. Les autres se posent là où elles sont
       centrées. Chaque forme est ainsi exacte quand on la regarde. */
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const maxi = Math.max(1, document.documentElement.scrollHeight - H);
    const dernier = sources.length - 1;

    /* Seule la PREMIERE station est épinglée, en haut du document, parce que
       le littoral du hero ne peut jamais être centré. La dernière ne l'est
       pas : épingler le trait final au bas du document le plaçait 722 px
       au-delà de sa position réelle, si bien que le fil n'atteignait sa forme
       finale qu'une fois ce trait sorti de l'écran, donc jamais visible. */
    const poses = sources.map((s, k) => {
      if (k === 0) return 0;
      const r = s.getBoundingClientRect();
      return Math.min(maxi, Math.max(0, y + r.top + r.height / 2 - H / 2));
    });

    let i = 0;
    while (i < dernier - 1 && y >= poses[i + 1]) i++;

    const a = poses[i], b = poses[i + 1];
    const t = b <= a ? 0 : Math.min(1, Math.max(0, (y - a) / (b - a)));

    const pa = projeter(cache[i], sources[i]);
    const pb = projeter(cache[i + 1], sources[i + 1]);
    if (!pa || !pb) return;

    trait.setAttribute('d', versD(melanger(pa, pb, adoucir(t))));

    /* LE FIL N'EXISTE QUE LA OU IL Y A UN GRAPHIQUE.

       Un fondu à mi-transit ne suffisait pas. Entre les barres et le trait
       final s'intercale la section nue, plus de 1000 px de transit sur mobile :
       le fil y affichait un mélange qui ne décrit rien, en travers du texte.

       Le brief est net sur cette section : pas de graphique, pas de ligne,
       rien d'autre sur l'écran. L'opacité ne suit donc plus la progression
       mais la PRESENCE A L'ECRAN de la station dominée. Dès qu'aucun
       graphique n'est en vue, le fil s'efface complètement. */
    const prise = t < 0.5 ? i : i + 1;
    const r = sources[prise].getBoundingClientRect();

    /* La FRACTION VISIBLE de la station, et non sa distance hors champ.
       Mesurer la distance laissait le fil encré jusqu'à 284 px après la sortie
       de sa station : le trait final était déjà entièrement au-dessus de
       l'écran que le fil s'affichait encore à 99 %. Avec la fraction visible,
       une station sortie du champ vaut zéro, sans tolérance. */
    const vu = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));

    /* Le seuil de pleine encre est le QUART de l'écran, pas la hauteur du
       graphique. Exiger qu'il tienne entièrement dans la fenêtre affichait le
       littoral à 63 % au chargement sur mobile, où il dépasse sous la ligne de
       flottaison. Un quart d'écran visible suffit à dire qu'on y est.
       Le trait final, haut de 4 px, garde sa propre hauteur pour seuil. */
    const plein = Math.max(1, Math.min(r.height, H * 0.25));
    trait.style.opacity = Math.min(1, vu / plein).toFixed(3);

    if (prise !== priseActuelle) {
      sources.forEach((s, k) => s.classList.toggle('fil-pris', k === prise));
      priseActuelle = prise;
    }

    /* Le fil ne devient visible qu'ICI, après un premier rendu réussi. Tant
       qu'il n'a rien dessiné, rien n'est masqué ni ajouté : une panne du
       module laisse la page exactement telle qu'elle est sans lui. */
    if (!arme) {
      arme = true;
      document.documentElement.classList.add('fil-actif');
    }
  }

  window.addEventListener('resize', () => { mesurer(); dessiner(); }, { passive: true });

  return { dessiner, mesurer };
}
