# Brainstorming Design — Ticket Cricket

Ce projet est un **portage fidèle** du jeu de cartes Ticket Cricket depuis un dépôt Figma Make. Le design original est déjà défini dans le code source. Voici trois approches pour l'adapter au web.

---

<response>
<text>
## Idée 1 — Portage Fidèle « Arcade Urbaine »

**Design Movement** : Rétro-Arcade / Street Art — inspiré des jeux de société numériques avec une touche urbaine (contraventions, police).

**Core Principles** :
1. Fond sombre avec accents néon vifs (jaune, vert, rose)
2. Typographie ludique et imposante (Bangers pour les titres, Fredoka One pour le corps)
3. Animations fluides avec framer-motion pour chaque interaction de carte
4. Particules flottantes (emojis 🎫🚨🚔) en arrière-plan pour l'ambiance

**Color Philosophy** : Fond noir/gris très sombre (#0f172a) avec des accents catégoriels — jaune doré (#FBBF24) pour les contraventions, vert vif (#22C55E) pour les contribuables, rose (#EC4899) pour les investisseurs. Le rouge (#DC2626) signale le danger/dette.

**Layout Paradigm** : Plein écran mobile-first. L'écran de jeu occupe 100vh avec la carte au centre, les contrôles en bas, et le score en haut. Navigation par écrans complets avec transitions animées.

**Signature Elements** : Ruban de police jaune/noir (PoliceTape) comme séparateur visuel, confettis au moment de la victoire, cartes qui se retournent avec animation 3D.

**Interaction Philosophy** : Chaque pioche est un événement — animation de retournement, flash de couleur selon la catégorie, vibration visuelle pour les grosses amendes.

**Animation** : Entrées en scale+fade, cartes qui glissent depuis le deck, particules qui flottent en continu, overlay de victoire avec confettis explosifs.

**Typography System** : Bangers (Google Fonts) pour tous les titres et montants — donne un aspect BD/bande dessinée. Fredoka One pour les boutons et textes secondaires — arrondi et ludique.
</text>
<probability>0.06</probability>
</response>

<response>
<text>
## Idée 2 — « Néo-Brutalisme Ludique »

**Design Movement** : Néo-Brutalisme — bordures épaisses noires, ombres portées dures, couleurs saturées en blocs.

**Core Principles** :
1. Bordures noires épaisses (3-4px) sur tous les éléments interactifs
2. Ombres portées dures (4px 4px 0px #000) sans flou
3. Couleurs en aplats vifs sans dégradés
4. Typographie monospace pour les montants, display bold pour les titres

**Color Philosophy** : Fond blanc cassé (#FFFDF0) avec blocs de couleur pure — rouge pompier pour les contraventions, vert menthe pour les contribuables, violet électrique pour les investisseurs. Le noir est omniprésent comme structure.

**Layout Paradigm** : Grille asymétrique avec des blocs qui se chevauchent légèrement. Les cartes sont des rectangles avec coins carrés et bordures épaisses. Le score est un compteur brutaliste en haut.

**Signature Elements** : Boutons avec effet « pressé » (ombre qui disparaît + translation), cartes avec coins coupés asymétriques, texte qui déborde légèrement de ses conteneurs.

**Interaction Philosophy** : Interactions physiques — les boutons s'enfoncent, les cartes claquent sur la table, les montants s'affichent avec un effet machine à écrire.

**Animation** : Transitions saccadées et intentionnelles (pas de ease), cartes qui tombent avec rebond, compteurs qui défilent comme un flipper.

**Typography System** : Space Grotesk Bold pour les titres, JetBrains Mono pour les montants et données, Space Grotesk Regular pour le corps.
</text>
<probability>0.03</probability>
</response>

<response>
<text>
## Idée 3 — « Glassmorphism Nocturne »

**Design Movement** : Glassmorphism sur fond sombre — surfaces translucides avec flou, reflets subtils, profondeur par couches.

**Core Principles** :
1. Surfaces en verre dépoli (backdrop-blur + fond semi-transparent)
2. Fond avec gradient mesh animé subtil
3. Bordures lumineuses fines (1px rgba blanc)
4. Hiérarchie par niveaux de transparence

**Color Philosophy** : Fond gradient sombre (du bleu nuit #0c1222 au violet profond #1a0a2e). Les cartes sont des panneaux de verre avec teinte catégorielle — ambre pour contraventions, émeraude pour contribuables, magenta pour investisseurs.

**Layout Paradigm** : Couches empilées avec profondeur. Le deck est au centre sur un piédestal lumineux, les informations flottent dans des panneaux de verre autour. Navigation par glissement entre les écrans.

**Signature Elements** : Halo lumineux autour de la carte piochée, particules de lumière qui suivent le curseur, reflets sur les surfaces de verre.

**Interaction Philosophy** : Interactions douces et fluides — les éléments répondent au survol avec un léger glow, les cartes lévitent avant d'être piochées.

**Animation** : Tout est fluide et organique — spring physics pour les cartes, gradient mesh qui pulse lentement, particules de lumière ambiantes.

**Typography System** : Outfit pour les titres (géométrique moderne), DM Sans pour le corps (lisible sur fond sombre), Outfit Bold pour les montants.
</text>
<probability>0.04</probability>
</response>

---

## Choix : Idée 1 — Portage Fidèle « Arcade Urbaine »

C'est le choix naturel car le code source original utilise déjà ce style (Bangers, Fredoka One, fond sombre, couleurs catégorielles, particules emoji, PoliceTape). Le portage sera fidèle au design existant tout en l'adaptant proprement au framework web.
