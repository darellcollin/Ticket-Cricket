
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

- [x] DB: table custom_cards (id, userId, category, mefait, ticketPrice, frais, impots, taxe, createdAt)
- [x] tRPC: endpoint createCustomCard (protectedProcedure, max 100 cartes par joueur)
- [x] tRPC: endpoint listCustomCards (protectedProcedure)
- [x] tRPC: endpoint deleteCustomCard (protectedProcedure)
- [x] Page CustomCardCreator: formulaire par catégorie avec prévisualisation GeneratedCard en temps réel
- [x] Page CustomCardCreator: contravention (méfait 150 chars, frais 0/10/20/30/40/50$, ticket 10-4000$)
- [x] Page CustomCardCreator: contribuable (impôts 0/10/20/30/40/50$, ticket toujours 0$)
- [x] Page CustomCardCreator: investisseur (ticket 10-4000$, taxe 0/10/20/30/40/50$, méfait fixe)
- [x] Page CustomCardCreator: liste des cartes créées avec option de suppression (max 100)
- [x] Bouton "Personnaliser" visible dans le header du catalogue des cartes
- [x] Route /custom-cards dans App.tsx
- [x] Sélecteur de deck: option "Cartes personnalisées" dans DifficultyModal (solo)
- [x] Sélecteur de deck: option "Cartes personnalisées" dans LobbyScreen (host seulement)
- [x] Moteur de jeu: GameScreen gère les cartes personnalisées dans le deck
- [x] Moteur de jeu: MultiplayerGameScreen partage les cartes du host avec les autres joueurs
- [x] Tests vitest pour createCustomCard, listCustomCards, deleteCustomCard

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

## Modifications session 15 — Filtrage cartes perso selon types sélectionnés

- [x] Dans GameScreen (solo) : filtrer les cartes personnalisées selon soloDisableT2/T3 au moment de construire le deck
- [x] Dans MultiplayerGameScreen (multi) : filtrer les cartes personnalisées selon mpDisableT2/T3 au moment de construire le deck (IDs négatifs inclus dans allowedCardIds envoyés à Supabase)
- [x] Vérifier que l'accès aux cartes personnalisées est conditionné à isAuthenticated dans les deux modes
- [x] Vérifier que les cartes perso désactivées par défaut (soloCustomEnabled=false) ne rentrent pas dans le deck

## Modifications session 16 — Affichage cartes perso + UI

- [x] Centrer le texte (description infraction/remboursement) sur la carte personnalisée via mefaitOverride dans GeneratedCard
- [x] Texte par défaut investisseur personnalisé : "Ticket au prochain criminel" (injecté dans les registres méfait solo et multi)
- [x] Boutons accueil côte à côte sur PC : JOUER + RÈGLES en flex-row sm, PERSONNALISATION pleine largeur en dessous
- [x] Limite prix contravention et investisseur : 10$ à 4000$ (validé dans handleSubmit)

## Modifications session 17 — Sauvegarde de configurations de partie

- [x] DB: table game_configs (id, userId, name, difficulty, disableT2, disableT3, includeCustom, createdAt)
- [x] tRPC: endpoint saveGameConfig (protectedProcedure, max 10 configs par joueur)
- [x] tRPC: endpoint listGameConfigs (protectedProcedure)
- [x] tRPC: endpoint deleteGameConfig (protectedProcedure)
- [x] tRPC: chargement d'une config via list + application locale dans MultiplayerModal
- [x] UI: bouton "Sauvegarder cette config" dans la fenêtre de sélection solo/multi (si connecté)
- [x] UI: section "Configs sauvegardées" dans la fenêtre de sélection pour charger rapidement une config
- [x] UI: modal de nommage de la configuration avant sauvegarde
- [x] UI: option de suppression d'une config sauvegardée
- [x] Tests vitest pour saveGameConfig, listGameConfigs, deleteGameConfig

## Modifications session 18 — Mini-jeux perquisition refonte

- [x] Multi : déclenchement simultané de la perquisition pour TOUS les joueurs quand un joueur commence son tour et obtient un mini-jeu
- [x] Multi : le joueur actif ne pioche pas de ticket après une perquisition — il clique directement "terminer mon tour"
- [x] Multi : attendre que tous les joueurs confirment la fin du mini-jeu avant de débloquer "terminer mon tour" pour le joueur actif
- [x] Solo : résultats de perquisition (montants) dans l'historique personnel (bouton "mes tickets")
- [x] Multi : résultats de perquisition dans l'historique personnel ("mes tickets") et l'historique de groupe (header)
- [x] Supprimer les emojis dans les notifs de victoire/défaite de perquisition (aucun emoji présent)
- [x] Corriger "clique la bonne flèche" → "clique sur la bonne flèche" dans le texte cache-toi (déjà correct)

