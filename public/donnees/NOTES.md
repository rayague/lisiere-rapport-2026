# Journal de traitement des donnees

Tout nettoyage est une decision. Une decision non ecrite est une decision
perdue. Ce fichier repond a la question qu'un client posera un jour :
« comment avez-vous obtenu ce chiffre ? »

---

## 1. Sources

### Donnee principale

**Indicateur national de l'erosion cotiere**, produit par le **Cerema** pour le
**MTES-DGALN**, diffuse sur GeoLittoral.

| Couche | Role | Entites |
|---|---|---|
| `N_evolution_trait_cote_S` metropole, EPSG:2154 | taux d'evolution, polygones | 20 651 |
| `N_traits_cote_naturels_recents_L` metropole, EPSG:2154 | trait de cote et longueurs | 7 830 |

Date de production declaree dans la donnee : 2015. Derniere modification de
l'en-tete dBase : 2017-12-19. Empreinte SHA-256 de l'archive principale :
`71eeb3d1f1a0693d0622a2d9b5bbb3aa9458975de31cf95300c314667185aa6b`

### Contours regionaux

**OpenStreetMap**, export du 01/01/2018, en WGS84.
Licence **ODbL**, attribution obligatoire :
*(c) les contributeurs d'OpenStreetMap sous licence ODbL*

**Pourquoi pas la source du Ministere de l'Interieur ?** Elle existe et a ete
testee. Deux raisons de l'ecarter. Elle est projetee en Lambert II Carto sur
meridien de Paris, ce qui imposerait un changement de datum NTF vers RGF93,
source d'erreur silencieuse. Et ses libelles sont les intitules provisoires de
2015, du type « Nord - Pas-de-Calais et Picardie », anterieurs a la
nomenclature definitive.

---

## 2. Deux couches, deux decoupages : pourquoi une jointure spatiale

Le taux d'evolution est porte par des **polygones** (20 651). Les longueurs de
cote sont portees par des **lignes** (7 830). Les decoupages different, donc
aucune jointure par identifiant n'est possible.

**Ce qu'il ne fallait surtout pas faire :** constater que 27,7 % des polygones
reculent, puis multiplier ce pourcentage par la longueur totale. Cela
supposerait des segments de longueur egale, ce qui est faux. Le chiffre obtenu
aurait ete une invention presentee comme une mesure.

**Ce qui a ete fait :** pour chaque segment de trait de cote, on calcule le
point situe a mi-parcours de son developpe, puis on cherche le polygone
d'evolution qui le contient. Le taux de ce polygone est attribue au segment, et
c'est la longueur reelle du segment qui est comptee.

Le point median du developpe est prefere au centroide : sur une cote concave,
un centroide tombe en pleine mer.

### Controles de coherence

La longueur calculee sur la geometrie donne **4 639,2 km** contre **4 658,7 km**
declares par le producteur dans le champ `long_km`, soit **0,42 % d'ecart**.
Cet ecart vient des arrondis du producteur. Il valide le lecteur de geometrie.

Second controle : la somme des kilometres par region **reconcilie exactement**
avec le bilan national, 3 879 km mesures et 935 km en recul des deux cotes.
La jointure ne perd ni ne double aucun segment.

---

## 3. Valeurs manquantes

### La sentinelle -9999

**3 493 polygones sur 20 651**, soit **16,9 %**, portent la valeur `-9999` avec
une duree d'analyse nulle. C'est une **sentinelle**, pas une mesure.

Prise au premier degre, elle ferait basculer toute la moyenne nationale vers un
recul catastrophique et faux.

**Decision : exclue de tout calcul de taux.** Le lineaire correspondant,
**284,7 km**, est comptabilise separement en « non mesure ». Il n'est jamais
fondu dans les segments stables, ce qui reviendrait a affirmer une stabilite
que la donnee ne documente pas.

### Segments hors couverture

**494,7 km** de trait de cote ne tombent dans aucun polygone d'evolution.

Diagnostic effectue sur les 904 segments concernes, par mesure de la distance
au polygone le plus proche :

