# Friend Toss

Jeu de lancer en pixel art : un **canon** envoie tes potes sur les structures où se cachent **les relous**
(fêtards, videurs, yétis, DJ Boucle…). Chaque ami a son pouvoir, déclenché en touchant l'écran pendant
son vol. Des amis sont enfermés dans des cages : gagner le niveau les libère, et ils rejoignent la bande.

Les images viennent de la banque de sprites partagée ([sprite-bank](https://github.com/piascwal/sprite-bank)) :
personnages, objets de décor, ennemis et boss.

## Jouer

- **Ouverture** : la caméra montre ce qu'il faut casser puis glisse jusqu'au canon (touche pour passer).
- **Viser** : pose le doigt sur le canon, tire vers l'arrière, relâche.
- **Regarder** : fais glisser la vue ailleurs que sur le canon ; zoome à deux doigts (ou molette). C : retour au canon.
- **Pouvoir** : touche l'écran (clic, ou Espace) pendant le vol. Pour RORO, touche l'endroit visé.
- **Pause** : Échap ou P. **Recommencer** : R.
- Le score donne 1 à 3 étoiles ; chaque ami non utilisé rapporte 10 000 points.

## Sur mobile

Le jeu se joue en **paysage, plein écran, sans aucun défilement** : en portrait, un écran demande de tourner
le téléphone. Le plein écran (et le blocage en paysage, quand le navigateur le permet) se déclenche au premier
« JOUER » ; un bouton le rebascule.

Il s'**installe comme une application** par le menu du navigateur (« Installer » / « Ajouter à l'écran
d'accueil » ; sur iPhone : Partager → Sur l'écran d'accueil). Une fois installé, il s'ouvre en plein
écran et marche hors ligne pour les niveaux déjà chargés.

## La bande

En vol, chaque ami est une grosse tête ronde à sa couleur : on le reconnaît d'un coup d'œil.

| Ami      | Pouvoir          | Ce qu'il fait                                         | Libéré en |
| -------- | ---------------- | ----------------------------------------------------- | --------- |
| ROULIAN  | Poids mort       | Aucun pouvoir, mais lourd                             | départ    |
| MAT      | Ruée             | Fonce tout droit, transperce le bois                  | 1-3       |
| TOM      | Vision triple    | Se divise en trois, idéal contre la glace             | 1-7       |
| JBM      | Paume de souffle | Onde de choc autour de lui                            | 1-12      |
| JBG      | Boule de feu     | Boule de feu tout droit, qui explose au contact       | 2-4       |
| LOLO     | Séisme           | Pique vers le sol, broie la pierre                    | 2-12      |
| ROULIE   | Givre            | Gèle ce qui est devant elle : ça casse comme du verre | 3-4       |
| SOSO     | Double saut      | Rebondit en l’air                                     | 3-12      |
| ELO      | Pirouette        | Ricoche partout                                       | 4-3       |
| RORO     | Smash            | Balle de padel vers le point touché                   | 4-7       |
| INDIANNE | Lévitation       | Vole tout droit deux secondes                         | 4-12      |
| CLEM     | Va chercher !    | Son chien fonce au ras du sol                         | 5-3       |
| BUBU     | Rayon            | Transperce bois et glace en ligne droite              | 5-6       |
| MAR-1    | Lancer frappé    | Palet en piqué, elle rebondit vers le haut            | 5-9       |

## Les relous

Une liste courte, comme dans le genre : le **fêtard** (petit, fragile), le **videur** (costaud), le
**pilier** (gros, il faut l'écraser ou le faire exploser), et un **boss** par monde. Ils sont cerclés de
vert (le boss de rose) pour qu'on sache toujours quoi viser.

## Les mondes

5 mondes de 12 niveaux. Chaque monde apprend une ou deux mécaniques, les combine sur du relief
(collines, falaises, gradins, îlots, grottes), puis finit par une grande forteresse ou un boss.

1. **Le Camping** : bois, étages, roues, TNT, collines.
2. **Le Festival** : barils et TNT, glace, enceintes en métal, gradins ; boss **DJ Boucle**.
3. **La Montagne** : pierre, boulets, falaises, îlots, grotte, givre ; boss **Yéti Alpha**.
4. **La Plage** : dunes, pneus, pilotis, tonneaux-fusées, phare ; boss **le Champion**.
5. **La Ville** : métal, voitures, tunnels, téléporteurs, toits, métro ; boss **le Méga-Robot**.

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

Le code est découpé en petits modules, chacun avec une responsabilité claire. La simulation ne
dépend pas du navigateur : le solveur la fait tourner dans les tests.

```
needs.json               besoins du jeu dans la banque : `npm run needs -- ../sprite-bank`
sprites.json             version de la banque suivie (« v2 » = la plus récente des v2.x)
scripts/                 récupération des images de la banque, icônes de l'application
src/main.ts              enchaînement des écrans et progression
src/sim/                 simulation (sans navigateur)
  catalog/               catalogue : matériaux, objets, relous, amis (un fichier chacun)
  constants.ts           gravité, canon, réglages des dégâts et des points
  entity.ts              entités d'un niveau en cours et événements pour l'affichage
  level.ts               format d'un niveau, surface du relief
  setup.ts               construction d'un niveau dans le monde physique
  sim.ts                 un niveau en cours : tir, dégâts, explosions, score, victoire
  powers.ts              les pouvoirs des amis (une fonction par pouvoir)
src/levels/              les niveaux : un fichier par monde, et l'outil de construction (build.ts)
src/render/              affichage canvas
  view.ts                coordonnées monde ↔ écran, dessin des images
  camera.ts              mise en scène : ouverture, visée, suivi, zoom au doigt
  scenery.ts, sky.ts     ciel, lointains, sol en relief, plateformes
  actors.ts              objets, relous (contour), amis (grosse tête), projectiles
  cannon.ts              canon, file des amis, trajectoire de visée
  effects.ts             particules et textes flottants
  textures.ts, …         pixel art dessiné par le jeu (modules, TNT, sol, canon)
src/game/                une partie : orchestration (game.ts), gestes (input.ts), HUD (hud.ts),
                         effets et sons de chaque événement (feedback.ts), préchargement
src/ui/                  écrans HTML : un fichier par écran (titre, carte, intro, pause, résultats, guide)
tests/                   niveaux bien construits ; solveur (tests/solve/)
```

### Ajouter un niveau

Dans le fichier de son monde (`src/levels/<monde>.ts`), une fonction construit le niveau avec `Build`, module par module : blocs,
poutres et poteaux épais, ronds, toits, pièces, forteresses (`fort`, avec des cases pour loger les
relous), murs, pyramides, dominos, relief (`relief`) et plateformes (positions en mètres,
`x = 0` à 2 m devant le canon, `y` = bas de la pièce), puis on l'ajoute à son monde. `npm test` vérifie que la
structure tient debout, `npm run solve` qu'elle est gagnable.

### Images

Une image qui manque dans la banque (pose, objet, ennemi) se demande dans `needs.json`, se publie dans la
banque avec `npm run needs -- ../sprite-bank`, puis se génère dans l'atelier de la banque.