## Modifications session 19 — Tâches en cours

- [x] Carte #84 : corriger "civilié" → "civilisé" dans cardMefaits.ts
- [x] Supprimer tous les emojis dans toutes les interfaces (sauf background accueil Home.tsx)
- [x] QR code dans LobbyScreen pour rejoindre la partie rapidement
- [x] Scanner le QR code ouvre l'accueil avec le code pré-rempli (?join=CODE)
- [x] Ouvrir automatiquement le modal "Rejoindre" si ?join=CODE est dans l'URL
- [x] Mini-jeu multi : déclencher au clic "JE COMMENCE" (début de tour) et non lors de la pioche
- [x] Mini-jeu multi : après perquisition, joueur actif ne peut pas piocher — afficher directement "TERMINER MON TOUR"
- [x] Historiques perquisition : résultats dans "Mes Tickets" (multi + solo) et historique groupe (multi)
- [x] Accueil : logo et titre plus grands, bien centrés, sans chevauchement (PC + mobile)
- [x] Bulle "Prêt à recevoir vos tickets ?" ne chevauche pas les boutons
- [x] Bug T3 investisseur : l'autre joueur reste bloqué en attente après confirmation de réception — corriger définitivement
- [x] Filtre de tri par montant (gagné/perdu) dans les historiques de perquisition (multi + solo)
- [x] DeckBreakdown : afficheur détaillé par catégorie (standard + perso, inclus/exclus) dans MultiplayerModal et GameScreen
- [ ] Optimisation complète des interfaces : layout, animations, boutons, responsive PC/mobile, symétrie (en attente de retours utilisateur)

## Modifications session 20 — Corrections visuelles T1/T2/T3 + accueil

- [ ] Supprimer toutes les mentions visuelles T1/T2/T3 dans les interfaces (cartes, catalogues, règles, modals, DeckBreakdown)
- [ ] Supprimer les mentions T1/T2/T3 dans les écrans de choix de mode de jeu (MultiplayerModal, options de deck, DeckBreakdown)
- [ ] Refonte menu d'accueil PC + mobile : logo et titre plus grands, bien centrés, sans chevauchement, visuellement attractif

## Modifications session 20

- [x] DeckBreakdown : supprimer les sous-labels "Ticket"/"Impôt"/"Transfert" — afficher uniquement catégorie + total
- [x] Menu d'accueil : corriger le layout logo + titre "TICKET CRICKET" (PC et mobile)

## Modifications session 21 — Titre géant + logo orbital

- [x] Accueil : supprimer le grand logo fixe
- [x] Accueil : titre TICKET CRICKET très grand en haut de la page
- [x] Accueil : petit logo ticket qui orbite autour du titre (passant devant et derrière)

## Modifications session 22 — QR code, prix cartes, optimisation globale

- [ ] Lobby multijoueur : afficher un QR code scannable du code de partie à côté du code texte
- [ ] Cartes contravention + contribuable : prix en police blanche (comme investisseur)
- [ ] Orbital accueil : rotation fluide et continue sans pause, bien cadré sans débordement
- [ ] Interfaces : layout symétrique, boutons uniformes, animations fluides sans latence
- [ ] Responsive : optimiser mobile en priorité (touch targets, tailles, espacement)
- [ ] Notifications et overlays : centrage et symétrie sur PC et mobile

## Modifications session 23 — Infos jeu, Boutique, Présentation mini-jeux
- [x] Accueil : bouton "Infos" en haut à gauche (icône info) → modal avec l'histoire du jeu
- [x] Accueil : bouton "Boutique" sous "Personnalisation" → modal "Bientôt disponible"
- [x] Créer composant GameInfoModal.tsx avec l'histoire du jeu complète
- [x] Créer composant ShopModal.tsx avec présentation boutique verrouillée
- [x] Créer page MiniGamePresentationModal.tsx avec présentation des fonctionnalités mini-jeux