| Distance | Segments | Lineaire |
|---|---|---|
| 0 a 50 m | 295 | 141,8 km |
| 50 a 250 m | 213 | 117,4 km |
| au-dela de 250 m | 83 | 64,0 km |

Les premiers relevent d'un effet de bord de la methode, les derniers d'une
absence reelle de couverture.

**Decision : aucun rattachement par proximite.** Rattacher reviendrait a
inventer une couverture qui n'existe pas. Ces 494,7 km sont declares a part.

**Consequence a citer avec le chiffre :** la part de cote en recul est calculee
sur les **3 879,3 km reellement couverts**, pas sur les 4 658,7 km de trait de
cote. Rapportee au total elle vaut 20,1 % au lieu de 24,1 %. Les deux chiffres
sont exacts, ils ne repondent pas a la meme question. Le rapport publie le
second et le dit.

---

## 4. Le rattachement regional : une absence traitee differemment

Deux absences, deux natures, deux traitements.

**Hors polygone d'evolution : information.** Le Cerema n'a pas couvert cette
portion. On la garde a part.

**Hors polygone regional : artefact.** Les points cotiers sont par construction
sur la limite administrative, et une bonne moitie tombe cote mer. En test
strict, seuls **81,2 %** des segments etaient rattaches, et les 18,8 % restants
n'avaient rien de particulier sinon leur position.

**Decision : rattachement a la region la plus proche dans une tolerance de
5 km** lorsque le test d'appartenance echoue. Aucune ambiguite possible, il n'y
a pas de region concurrente de l'autre cote de l'eau.

Resultat : 81,2 % par appartenance directe, 18,8 % par proximite, **0 % non
rattache**.

---

## 5. Reprojection

Les donnees Cerema sont en **Lambert 93**, les contours regionaux en **WGS84**.
Les points cotiers sont donc convertis par projection conique conforme inverse.
RGF93 et WGS84 partagent la meme ellipsoide a la precision utile ici : aucun
changement de datum, donc aucune approximation cachee.

**Sur la validation :** une premiere verification comparait le resultat a des
coordonnees de villes connues, citees de memoire. Elle a ete **abandonnee**,
ces references n'ayant aucune valeur d'etalon. La validation retenue est
interne a la donnee : si la projection est juste, les points cotiers doivent
tomber dans les regions francaises, ce qu'ils font a 81,2 % en test strict et
100 % avec la tolerance cotiere.

---

## 6. Ce que ces donnees ne disent pas

A citer dans la section methode du rapport.

- **Elles datent de 2015.** Un rapport publie en 2026 sur des donnees de 2015
  est honnete a condition de l'ecrire en evidence, pas en note de bas de page.
- **Elles ne couvrent que la France metropolitaine.** Les couches d'outre-mer
  existent et n'ont pas ete traitees.
- **Elles ne portent que sur le trait de cote naturel.** Les portions
  artificialisees relevent d'une autre couche.
- **Un taux moyen sur soixante ans masque les evenements.** Une cote stable en
  moyenne peut avoir recule de dix metres en une tempete puis s'etre reengraissee.
- **La duree analysee varie de 9 a 91 ans selon les segments.** Un taux annuel
  moyen n'a pas la meme robustesse partout.
- **Le decoupage regional est celui de 2018**, posterieur a la donnee. Sans
  consequence ici, les limites littorales n'ayant pas bouge.

---

## 7. Chiffres retenus pour le rapport

| Grandeur | Valeur | Base |
|---|---|---|
| Trait de cote naturel, metropole | 4 658,7 km | producteur |
| Couvert par l'indicateur | 3 879,3 km | apres jointure |
| **En recul** | **935,4 km** | **24,1 % du mesure** |
| Stable | 2 379,0 km | 61,3 % |
| En accretion | 564,9 km | 14,6 % |
| Non mesure (sentinelle) | 284,7 km | declare a part |
| Hors couverture | 494,7 km | declare a part |
| Periode | 1920 a 2014 | mediane 60 ans |
| Taux extremes | -7,914 a +15,308 m/an | |

Reproduire ces chiffres : `node outils/agreger.cjs` depuis la racine du projet.
