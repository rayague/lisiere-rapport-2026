# LISIÈRE, Rapport 2026, copy définitive

Texte à reprendre mot pour mot en session 2. Aucun texte de calage.
Colonne de référence : **68 caractères**.

Tous les chiffres proviennent de `data/traite.json`, produit par
`outils/agreger.js` à partir des sources brutes. Aucun n'est saisi à la main.

**Tirets longs proscrits** dans toute la copy, convention de studio depuis le
projet 01 : le séparateur est le point milieu.

---

## 01 · HERO

**Étiquette** (11 px, Plex Mono, `.08em`, majuscules)

```
LISIÈRE · OBSERVATOIRE DU TRAIT DE CÔTE
```

> Le brief écrivait un tiret long dans cette étiquette. Il est remplacé par
> le point milieu, convention de studio depuis le projet 01.

**Titre** (display, Plex Sans Condensed 600)

```
Le recul du trait de côte
en France métropolitaine
```

**Sous-titre** (Plex Mono, majuscules)

```
RAPPORT 2026
```

**Le chiffre** (Plex Mono 500, tabular, clamp 3.5rem à 9rem)

```
935
```

**Unité, accolée au chiffre**

```
kilomètres
```

**Note sous le chiffre** (13 px, `--trame-txt`)

```
de trait de côte naturel en recul en France métropolitaine, sur
les 3 879 km couverts par l'indicateur national de l'érosion
côtière. Période analysée : 1920 à 2014, durée médiane de 60 ans.
Source : Cerema pour le MTES-DGALN, données produites en 2015.
```

La ligne du littoral traverse l'écran, en `--encre`, 2 px.

---

## 02 · LE RECUL

**Étiquette**

```
02 · LA MESURE
```

**Titre**

```
La moitié du littoral n'a pas bougé
```

**Paragraphe 1**

```
L'indicateur couvre 3 879 des 4 659 kilomètres de trait de côte
naturel métropolitain. Sur ce linéaire, 2 379 kilomètres n'ont pas
bougé de façon mesurable en soixante ans. Le phénomène n'est pas
général, il est concentré.
```

**Paragraphe 2**

```
Restent 1 500 kilomètres qui ont bougé. Leur répartition est
franchement dissymétrique : 935 kilomètres reculent contre 565 qui
avancent. Et le recul est surtout lent, 557 kilomètres perdant
moins de 25 centimètres par an.
```

**La courbe** : distribution du linéaire par taux, classes de 0,25 m/an.
Les segments à taux exactement nul en sont retirés, ils pèsent 2 379 km et
écraseraient toute autre classe. Ils sont annoncés à part, juste au-dessus.

**Trois valeurs annotées directement sur la courbe**

```
557 km        recul lent, moins de 0,25 m/an
935 km        en recul au total
7,9 m/an      le segment le plus rapide
```

**Note de lecture** (13 px)

```
La courbe ne montre que la côte qui a bougé. Sa dissymétrie vers la
gauche est le fait marquant : le littoral ne recule pas partout,
mais là où il bouge, il recule bien plus souvent qu'il n'avance.
```

> **Écart au brief, assumé.** Le brief demandait ici une série temporelle.
> L'indicateur n'en contient aucune : il donne un taux moyen unique par
> segment sur une fenêtre de soixante ans. Il n'y a pas d'évolution année
> par année à tracer. La ligne devient donc une courbe de distribution, ce
> qui préserve le geste de morphing et repose sur une donnée réelle.

---

## 03 · LA GÉOGRAPHIE

**Étiquette**

```
03 · LES RÉGIONS
```

**Titre**

```
Quatre régions au-dessus de la moitié
```

**Chapeau**

```
Part du linéaire mesuré en recul, par région littorale. Les valeurs
absolues figurent à côté de chaque barre : la couleur ne porte
jamais seule l'information.
```

**Les barres** (nom, kilomètres en recul, linéaire mesuré, part)

