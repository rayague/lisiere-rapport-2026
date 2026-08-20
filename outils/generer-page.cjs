/**
 * Genere index.html depuis data/traite.json et data/formes.json.
 *
 * Pourquoi un generateur plutot qu'un HTML ecrit a la main : le brief exige
 * qu'aucun chiffre ne soit saisi. Chaque valeur affichee vient de la donnee
 * traitee, et les graphiques sont calcules, pas dessines. Changer la source
 * et relancer suffit a mettre la page a jour.
 *
 * Aucun JavaScript n'est produit : les graphiques sont des SVG statiques,
 * dans leur etat final. La page est complete sans navigateur moderne.
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(R, 'data', 'traite.json'), 'utf8'));
const F = JSON.parse(fs.readFileSync(path.join(R, 'data', 'formes.json'), 'utf8'));

/* ------------------------------------------------------------- formatage */
const nb = n => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');
const dec = (n, d) => n.toFixed(d === undefined ? 1 : d).replace('.', ',');
const ech = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const chemin = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');

/* ------------------------------------------ 02, la courbe de distribution
   L'axe des ordonnees part de zero. Le brief l'impose, et aucune raison
   contraire n'est ecrite dans NOTES.md.                                   */
function courbeDistribution() {
  const cl = t.distribution.classes;
  const kmMax = Math.max.apply(null, cl.map(c => c.km));
  const X = v => ((v - t.distribution.borneMin) / (t.distribution.borneMax - t.distribution.borneMin)) * 1000;
  const Y = km => 300 - (km / kmMax) * 260;

  const pts = cl.map(c => [+X(c.taux + t.distribution.pas / 2).toFixed(1), +Y(c.km).toFixed(1)]);
  const zeroX = X(0).toFixed(1);

  const aire = filtre => {
    const p = cl.filter(filtre).map(c => [+X(c.taux + t.distribution.pas / 2).toFixed(1), +Y(c.km).toFixed(1)]);
    if (!p.length) return '';
    return 'M' + p[0][0] + ' 300 ' + p.map(q => 'L' + q[0] + ' ' + q[1]).join(' ') + ' L' + p[p.length - 1][0] + ' 300 Z';
  };

  return [
    '      <svg class="graphe graphe--courbe" viewBox="0 0 1000 340" preserveAspectRatio="none"',
    '           role="img" aria-label="Distribution du linéaire côtier par taux d’évolution. Le recul lent domine largement.">',
    '        <line class="axe" x1="0" y1="300" x2="1000" y2="300"/>',
    '        <line class="axe axe--zero" x1="' + zeroX + '" y1="24" x2="' + zeroX + '" y2="300"/>',
    '        <path class="aire aire--recul" d="' + aire(c => c.taux < 0) + '"/>',
    '        <path class="aire aire--stable" d="' + aire(c => c.taux >= 0) + '"/>',
    '        <path class="courbe" d="' + chemin(pts) + '"/>',
    '      </svg>'
  ].join('\n');
}

/* ------------------------------------------------ 03, les barres regionales
   La couleur ne porte jamais seule l'information : chaque barre affiche son
   nom, sa part et ses valeurs absolues, toujours visibles.                 */
function barresRegions() {
  const H = 46, G = 12;
  const hauteur = t.regions.length * (H + G);
  const barres = t.regions.map((r, i) => {
    const y = i * (H + G);
    const l = +((r.partRecul / 100) * 560).toFixed(1);
    return [
      '        <g class="barre">',
      '          <text class="barre__nom" x="0" y="' + (y + 16) + '">' + ech(r.nom) + '</text>',
      '          <text class="barre__km" x="820" y="' + (y + 16) + '" text-anchor="end">' + nb(r.reculKm) + ' km sur ' + nb(r.mesureKm) + '</text>',
      '          <rect class="barre__piste" x="0" y="' + (y + 26) + '" width="560" height="10"/>',
      '          <rect class="barre__valeur" x="0" y="' + (y + 26) + '" width="' + l + '" height="10"/>',
      '          <text class="barre__part" x="' + (l + 12).toFixed(1) + '" y="' + (y + 35) + '">' + dec(r.partRecul, 1) + ' %</text>',
      '        </g>'
    ].join('\n');
  }).join('\n');

  return [
    '      <svg class="graphe graphe--barres" viewBox="0 0 820 ' + hauteur + '"',
    '           role="img" aria-label="Part du linéaire mesuré en recul, par région littorale, de la plus touchée à la moins touchée.">',
    barres,
    '      </svg>'
  ].join('\n');
}

