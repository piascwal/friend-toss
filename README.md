# Friend Toss

Jeu de lancer en pixel art : **JBG** lance ses potes sur les structures où se cachent **les relous**
(fêtards, videurs, yétis, DJ Boucle…). Chaque ami a son pouvoir, déclenché en touchant l'écran pendant
son vol. Des amis sont enfermés dans des cages : gagner le niveau les libère, et ils rejoignent la bande.

Les images viennent de la banque de sprites partagée ([sprite-bank](https://github.com/piascwal/sprite-bank)) :
personnages, objets de décor, ennemis et boss.

## Jouer

- **Viser** : appuie à gauche de l'écran (ou sur l'ami), tire vers l'arrière, relâche.
- **Pouvoir** : touche l'écran (clic, ou Espace) pendant le vol. Pour RORO, touche l'endroit visé.
- **Pause** : Échap ou P. **Recommencer** : R.
- Le score donne 1 à 3 étoiles ; chaque ami non utilisé rapporte 10 000 points.

## La bande

| Ami      | Pouvoir          | Ce qu'il fait                                                      | Libéré en |
| -------- | ---------------- | ------------------------------------------------------------------ | --------- |
| ROULIAN  | Poids mort       | Aucun pouvoir, mais lourd                                          | départ    |
| MAT      | Ruée             | Fonce tout droit, transperce le bois                               | 1-2       |
| TOM      | Vision triple    | Se divise en trois, idéal contre la glace                          | 1-5       |
| JBM      | Paume de souffle | Onde de choc autour de lui                                         | 2-3       |
| LOLO     | Séisme           | Pique vers le sol, broie la pierre, onde à l'impact                | 2-6       |
| ROULIE   | Givre            | Gèle ce qui est devant elle : ce qui est gelé casse comme du verre | 3-3       |
| SOSO     | Double saut      | Rebondit en l'air                                                  | 3-6       |
| ELO      | Pirouette        | Ricoche partout                                                    | 4-2       |
| RORO     | Smash            | Balle de padel vers le point touché                                | 4-4       |
| INDIANNE | Lévitation       | Vole tout droit deux secondes                                      | 4-6       |
| CLEM     | Va chercher !    | Son chien fonce au ras du sol                                      | 5-2       |
| BUBU     | Rayon            | Transperce bois et glace en ligne droite                           | 5-3       |
| MAR-1    | Lancer frappé    | Palet en piqué, elle rebondit vers le haut                         | 5-4       |

## Les mondes

Chaque monde apprend une ou deux mécaniques, les combine, puis finit par un boss.

1. **Le Camping** : bois, fêtards, pigeons perchés, cages.
2. **Le Festival** : barils et caissons explosifs, enceintes en métal, glace, videurs ; boss **DJ Boucle**.
3. **La Montagne** : pierre, rochers qui dévalent, givre ; boss **Yéti Alpha**.
4. **La Plage** : trampolines, pneus, tonneaux-fusées ; boss **le Champion**.
5. **La Ville** : tunnels, téléporteurs, voitures ; boss **le Méga-Robot**.

Un **tonneau d'or** est caché dans certains niveaux.

## Développer

```bash
npm install
npm run sprites                       # copie les images de la banque (dernière v2) dans public/assets/
npm run sprites -- --local ../sprite-bank   # ou depuis une copie locale de la banque
npm run dev                           # http://localhost:5173  (#2-6 dans l'adresse : ouvre ce niveau)
npm run check                         # types + tests rapides (niveaux bien construits, progression)
npm run solve                         # le solveur rejoue chaque niveau et vérifie qu'il est gagnable
npm run difficulty                    # part des premiers tirs gagnants, niveau par niveau
npm run format
```

Dans la console du navigateur : `friendToss.unlockAll()` ouvre tous les niveaux, `friendToss.reset()`
efface la progression.

### Organisation

```
needs.json             besoins du jeu dans la banque (poses, objets, ennemis) : `npm run needs -- ../sprite-bank`
sprites.json           version de la banque suivie (« v2 » = la plus récente des v2.x)
scripts/sprites.mjs    télécharge la banque et copie les images demandées
src/sim/               simulation sans navigateur : physique (planck), dégâts, pouvoirs, score
  defs.ts              matériaux, objets, relous, amis et pouvoirs
  level.ts             format d'un niveau et outil de construction (empiler, poutres, cabanes, tours)
  sim.ts               un niveau en cours
src/data/levels.ts     les 5 mondes et leurs 30 niveaux
src/render/            affichage canvas : caméra, ciel et sol pixel art, effets
src/game.ts            une partie : visée, pouvoirs, effets, HUD
src/ui.ts              écrans : titre, carte, présentation, pause, résultats, guide
tests/                 niveaux bien construits ; solveur (tests/solve/)
```

### Ajouter un niveau

Dans `src/data/levels.ts`, une fonction construit le niveau avec `Build` (positions en mètres, `x = 0`
à 5 m devant le lanceur, `y` = bas de la pièce), puis on l'ajoute à son monde. `npm test` vérifie que la
structure tient debout, `npm run solve` qu'elle est gagnable.

### Images

Une image qui manque dans la banque (pose, objet, ennemi) se demande dans `needs.json`, se publie dans la
banque avec `npm run needs -- ../sprite-bank`, puis se génère dans l'atelier de la banque.
