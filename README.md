# LISIÈRE · Rapport 2026

Rapport annuel interactif sur le recul du trait de côte en France
métropolitaine. Une page, mobile-first, HTML et CSS écrits à la main.

Deuxième projet vitrine du studio **Pineapple Effect**.

> **LISIÈRE est un observatoire fictif. Les données, elles, sont réelles.**
> Elles proviennent de l'indicateur national de l'érosion côtière publié par
> le Cerema en données ouvertes. Aucun chiffre n'a été inventé, arrondi à
> convenance, ni saisi à la main.

---

## Ce que ce projet démontre

Le projet précédent, [SÈVE](https://github.com/rayague/seve-bois-dormant),
démontrait l'atmosphère : la lenteur, la révélation progressive. Refaire cela
avec un autre produit ne prouverait rien de plus.

Celui-ci démontre l'inverse : **la clarté sous contrainte**. Un rapport de
données où tout bouge est illisible. La règle qui commande tout le reste
change donc complètement.

> Une animation ne doit jamais retarder la compréhension d'un chiffre.

Deux registres opposés, une seule méthode.

## Le concept

**Une seule ligne, plusieurs formes.**

Un trait de côte *est* une ligne. Toute la page est construite sur une ligne
unique qui se transforme d'une section à l'autre : elle est le littoral dans
le hero, devient une courbe de distribution, puis un classement, puis
redevient un trait sous la conclusion.

C'est aussi la seule règle graphique de la page : **aucun autre filet, aucune
bordure, aucune grille visible**. Le réflexe du rapport institutionnel est de
couvrir la page de hairlines. Ici il n'y en a qu'une, et elle porte
l'information.

---

## Les chiffres, et d'où ils viennent

| Grandeur | Valeur |
|---|---|
| Trait de côte naturel, métropole | 4 659 km |
| Couvert par l'indicateur | 3 879 km |
| **En recul** | **935 km**, soit 24,1 % du mesuré |
| Stable | 2 379 km |
| En accrétion | 565 km |
| Période analysée | 1920 à 2014, durée médiane 60 ans |

Tout est régénérable depuis les sources brutes :

```bash
npm run donnees
```

### Le travail réel était le nettoyage

**Le piège principal.** Les taux d'évolution sont portés par des polygones,
les longueurs de côte par des lignes, avec des découpages différents. La
facilité aurait été de constater que 27,7 % des polygones reculent et de
multiplier par la longueur totale. Cela suppose des segments de longueur
égale, ce qui est faux : le chiffre obtenu aurait été une invention présentée
comme une mesure. Une jointure spatiale a donc été faite, et ce sont des
kilomètres qui sont comptés, pas des segments.

**Une sentinelle à 16,9 %.** 3 493 polygones portent la valeur `-9999` avec
une durée nulle. Prise au premier degré, elle fait basculer toute la moyenne
nationale. Exclue, et les 285 km correspondants déclarés à part plutôt que
fondus dans les segments stables.

**Deux absences, deux traitements.** Hors polygone de mesure, c'est une
information : le Cerema n'a pas couvert. Hors polygone régional, c'est un
artefact : les points côtiers sont sur la frontière administrative et la
moitié tombe côté mer. Le second a été comblé, jamais le premier.

**Deux contrôles de cohérence.** La longueur calculée sur la géométrie tombe
à 0,42 % de celle déclarée par le producteur. Et la somme des kilomètres par
région réconcilie exactement avec le bilan national : la jointure ne perd ni
ne double aucun segment.

Chaque décision est justifiée dans [`data/NOTES.md`](data/NOTES.md), y
compris une méthode de validation abandonnée en cours de route parce qu'elle
s'appuyait sur des références non vérifiables.

---

## Deux écarts au brief, déclarés

**La série temporelle n'existe pas.** Le brief demandait que la ligne devienne
une série temporelle. L'indicateur ne contient qu'un taux moyen unique par
segment sur soixante ans : il n'y a pas d'évolution année par année à tracer.
La ligne devient donc une courbe de distribution, ce qui préserve le geste et
repose sur une donnée réelle.

**Le chiffre des logements menacés est introuvable.** Le brief voulait le
nombre de logements en zone menacée à l'horizon 2050. Cette donnée ne figure
pas dans l'indicateur et n'a pas été trouvée en données ouvertes. Elle n'a
pas été inventée. La section porte désormais les 495 km que rien ne mesure,
avec la phrase *« On ignore s'ils reculent. »*

---

## Lancer le projet

```bash
npm install
```

```bash
npm run dev
```

| Commande | Effet |
|---|---|
| `npm run donnees` | recalcule `data/traite.json` depuis les sources brutes |
| `npm run graphiques` | régénère `index.html` depuis les données |
| `npm run build` | version de production |

**Les sources brutes ne sont pas versionnées.** 60 Mo de shapefiles dans un
dépôt public, c'est non. [`data/EMPREINTES.txt`](data/EMPREINTES.txt) contient
les URL et les sommes SHA-256 des cinq archives : retélécharger, vérifier
l'empreinte, relancer, et les chiffres sont identiques.

## Pile technique

`Vite` · `HTML/CSS écrits à la main` · `SVG inline` · aucun framework

Les graphiques sont générés depuis les données par
[`outils/generer-page.cjs`](outils/generer-page.cjs), et non dessinés. Aucun
chiffre n'est saisi dans le HTML : changer la source et relancer suffit à
mettre la page à jour.

Les outils de traitement ne dépendent de rien : lecteur dBase, lecteur
shapefile, reprojection Lambert 93 et jointure spatiale sont écrits à la
main, environ 500 lignes au total.

---

## Accessibilité

C'est ici qu'elle devient un argument commercial. Un organisme public ou un
cabinet soumis au RGAA a des obligations contraignantes.

- **Chaque graphique a un tableau HTML équivalent** dans le DOM, masqué
  visuellement mais réel : lu par les lecteurs d'écran, sélectionnable, et
  restitué à l'impression. 32 lignes de données au total.
- **La couleur n'est jamais la seule variable.** Elle ne peut pas l'être :
  les deux couleurs de données ne se distinguent que par 1,37:1 l'une de
  l'autre, donc presque pas en niveaux de gris. Le nom, la part et les valeurs
  absolues portent l'information.
- **Aucune information accessible au seul survol.** Le survol n'existe pas
  sur mobile.
- **La page entière fonctionne sans JavaScript**, graphiques compris. Le
  script d'animation ne fait que poser un état de départ puis revenir à
  l'état du document : s'il échoue, le rapport reste exact et complet.
- Contrastes vérifiés par le calcul avant la première ligne de HTML. Trois
  valeurs du brief ne passaient pas et ont été corrigées.
- Feuille `@media print` complète : un rapport se cite et s'imprime.

## Chiffres mesurés

| Poste | Mesure | Budget |
|---|---|---|
| Premier rendu | 115,2 Ko | 200 Ko |
| JavaScript gzip | 54,7 Ko | 75 Ko |
| Polices | 53,6 Ko | 60 Ko |
| Contraste, texte visible | 0 échec | |
| Débordement horizontal | aucun | |
| Glyphes manquants | 0 sur 85 | |

Les polices dépassaient d'abord de 5,9 Ko, parce qu'elles étaient
sous-ensemblées sur la copy plus une marge de sécurité. Une fois la page
finale connue, le sous-ensemble a été refait sur les 89 glyphes réellement
composés, et vérifié au pixel pour s'assurer qu'aucun caractère ne tombe en
carré vide.

`d3-scale` et `d3-shape` étaient autorisés par le brief et n'ont pas été
utilisés : les formes sont pré-calculées dans `data/formes.json`, ce qui
économise environ 15 Ko pour un résultat identique.

## Le mouvement

**Une animation ne doit jamais retarder la compréhension d'un chiffre.**
C'est la règle qui commande, et elle est l'inverse de celle de SÈVE où
l'animation était le contenu.

- **Deux compteurs dans tout le document**, pas un de plus. Le chiffre du
  hero et celui de la section 04. Des nombres qui défilent partout sont un
  tic qui rend un rapport illisible.
- **Le morphing sans plugin.** `MorphSVGPlugin` est réservé aux abonnés du
  Club GreenSock. Deux formes construites avec le même nombre de points, dans
  le même ordre, s'interpolent terme à terme : trente lignes de code, zéro
  dépendance. La courbe se déplie depuis une ligne plate posée sur l'axe.
- **Plafond de 800 ms** pour qu'un graphique atteigne son état final. Les
  barres régionales, section la plus animée, finissent en 780 ms.
- **Décalage de 40 ms** et non 120 comme dans SÈVE : là-bas on cherchait la
  respiration, ici la lecture.
- **Pas de flou de vitesse.** Il servait la caméra dans SÈVE, ici il rendrait
  les chiffres flous.
- **Chaque graphique se dessine une fois**, puis s'arrête. Jamais de boucle,
  jamais de rejeu au scroll inverse.
- **La signature est raccourcie à 1,6 s**, en `--recul` sur `--encre`.
  Troisième palette du studio, troisième démonstration que la signature est
  une chorégraphie et non une palette.

Le JavaScript n'ajoute aucun contenu : il pose un état de départ puis revient
à l'état du document. La page reste exacte s'il échoue.

## Points ouverts

- **Le morphing est local, pas continu.** Le concept veut qu'une seule ligne
  parcoure le document du haut en bas. Elle se trace dans le hero et se
  déplie en courbe dans la section 02, mais chaque section porte son propre
  SVG plutôt qu'un élément unique qui traverserait toute la page. Le geste
  est là, la continuité stricte reste à faire.
- **Les données datent de 2015** alors que le rapport s'intitule *Rapport
  2026*. C'est exact à condition de le dire en évidence, ce que fait la
  section méthode.
- **Licence écrite**, voir [LICENCE.md](LICENCE.md). Le code est sous
  droit d'auteur exclusif, les polices sous OFL, et les données gardent la
  licence de leur producteur.

## Sources et licences

- **Indicateur national de l'érosion côtière**, Cerema pour le MTES-DGALN,
  diffusé sur GéoLittoral.
- **Contours régionaux** : OpenStreetMap, export du 1er janvier 2018.
  © les contributeurs d'OpenStreetMap sous licence ODbL.
- **IBM Plex**, sous licence SIL Open Font License.

## Crédits

Studio **Pineapple Effect**. Développement assisté par Claude Opus 5.