## Modifications session 24 — Couleurs boutons + amélioration bouton Jouer
- [x] Accueil : bouton Infos en bleu (fond bleu au lieu de blanc/transparent)
- [x] Accueil : bouton JOUER en vert
- [x] Accueil : bouton RÈGLES en jaune
- [x] MultiplayerModal : bouton Jouer plus beau (meilleure typo, design amélioré)
- [x] Solo modal : bouton Jouer plus beau (meilleure typo, design amélioré)

## Modifications session 25 — Partage réseaux sociaux
- [x] Créer composant ShareScore.tsx avec boutons X, Facebook, WhatsApp et copie de lien
- [x] Intégrer ShareScore dans WinnerOverlay (fin de partie multi)
- [x] Intégrer ShareScore dans GameScreen (fin de partie solo) — via WinnerOverlay déjà utilisé

## Corrections session 26 — Mini-jeux multijoueur
- [x] Serveur : mini-jeu déclenché au début du tour (avant pioche), pas après
- [x] Serveur : quand mini-jeu actif, bloquer la pioche pour le joueur principal
- [x] Serveur : fin de tour sans pioche quand mini-jeu a été joué
- [x] Serveur : tous les joueurs reçoivent le mini-jeu simultanément via polling
- [x] Serveur : joueur principal attend que tous aient terminé avant de finir son tour
- [x] Client : afficher le mini-jeu à tous les joueurs dès qu'il est créé (polling)
- [x] Client : joueur principal voit un écran d'attente pendant que les autres jouent
- [x] Client : une fois tous terminés, joueur principal peut finir son tour (sans pioche)

## Modifications session 27 — Bouton partage lien du jeu
- [x] Accueil : bouton partage lien du jeu en bas au centre (icône partage)
- [x] Partage : Web Share API sur mobile, fallback X/Facebook/WhatsApp/SMS/copie sur PC

## Modifications session 28 — Bouton partage + Stripe
- [x] Accueil : déplacer le bouton partage sous le bouton Boutique (au centre, pas dans la barre du bas)
- [x] Accueil : supprimer le bouton partage de la barre du bas
- [x] Stripe : intégrer le système de paiement dans la boutique (skins, decks, dons)
- [x] Boutique : déverrouiller les produits avec Stripe Checkout (paiement réel)
- [x] Boutique : page de confirmation après paiement réussi — toast + redirection Stripe natif

## Modifications session 29 — Limite cartes + Boutique packs
- [x] Accueil : bouton PARTAGER LE JEU réduit (même taille que le bouton compte)
- [x] Cartes perso : limite 15 cartes gratuites (au lieu de 100)
- [x] Cartes perso : message + lien boutique quand limite atteint- [x] Boutique : packs de cartes personnalisables disponibles (2,99\$/35 cartes, 6,99\$/55 cartes, 9,99\$/85 cartes)- [x] Boutique : dons à montant libre (champ de saisie)
- [x] Boutique : skins/decks verrouillés, packs cartes + dons accessibles
- [x] Serveur : vérifier la limite de cartes côté backend selon le quota acheté

## Modifications session 30 — Section Mes Achats dans le profil
- [x] DB : table purchases (id, userId, productId, productName, amountCents, currency, stripeSessionId, createdAt)
- [x] tRPC : endpoint listPurchases (protectedProcedure) — retourner les achats du joueur connecté
- [x] Webhook Stripe : enregistrer l'achat en DB lors de checkout.session.completed
- [x] Profil : section "Mes Achats" avec liste des packs débloqués et dons effectués
- [x] Profil : afficher le quota total de cartes personnalisables (15 gratuits + cartes achetées)

## Corrections session 32 — Layout boutique
- [x] Boutique : pastilles "Populaire"/"Meilleure valeur"/"Maximum" ne doivent pas cacher les prix

## Corrections session 31 — Boutique + Stripe + Serveur
- [x] Redémarrer le serveur de développement
- [x] Corriger erreur TS : import `getDb` au lieu de `db` dans shopRouter.ts
- [x] Boutique : corriger le layout des bulles de prix (texte visible, bien cadrd)
- [x] Boutique : supprimer "Packs personnalisables" de la section "Bientôt disponible"
- [x] Vérifier la connexion Stripe (clés configurées)
- [x] Webhook Stripe : enregistrer l'achat en DB lors de checkout.session.completed

## Corrections session 33 — Boutique navigation packs
- [x] Boutique : remplacer la liste directe des packs par un bouton "Packs de cartes" qui ouvre une vue dédiée
