
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
- [x] Interface responsive: Home, LobbyScreen, RulesScreen, CardCatalogScreen adaptés PC + Mobile
- [x] Mini-jeu: le joueur qui déclenche le mini-jeu NE pioche PAS de carte après (le mini-jeu remplace son tour)
- [x] Mini-jeu: synchronisation via champ miniGame dans la session Supabase (tous les joueurs voient le mini-jeu simultanément)
- [x] Mini-jeu: synchronisation via table mini_game_events en DB (tRPC) — tous les joueurs voient le mini-jeu simultanément
- [x] Mini-jeu: route clearMiniGame via tRPC (effacer après résultat)
- [x] Mini-jeu PC: clics de souris pour "Enfuis-toi" (au lieu de taps tactiles uniquement)
- [x] Mini-jeu PC: clics de souris sur les flèches directionnelles pour "Cache-toi" (au lieu de swipe uniquement)
- [x] Supprimer le nom du joueur sur la carte piochée (ni sur la carte, ni sous la carte)

## Modifications session 5

- [x] Image ticket: remplacer le SVG jaune par le nouveau PNG violet (ticket 3D avec étoiles et pièce)
- [x] Titre accueil: même police (Bangers) et couleur que le dos des cartes piochées
- [x] Élimination: ajouter bouton "Voir le dernier ticket reçu" dans l'animation d'élimination (accessible à tous)
- [x] Emojis: supprimer tous les emojis des interfaces et boutons (sauf fond d'accueil)
- [x] Méfaits T2 contribuables: intégrer les textes des cartes 76-129 dans cardMefaits.ts
- [x] Règles: améliorer la section "mécaniques" avec explication des Perquisitions (ex-mini-jeux)
- [x] Renommer "mini-jeu surprise" en "Perquisition" partout dans le jeu

## Modifications session 6

- [x] Règles Mécaniques: déplacer le bloc ASTUCE (barre de progression) après LIMITE & ÉLIMINATION
- [x] Règles Objectif: supprimer le bloc MODE MULTIJOUEUR
- [x] Règles Les cartes: bulle Investisseurs → couleurs rose/mauve, remplacer icône éclair par flèche montante (TrendingDown rotatée)
- [x] Header solo: bouton Sauvegarder → petit carré mauve (w-11 h-11), placé à côté du bouton Accueil, sans texte

## Modifications session 7

- [x] Perquisitions multijoueur: TOUS les joueurs font le mini-jeu simultanément, résultats individuels, piocheur attend que tous aient terminé avant de finir son tour
- [x] Mini-jeux: animations plus cool et dynamiques (effets visuels améliorés)
- [x] Multijoueur: animation de match nul quand toutes les cartes sont piochées mais plusieurs joueurs encore en vie
- [x] Cartes: texte du méfait intégralement visible (pas de troncature)
- [x] Accueil PC: pleine page (pas de bandes noires sur les côtés)
- [x] Accueil: titre "TICKET CRICKET" plus haut sans déborder sur le logo PNG et sans bouger le logo
- [x] Header solo: bouton "Mélanger" placé à côté du bouton "Sauvegarder"
- [x] Header solo: limite de dette au centre du header, nombre de cartes restantes à droite (comme en multi)
- [x] Multijoueur investisseur: piocheur bloqué jusqu'à réception du ticket par l'autre joueur

## Modifications session 8

- [x] cardMefaits.ts: intégrer les textes T1 Contraventions (cartes 63-75) fournis par l'utilisateur
- [x] cardMefaits.ts: intégrer les textes T1 Contraventions (cartes 130-324) fournis par l'utilisateur
- [x] Catalogue des cartes: améliorer la fluidité et mettre à jour les cartes avec les nouveaux textes

## Modifications session 9 — Renumérotation des cartes

- [x] Analyser la structure actuelle : quelles cartes sont investisseur, contribuable, contravention
- [x] Réécrire cardConfig.ts avec nouveau mapping (investisseurs 1-63, contribuables 64-116, contraventions 117-324)
- [x] Réécrire cardPrices.ts avec nouveau mapping
- [x] Réécrire cardMefaits.ts avec nouveau mapping
- [x] Améliorer le catalogue des cartes (fluidité, recherche méfait, pleine largeur PC)

## Modifications session 10 — Cartes personnalisées

- [ ] DB: table custom_cards (id, userId, category, mefait, ticketPrice, frais, impots, taxe, createdAt)
- [ ] tRPC: endpoint createCustomCard (protectedProcedure, max 100 cartes par joueur)
- [ ] tRPC: endpoint listCustomCards (protectedProcedure)
- [ ] tRPC: endpoint deleteCustomCard (protectedProcedure)
- [ ] Page CustomCardCreator: formulaire par catégorie avec prévisualisation GeneratedCard en temps réel
- [ ] Page CustomCardCreator: contravention (méfait 150 chars, frais 0/10/20/30/40/50$, ticket 10-4000$)
- [ ] Page CustomCardCreator: contribuable (impôts 0/10/20/30/40/50$, ticket toujours 0$)
- [ ] Page CustomCardCreator: investisseur (ticket 10-4000$, taxe 0/10/20/30/40/50$, méfait fixe)
- [ ] Page CustomCardCreator: liste des cartes créées avec option de suppression (max 100)
- [ ] Bouton "Personnaliser" visible dans le header du catalogue des cartes
- [ ] Route /custom-cards dans App.tsx
- [ ] Sélecteur de deck: option "Cartes personnalisées" dans DifficultyModal (solo)
- [ ] Sélecteur de deck: option "Cartes personnalisées" dans LobbyScreen (host seulement)
- [ ] Moteur de jeu: GameScreen gère les cartes personnalisées dans le deck
- [ ] Moteur de jeu: MultiplayerGameScreen partage les cartes du host avec les autres joueurs
- [ ] Tests vitest pour createCustomCard, listCustomCards, deleteCustomCard

## Modifications session 11 — Navigation personnalisation

- [x] Corriger erreur "No procedure found on path customCards.list" (routeur serveur)
- [x] Renommer bouton "CATALOGUE DES CARTES" en "PERSONNALISATION" sur l'accueil, rediriger vers /custom-cards
- [x] Supprimer le bouton "MES CARTES" du header du catalogue (accès via accueil uniquement)
- [x] Intégrer sélection "cartes personnalisées" dans le flux de démarrage solo (MultiplayerModal)
- [x] Intégrer sélection "cartes personnalisées" dans le flux de démarrage multi (MultiplayerModal host)

## Modifications session 12 — Navigation catalogue + personnalisation

- [x] Remettre bouton "CATALOGUE DES CARTES" sur l'accueil (mène vers /admin)
- [x] Renommer bouton "PERSONNALISATION" sur l'accueil en "CATALOGUE DES CARTES" et rediriger vers /admin
- [x] Ajouter bouton "PERSONNALISATION" visible dans le header du catalogue (/admin) qui ouvre /custom-cards
- [x] Corriger le bouton retour dans CustomCardCreator pour revenir au catalogue (/admin) et non à l'accueil

## Modifications session 13 — Option cartes personnalisées toujours visible

- [x] Afficher l'option "Cartes personnalisées" dans la fenêtre solo même si le joueur n'a pas de cartes (désactivé + message "Aucune carte créée — Personnaliser")
- [x] Afficher l'option "Cartes personnalisées" dans la fenêtre multi (host) même si le joueur n'a pas de cartes
- [x] L'option doit être visible pour les joueurs non connectés aussi (avec message "Connexion requise")

## Modifications session 14 — Bouton PERSONNALISATION sur l'accueil

- [x] Renommer le bouton "CATALOGUE DES CARTES" sur l'accueil en "PERSONNALISATION" → pointe vers /custom-cards
- [x] Accès catalogue conservé via bouton PERSONNALISATION dans le header du catalogue (/admin)