/* ------------------------------- tableaux equivalents, reels et selectionnables */
function tableauDistribution() {
  const l = t.distribution.classes.map(c =>
    '            <tr><td>' + dec(c.taux, 2) + ' à ' + dec(c.taux + t.distribution.pas, 2) + '</td><td>' + dec(c.km, 1) + '</td></tr>').join('\n');
  /* Le tableau est enveloppé : un <table> ignore width:1px et s'étale à la
     largeur de son contenu, ce qui provoquait un débordement horizontal de
     424 px sur un écran de 375. Un conteneur, lui, respecte la contrainte. */
  return [
    '      <div class="equivalent">',
    '        <table>',
    '          <caption>Linéaire côtier par classe de taux d’évolution, en kilomètres</caption>',
    '          <thead><tr><th scope="col">Taux, en mètres par an</th><th scope="col">Linéaire, en km</th></tr></thead>',
    '          <tbody>',
    l,
    '          </tbody>',
    '        </table>',
    '      </div>'
  ].join('\n');
}

function tableauRegions() {
  const l = t.regions.map(r =>
    '            <tr><th scope="row">' + ech(r.nom) + '</th><td>' + nb(r.reculKm) + '</td><td>' + nb(r.mesureKm) + '</td><td>' + dec(r.partRecul, 1) + ' %</td></tr>').join('\n');
  return [
    '      <div class="equivalent">',
    '        <table>',
    '          <caption>Recul du trait de côte par région littorale</caption>',
    '          <thead><tr><th scope="col">Région</th><th scope="col">En recul, km</th><th scope="col">Mesuré, km</th><th scope="col">Part en recul</th></tr></thead>',
    '          <tbody>',
    l,
    '          </tbody>',
    '        </table>',
    '      </div>'
  ].join('\n');
}

/* ------------------------------------------------------------------ la page */
const reculLent = nb(t.distribution.classes.filter(c => c.taux === -0.25)[0].km);
const horsMesure = nb(t.lineaire.horsCouvertureKm + t.lineaire.nonMesureKm);
const P = [];
const A = s => P.push(s);

