
## Améliorations demandées

- [x] Corriger timing overlay élimination/victoire en solo — joueur doit lire sa carte avant
- [x] Corriger timing overlay élimination/victoire en multijoueur — joueur doit lire sa carte avant
- [x] Upgrader vers web-db-user pour backend + base de données
- [x] Table game_profiles dans la base de données (pseudo, email, mot de passe hashé)
- [x] Endpoints tRPC pour inscription (pseudo + courriel + mot de passe)
- [x] Endpoints tRPC pour connexion (pseudo/courriel + mot de passe)
- [x] Endpoint tRPC pour récupérer le profil connecté
- [x] Endpoint tRPC pour déconnexion
- [x] Hook useGameAuth côté frontend
- [x] Composant AccountModal (connexion/inscription)
- [x] Icône de compte en haut à droite de l'accueil
- [x] Profil connecté avec avatar initiale et pseudo affiché
- [x] Modal de profil avec option de déconnexion
- [x] Tests vitest pour les endpoints d'authentification
- [x] Fix bug: limite de difficulté qui changeait entre les pioches (threshold figé avec useRef + reset deck si difficulté change)
- [x] Ajustement visuel : bouton de compte décalé de 9px vers le bas (marginTop)
- [x] Créer cardMefaits.ts — mapping numéro de carte → texte du méfait (placeholders initiaux)
- [x] Créer composant GeneratedCard — design contravention policière avec type/méfait/prix/détails
- [x] Intégrer GeneratedCard dans GameScreen (solo) à la place des images PNG
- [x] Intégrer GeneratedCard dans MultiplayerGameScreen
- [x] Intégrer GeneratedCard dans CardCatalogScreen / CardAdminScreen
- [x] Intégrer GeneratedCard dans TestCarteScreen
- [x] Générer la liste complète des 324 cartes organisée par catégorie pour l'utilisateur
- [x] Terminer migration GameScreen: supprimer tous les rendus legacy CardFace/CardBack et getCardAssetUrl/getCardImageUrl
- [x] Terminer migration MultiplayerGameScreen: supprimer tous les rendus legacy CardFace/CardBack et getCardAssetUrl/getCardImageUrl
- [x] Vérification technique: grep confirmant aucun rendu actif n'utilise getCardAssetUrl/getCardImageUrl dans les écrans de jeu
- [x] Refonte design cartes: couleur jaune pour contraventions, vert pour contribuables, rose pour investisseurs
- [x] Refonte design cartes: texte et prix beaucoup plus gros et lisibles
- [x] Refonte design cartes: style cohérent avec le thème arcade/police du jeu (Bangers, Fredoka, bordures épaisses)
- [x] Nettoyer les composants legacy CardFace/CardBack/MiniCardFace et imports getCardAssetUrl/getCardImageUrl
- [x] Inscrire méfait "Ticket au prochain criminel" pour les cartes 1-62 et 77 dans cardMefaits.ts
- [x] Refonte artistique cartes: texte du méfait beaucoup plus gros (élément central)
- [x] Refonte artistique cartes: prix/frais/détails financiers visuellement attractifs et plus gros
- [x] Refonte artistique cartes: nom de catégorie bien visible et plus gros
- [x] Refonte artistique cartes: supprimer tous les emojis des cartes
- [x] Refonte artistique cartes: supprimer le mot "méfait" de toutes les cartes
- [x] Refonte artistique cartes: augmenter la police d'écriture de tous les éléments
- [x] Optimiser la prévisualisation carte sélectionnée: design plus attractif et percutant
- [x] Améliorer la prévisualisation: carte agrandie avec tous les détails bien visibles
- [x] Améliorer la prévisualisation: transitions et animations fluides
- [x] Améliorer la prévisualisation: informations financières mieux organisées et plus lisibles

## Nouvelles fonctionnalités (session 3)

- [x] Correction texte cartes T2: "remboursement" → "remboursement d'impôt" dans GeneratedCard
- [x] Sauvegarde: table saved_games en DB (userId, gameState JSON, difficulté, date)
- [x] Sauvegarde: endpoint tRPC saveGame (protectedProcedure)
- [x] Sauvegarde: endpoint tRPC loadGame (protectedProcedure)
- [x] Sauvegarde: endpoint tRPC deleteSave (protectedProcedure)
- [x] Sauvegarde: bouton sauvegarde dans le header du mode solo (icône disquette/cloud)
- [x] Sauvegarde: modal de confirmation à la sortie (Sauvegarder / Ne pas sauvegarder / Annuler)
- [x] Sauvegarde: reprise de partie via bouton "Jouer" si une sauvegarde existe (connecté)
- [x] Mini-jeu: composant MiniGame avec mode "enfuis-toi" (tap rapide) et "cache-toi" (swipe)
- [x] Mini-jeu: déclenchement très rare (probabilité ~8%) au début du tour en solo et multijoueur
- [x] Mini-jeu: barre de progression, timer 10 sec, animations de clic/swipe- [x] Mini-jeu: résultat — réussite: -1000\$ dette, échec: +1000\$ dette- [x] Mini-jeu: intégration dans GameScreen (solo)
- [x] Mini-jeu: intégration dans MultiplayerGameScreen (visible par tous les joueurs simultanément)
- [x] Tests vitest pour les endpoints de sauvegarde (saveGame, loadGame, deleteSave) — 7 tests, tous passent
- [x] Tests vitest pour miniGameRouter (trigger, getActive, resolve) — 8 tests, tous passent

## Modifications session 4

- [x] Mini-jeu: réduire la probabilité d'apparition de 8% à 2%
- [x] Mini-jeu: augmenter le nombre de taps requis pour "Enfuis-toi" (plus difficile)
- [x] Mini-jeu: augmenter le nombre de swipes requis pour "Cache-toi" (plus difficile)
- [x] Carte: ne pas afficher le nom du joueur sur la carte (ni sur, ni sous) — décision finale
- [x] Carte: supprimer l'affichage du nom du joueur sous la carte dans GameScreen et MultiplayerGameScreen
- [x] Design cartes: police d'écriture plus grande et plus visible sur toutes les 324 cartes
- [x] Design cartes: style plus "goofy" (fun, exagéré, décalé) pour toutes les cartes
- [x] Mini-jeu multijoueur: synchronisation via session partagée — le mini-jeu doit s'activer pour TOUS les joueurs en même temps (pas seulement le joueur actif)

## Modifications session 4 (suite)

- [x] Interface responsive: GameScreen adapté PC + Mobile (max-width, layout flexible, taille des éléments)
- [x] Interface responsive: MultiplayerGameScreen adapté PC + Mobile
- [ ] Interface responsive: Home, Lobby, Rules, CardCatalog adaptés PC + Mobile
- [x] Mini-jeu: le joueur qui déclenche le mini-jeu NE pioche PAS de carte après (le mini-jeu remplace son tour)
- [x] Mini-jeu: synchronisation via champ miniGame dans la session Supabase (tous les joueurs voient le mini-jeu simultanément)
- [x] Mini-jeu: synchronisation via table mini_game_events en DB (tRPC) — tous les joueurs voient le mini-jeu simultanément
- [x] Mini-jeu: route clearMiniGame via tRPC (effacer après résultat)
- [x] Mini-jeu PC: clics de souris pour "Enfuis-toi" (au lieu de taps tactiles uniquement)
- [x] Mini-jeu PC: clics de souris sur les flèches directionnelles pour "Cache-toi" (au lieu de swipe uniquement)
- [x] Supprimer le nom du joueur sur la carte piochée (ni sur la carte, ni sous la carte)
