# Licence

Ce dépôt mélange du code que j'ai écrit, des données publiques que je n'ai
pas produites, et des polices qui appartiennent à d'autres. Ces trois choses
n'ont pas le même statut et ne peuvent pas être couvertes par une licence
unique. La distinction est faite ci-dessous.

## Le code

© 2026 Ray Ague — Pineapple Effect. Tous droits réservés.

S'appliquent à ce titre : `src/`, `outils/`, `index.html`, et la
configuration du projet. Le code est public pour être **lu**, pas pour être
réutilisé. Sans autorisation écrite, il ne peut être ni copié, ni modifié, ni
redistribué, ni intégré à un autre projet.

C'est un choix délibéré. Ce dépôt est une pièce de vitrine : il démontre un
savoir-faire, il ne le distribue pas. Lire, s'inspirer, apprendre : oui.
Reprendre le code : demandez.

## Les données — et pourquoi elles échappent à ce qui précède

**Les données ne m'appartiennent pas et « tous droits réservés » ne s'y
applique pas.** Le déclarer serait faux, et pour OpenStreetMap ce serait une
violation de licence.

### Contours régionaux — OpenStreetMap, ODbL

`data/formes.json`, `data/brut/extrait_regions_osm/` et tout fichier dérivé
des géométries régionales.

> © les contributeurs d'OpenStreetMap sous licence ODbL

L'ODbL impose l'attribution **et le partage à l'identique**. Une base dérivée
de ces contours reste sous ODbL, quel que soit le statut du code qui la
produit. Ces fichiers sont donc **exclus** de la réserve de droits énoncée
plus haut : ils restent disponibles sous ODbL, y compris pour un usage
commercial. Le texte de la licence est conservé dans
`data/brut/extrait_regions_osm/LICENCE.txt`.

L'attribution est portée par la page elle-même, dans la section méthode, et
doit le rester dans toute republication.

### Érosion côtière — Cerema

*Indicateur national de l'érosion côtière*, produit par le Cerema pour le
MTES-DGALN, diffusé sur GéoLittoral. Données produites en 2015, fichiers mis
à jour le 19 décembre 2017.

**Point à confirmer avant tout usage commercial.** Les livraisons
téléchargées ne contiennent aucun fichier de licence, et je n'ai pas relevé
les conditions de diffusion au moment de la collecte. Les données publiques
de ce type relèvent généralement de la Licence Ouverte d'Etalab, qui
n'exigerait que l'attribution — mais je ne l'ai pas vérifié, et je préfère
le dire plutôt que de l'affirmer. Se reporter à GéoLittoral avant de
s'appuyer dessus.

L'attribution au Cerema figure dans la section méthode de la page.

## Les polices

IBM Plex Sans, IBM Plex Sans Condensed et IBM Plex Mono, par IBM, sous
**SIL Open Font License 1.1**.

L'OFL autorise l'usage, l'intégration et la redistribution, y compris
commerciale, à condition de ne pas vendre les fontes seules et de ne pas
réserver leur nom. Les sous-ensembles de `public/fonts/` restent sous cette
licence : réduire un jeu de glyphes ne crée aucun droit nouveau.

## La signature

L'animation de signature et la forme d'ananas sont l'identité du studio
Pineapple Effect. Elles sont exclues de toute réutilisation, même en cas
d'autorisation accordée sur le reste du code.

## Contact

ray.ague22@gmail.com