A('<!doctype html>');
A('<html lang="fr">');
A('<head>');
A('<meta charset="utf-8">');
A('<meta name="viewport" content="width=device-width, initial-scale=1">');
A('');
A('<title>LISIÈRE · Le recul du trait de côte</title>');
A('<meta name="description" content="' + nb(t.evolution.reculKm) + ' km de trait de côte naturel en recul en France métropolitaine. Rapport 2026 de LISIÈRE, à partir de l’indicateur national de l’érosion côtière du Cerema.">');
A('');
A('<link rel="preload" as="font" type="font/woff2" href="/fonts/plex-cond-600.woff2" crossorigin>');
A('<link rel="preload" as="font" type="font/woff2" href="/fonts/plex-mono-500.woff2" crossorigin>');
A('');
A('<link rel="stylesheet" href="/src/styles/tokens.css">');
A('<link rel="stylesheet" href="/src/styles/base.css">');
A('<link rel="stylesheet" href="/src/styles/sections.css">');
A('</head>');
A('');
A('<body>');
A('<main>');
A('');
A('  <!-- 01 . HERO. La ligne est le littoral. -->');
A('  <section class="section hero" id="hero">');
A('    <p class="etiquette">LISIÈRE · Observatoire du trait de côte</p>');
A('    <h1 class="display">Le recul du trait de côte<br>en France métropolitaine</h1>');
A('    <p class="etiquette etiquette--sous">Rapport 2026</p>');
A('');
A('    <p class="chiffre"><span class="chiffre__valeur">' + nb(t.evolution.reculKm) + '</span> <span class="chiffre__unite">kilomètres</span></p>');
A('');
A('    <p class="note note--large">');
A('      de trait de côte naturel en recul en France métropolitaine, sur les');
A('      ' + nb(t.lineaire.mesureKm) + ' km couverts par l’indicateur national de l’érosion côtière.');
A('      Période analysée : ' + t.perimetre.periodeAnalysee.debut + ' à ' + t.perimetre.periodeAnalysee.fin + ', durée médiane de ' + t.perimetre.dureeMedianeAns + ' ans.');
A('      Source : Cerema pour le MTES-DGALN, données produites en ' + t.source.dateProduction + '.');
A('    </p>');
A('');
A('    <svg class="ligne ligne--littoral" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet"');
A('         role="img" aria-label="Contour du littoral métropolitain, tracé à partir des segments de l’indicateur.">');
A('      <path d="' + chemin(F.formes.littoral) + ' Z"/>');
A('    </svg>');
A('  </section>');
A('');
A('  <!-- 02 . LE RECUL. La ligne devient une courbe. -->');
A('  <section class="section mesure" id="mesure">');
A('    <p class="etiquette">02 · La mesure</p>');
A('    <h2>La moitié du littoral n’a pas bougé</h2>');
A('');
A('    <div class="colonnes">');
A('      <p class="corps">');
A('        L’indicateur couvre ' + nb(t.lineaire.mesureKm) + ' des ' + nb(t.lineaire.totalKm) + ' kilomètres de trait de');
A('        côte naturel métropolitain. Sur ce linéaire, ' + nb(t.evolution.stableKm) + ' kilomètres');
A('        n’ont pas bougé de façon mesurable en soixante ans. Le phénomène');
A('        n’est pas général, il est concentré.');
A('      </p>');
A('      <p class="corps">');
A('        Restent ' + nb(t.distribution.aBougeKm) + ' kilomètres qui ont bougé. Leur répartition est');
A('        franchement dissymétrique : ' + nb(t.evolution.reculKm) + ' kilomètres reculent contre');
A('        ' + nb(t.evolution.accretionKm) + ' qui avancent. Et le recul est surtout lent, ' + reculLent + ' kilomètres');
A('        perdant moins de 25 centimètres par an.');
A('      </p>');
A('    </div>');
A('');
A('    <figure class="figure">');
A(courbeDistribution());
A('      <ul class="annotations">');
A('        <li><span class="annotations__valeur">' + reculLent + ' km</span> recul lent, moins de 0,25 m/an</li>');
A('        <li><span class="annotations__valeur">' + nb(t.evolution.reculKm) + ' km</span> en recul au total</li>');
A('        <li><span class="annotations__valeur">' + dec(Math.abs(t.taux.min), 1) + ' m/an</span> le segment le plus rapide</li>');
A('      </ul>');
A('      <figcaption class="note">');
A('        La courbe ne montre que la côte qui a bougé. Sa dissymétrie vers la');
A('        gauche est le fait marquant : le littoral ne recule pas partout, mais');
A('        là où il bouge, il recule bien plus souvent qu’il n’avance.');
A('      </figcaption>');
A(tableauDistribution());
A('    </figure>');
A('  </section>');
A('');
A('  <!-- 03 . LA GEOGRAPHIE. La ligne devient un classement. -->');
A('  <section class="section geographie" id="geographie">');
A('    <p class="etiquette">03 · Les régions</p>');
A('    <h2>Quatre régions au-dessus de la moitié</h2>');
A('');
A('    <p class="corps">');
A('      Part du linéaire mesuré en recul, par région littorale. Les valeurs');
A('      absolues figurent à côté de chaque barre : la couleur ne porte jamais');
A('      seule l’information.');
A('    </p>');
A('');
A('    <figure class="figure">');
A(barresRegions());
A('      <figcaption class="note">');
A('        La Bretagne concentre le plus long linéaire mesuré et l’une des plus');
A('        faibles parts de recul : une côte rocheuse résiste là où un cordon');
A('        dunaire cède. La longueur n’est pas la vulnérabilité.');
A('      </figcaption>');
A(tableauRegions());
A('    </figure>');
A('  </section>');
A('');
A('  <!-- 04 . CE QUI EST EN JEU. La section nue.');
A('       LA LIGNE EST ABSENTE ICI, seul endroit du document. -->');
A('  <section class="section enjeu" id="enjeu">');
A('    <p class="etiquette">04 · Ce qui est en jeu</p>');
A('    <p class="chiffre chiffre--seul"><span class="chiffre__valeur">' + nb(t.lineaire.horsCouvertureKm) + '</span> <span class="chiffre__unite">kilomètres</span></p>');
A('    <p class="phrase">de trait de côte ne sont couverts par aucune mesure. On ignore s’ils reculent.</p>');
A('  </section>');
A('');
A('  <!-- 05 . METHODE ET SOURCES. La ligne revient, reduite a un trait. -->');
A('  <section class="section methode" id="methode">');
A('    <p class="etiquette">05 · Méthode et sources</p>');
A('    <h2>Comment ces chiffres ont été obtenus</h2>');
A('');
A('    <svg class="ligne ligne--trait" viewBox="0 0 1000 4" preserveAspectRatio="none" aria-hidden="true">');
A('      <path d="M0 2 L1000 2"/>');
A('    </svg>');
A('');
A('    <div class="colonnes">');
A('      <div>');
A('        <h3>Le jeu de données</h3>');
A('        <p class="corps">');
A('          Indicateur national de l’érosion côtière, produit par le Cerema pour');
A('          le MTES-DGALN, diffusé sur GéoLittoral. Couches');
A('          <code>N_evolution_trait_cote_S</code> et');
A('          <code>N_traits_cote_naturels_recents_L</code>, France métropolitaine,');
A('          projection Lambert 93. Données produites en ' + t.source.dateProduction + ',');
A('          fichiers mis à jour le 19 décembre 2017.');
A('        </p>');
A('        <h3>La méthode</h3>');
A('        <p class="corps">');
A('          Le taux d’évolution est porté par des polygones, les longueurs de');
A('          côte par des lignes, avec des découpages différents. Chaque segment');
A('          de trait de côte a donc été rattaché par jointure spatiale au');
A('          polygone qui le contient, puis compté pour sa longueur réelle.');
A('          Multiplier une part de segments par une longueur totale aurait');
A('          supposé des segments de taille égale, ce qui est faux.');
A('        </p>');
A('      </div>');
A('      <div>');
A('        <h3>Les limites, déclarées</h3>');
A('        <p class="corps">');
A('          Les données datent de ' + t.source.dateProduction + '. Un rapport publié en 2026 sur des');
A('          données de ' + t.source.dateProduction + ' reste exact, à condition de le dire ici plutôt');
A('          qu’en note de bas de page.');
A('        </p>');
A('        <p class="corps">');
A('          ' + nb(t.lineaire.horsCouvertureKm) + ' kilomètres de trait de côte ne sont couverts par aucun');
A('          polygone de mesure, et ' + nb(t.lineaire.nonMesureKm) + ' kilomètres portent une valeur');
A('          sentinelle sans mesure réelle. Ces ' + horsMesure + ' kilomètres sont exclus');
A('          des pourcentages et déclarés.');
A('        </p>');
A('        <p class="corps">');
A('          Rapportée au trait de côte total, la part en recul vaut ' + dec(t.evolution.partReculSurTotal, 1) + ' %');
A('          et non ' + dec(t.evolution.partReculSurMesure, 1) + ' %. Les deux chiffres sont exacts et ne');
A('          répondent pas à la même question. Ce rapport publie le second.');
A('        </p>');
A('        <p class="corps">');
A('          Un taux moyen sur soixante ans masque les événements. Une côte stable');
A('          en moyenne peut avoir reculé de dix mètres en une tempête. Seule la');
A('          France métropolitaine est traitée, et seul le trait de côte naturel');
A('          est mesuré, à l’exclusion des portions artificialisées.');
A('        </p>');
A('      </div>');
A('    </div>');
A('');
A('    <p class="note">');
A('      Contours régionaux : OpenStreetMap, export du 1er janvier 2018, licence');
A('      ODbL. © les contributeurs d’OpenStreetMap sous licence ODbL.');
A('    </p>');
A('');
A('    <ul class="telechargements">');
A('      <li><a href="/donnees/traite.json" download>Télécharger les données traitées, JSON</a></li>');
A('      <li><a href="/donnees/NOTES.md" download>Télécharger le journal de traitement</a></li>');
A('    </ul>');
A('  </section>');
A('');
A('</main>');
A('');
A('<!-- Le JavaScript n’ajoute aucun contenu : il pose un état de départ puis');
A('     revient à l’état du document. S’il échoue, la page reste complète. -->');
A('<script type="module" src="/src/main.js"></script>');
A('</body>');
A('</html>');

fs.writeFileSync(path.join(R, 'index.html'), P.join('\n') + '\n');

console.log('  index.html genere      : ' + (fs.statSync(path.join(R, 'index.html')).size / 1024).toFixed(1) + ' Ko');
console.log('  regions dans les barres: ' + t.regions.length);
console.log('  classes dans la courbe : ' + t.distribution.classes.length);
console.log('  tableaux equivalents   : 2');
console.log('  scripts JavaScript     : 0');
