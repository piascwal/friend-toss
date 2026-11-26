# Consignes pour les agents

- Lire `README.md` avant toute modification.
- Textes et commentaires en français.
- Toute modification se termine par `npm run check` et `npm run format` ; un changement de niveau, de
  physique ou de pouvoir aussi par `npm run solve` (chaque niveau doit rester gagnable).
- Les images viennent de la banque de sprites : ne pas en ajouter dans ce dépôt. Un besoin nouveau va dans
  `needs.json`, puis dans la banque (`npm run needs -- ../sprite-bank`).
- `src/sim/` ne dépend pas du navigateur (le solveur le fait tourner dans les tests).
- Garder le code simple et lisible par un humain : de petits modules à responsabilité claire (voir
  « Organisation » dans le README), une fonction par chose, pas d'abstraction inutile.