```
Nouvelle-Aquitaine            185 km    sur   297 km     62,1 %
Normandie                     217 km    sur   380 km     56,9 %
Occitanie                      92 km    sur   189 km     48,8 %
Hauts-de-France                53 km    sur   113 km     47,1 %
Pays de la Loire               70 km    sur   238 km     29,3 %
Provence-Alpes-Côte d'Azur     91 km    sur   410 km     22,1 %
Corse                          89 km    sur   814 km     11,0 %
Bretagne                      139 km    sur  1 437 km      9,7 %
```

**Note de lecture** (13 px)

```
La Bretagne concentre le plus long linéaire mesuré et l'une des plus
faibles parts de recul : une côte rocheuse résiste là où un cordon
dunaire cède. La longueur n'est pas la vulnérabilité.
```

---

## 04 · CE QUI EST EN JEU

**Étiquette**

```
04 · CE QUI EST EN JEU
```

**Le chiffre**

```
495
```

**Unité**

```
kilomètres
```

**La phrase, quinze mots**

```
de trait de côte ne sont couverts par aucune mesure. On ignore
s'ils reculent.
```

Rien d'autre sur l'écran. Pas de graphique, pas d'illustration, pas de ligne.

> **Écart au brief, assumé.** Le brief demandait ici le nombre de logements
> menacés à l'horizon 2050. Cette donnée n'existe pas dans l'indicateur
> national d'érosion côtière et n'a pas été trouvée en données ouvertes.
> Elle n'a pas été inventée. Le chiffre retenu vient du même jeu que tout
> le reste du rapport, et il fait de cette section un aveu de ce qu'on ne
> sait pas, ce qui sert le propos mieux qu'une projection empruntée.

La ligne disparaît ici, et c'est le seul endroit du document où elle est
absente. Son retour en section 05 en devient perceptible.

---

## 05 · MÉTHODE ET SOURCES

**Étiquette**

```
05 · MÉTHODE ET SOURCES
```

**Titre**

```
Comment ces chiffres ont été obtenus
```

**Le jeu de données**

```
Indicateur national de l'érosion côtière, produit par le Cerema pour
le MTES-DGALN, diffusé sur GéoLittoral. Couches
N_evolution_trait_cote_S et N_traits_cote_naturels_recents_L, France
métropolitaine, projection Lambert 93. Données produites en 2015,
fichiers mis à jour le 19 décembre 2017.
```

**La méthode, en trois phrases**

```
Le taux d'évolution est porté par des polygones, les longueurs de
côte par des lignes, avec des découpages différents. Chaque segment
de trait de côte a donc été rattaché par jointure spatiale au
polygone qui le contient, puis compté pour sa longueur réelle.
Multiplier une part de segments par une longueur totale aurait
supposé des segments de taille égale, ce qui est faux.
```

**Les limites, déclarées**

```
Les données datent de 2015. Un rapport publié en 2026 sur des
données de 2015 reste exact, à condition de le dire ici plutôt
qu'en note de bas de page.

495 kilomètres de trait de côte ne sont couverts par aucun polygone
de mesure, et 285 kilomètres portent une valeur sentinelle sans
mesure réelle. Ces 780 kilomètres sont exclus des pourcentages et
déclarés.

Rapportée au trait de côte total, la part en recul vaut 20,1 % et
non 24,1 %. Les deux chiffres sont exacts et ne répondent pas à la
même question. Ce rapport publie le second.

Un taux moyen sur soixante ans masque les événements. Une côte
stable en moyenne peut avoir reculé de dix mètres en une tempête.

Seule la France métropolitaine est traitée. Seul le trait de côte
naturel est mesuré, à l'exclusion des portions artificialisées.
```

**Contours régionaux**

```
OpenStreetMap, export du 1er janvier 2018, licence ODbL.
© les contributeurs d'OpenStreetMap sous licence ODbL
```

**Téléchargement**

```
Télécharger les données traitées (JSON, 5 Ko)
Télécharger le journal de traitement (Markdown)
```

La ligne revient, réduite à un trait simple sous le titre.
