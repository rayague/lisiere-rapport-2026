/**
 * Lambert 93 (RGF93) vers WGS84. Projection conique conforme inverse.
 * RGF93 et WGS84 partagent la meme ellipsoide a la precision utile ici :
 * pas de changement de datum, donc pas d'approximation cachee.
 */
const A  = 6378137.0;                 // demi grand axe GRS80
const E  = 0.0818191910428158;        // premiere excentricite
const N  = 0.7256077650;              // exposant de la projection
const C  = 11754255.426096;           // constante de la projection
const XS = 700000.0;                  // coordonnees du pole
const YS = 12655612.049876;
const L0 = 3 * Math.PI / 180;         // meridien d origine, 3 degres est

function versWGS84(x, y) {
  const dx = x - XS, dy = y - YS;
  const R = Math.hypot(dx, dy);
  const g = Math.atan(dx / -dy);
  const lon = L0 + g / N;
  const L = -Math.log(Math.abs(R / C)) / N;

  let phi = 2 * Math.atan(Math.exp(L)) - Math.PI / 2;
  for (let i = 0; i < 12; i++) {                       // convergence iterative
    const s = E * Math.sin(phi);
    phi = 2 * Math.atan(Math.pow((1 + s) / (1 - s), E / 2) * Math.exp(L)) - Math.PI / 2;
  }
  return [lon * 180 / Math.PI, phi * 180 / Math.PI];
}
module.exports = { versWGS84 };
