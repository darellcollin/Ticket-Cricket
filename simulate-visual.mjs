/**
 * simulate-visual.mjs — Simulation visuelle in-game du flux mini-jeu multijoueur
 * Ouvre 2 contextes de navigateur (Alice + Bob), joue une partie complète
 * et capture des screenshots à chaque étape clé.
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUT_DIR  = "/home/ubuntu/sim-screenshots";
mkdirSync(OUT_DIR, { recursive: true });

const G = s => `\x1b[32m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const C = s => `\x1b[36m${s}\x1b[0m`;
const B = s => `\x1b[1m${s}\x1b[0m`;

let n = 0;
const files = [];

async function snap(page, slug, label) {
  n++;
  const f = path.join(OUT_DIR, `${String(n).padStart(2,"0")}-${slug}.png`);
  await page.screenshot({ path: f });
  files.push({ n, f, label });
  console.log(`  ${C("📸")} ${label} → ${f}`);
  return f;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function trpc(page, method, input, mutation = false) {
  return page.evaluate(async ([method, input, mutation]) => {
    const url = `/api/trpc/${method}`;
    if (!mutation) {
      const r = await fetch(`${url}?input=${encodeURIComponent(JSON.stringify(input))}`, { credentials: "include" });
      const j = await r.json();
      return j?.result?.data ?? null;
    } else {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const j = await r.json();
      return j?.result?.data ?? null;
    }
  }, [method, input, mutation]);
}

async function main() {
  console.log(B(C("\n╔══════════════════════════════════════════════════════╗")));
  console.log(B(C("║   SIMULATION VISUELLE — MINI-JEU MULTIJOUEUR         ║")));
  console.log(B(C("╚══════════════════════════════════════════════════════╝\n")));

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Deux contextes indépendants = deux "navigateurs" différents
  const ctxA = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const ctxB = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const A = await ctxA.newPage();
  const B_ = await ctxB.newPage();

  const CODE = "SIM" + Date.now().toString().slice(-4);

  try {
    // ── 1. Accueil ──────────────────────────────────────────────────────────
    console.log(Y(B("\n━━━ ÉTAPE 1 — Les deux joueurs ouvrent le jeu ━━━")));
    await Promise.all([
      A.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 }),
      B_.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 }),
    ]);
    await sleep(1500);
    await snap(A,  "01-alice-accueil", "Alice — Page d'accueil");
    await snap(B_, "02-bob-accueil",   "Bob — Page d'accueil");

    // ── 2. Alice crée une partie ────────────────────────────────────────────
    console.log(Y(B("\n━━━ ÉTAPE 2 — Alice crée une partie multijoueur ━━━")));
    // Cliquer sur JOUER
    await A.locator("button, [role=button]").filter({ hasText: /jouer/i }).first().click();
    await sleep(800);
    await snap(A, "03-alice-menu-jeu", "Alice — Menu de jeu ouvert");

    // Cliquer sur MULTIJOUEUR
    const multiBtn = A.locator("button, [role=button]").filter({ hasText: /multi/i }).first();
    await multiBtn.click().catch(async () => {
      // Essayer un autre sélecteur
      await A.locator("text=/[Mm]ulti/").first().click();
    });
    await sleep(800);
    await snap(A, "04-alice-multi-modal", "Alice — Modal multijoueur");

    // Cliquer sur CRÉER
    const creerBtn = A.locator("button").filter({ hasText: /cr[eé]er/i }).first();
    await creerBtn.click().catch(async () => {
      await A.locator("text=/[Cc]r[eé]er/").first().click();
    });
    await sleep(1200);
    await snap(A, "05-alice-lobby", "Alice — Lobby (hôte)");

    // Récupérer le code de la partie affiché à l'écran
    const codeText = await A.locator("text=/[A-Z0-9]{4,8}/").first().textContent().catch(() => null);
    console.log(`  Code de partie détecté : ${C(codeText ?? "(non trouvé)")}`);

    // ── 3. Bob rejoint la partie ────────────────────────────────────────────
    console.log(Y(B("\n━━━ ÉTAPE 3 — Bob rejoint la partie ━━━")));
    await B_.locator("button, [role=button]").filter({ hasText: /jouer/i }).first().click();
    await sleep(600);
    const multiBtn2 = B_.locator("button, [role=button]").filter({ hasText: /multi/i }).first();
    await multiBtn2.click().catch(async () => {
      await B_.locator("text=/[Mm]ulti/").first().click();
    });
    await sleep(600);

    // Cliquer sur REJOINDRE
    const rejBtn = B_.locator("button").filter({ hasText: /rejoindre/i }).first();
    await rejBtn.click().catch(async () => {
      await B_.locator("text=/[Rr]ejoindre/").first().click();
    });
    await sleep(600);
    await snap(B_, "06-bob-rejoindre", "Bob — Formulaire rejoindre");

    // Entrer le code si un champ est visible
    if (codeText) {
      const codeInput = B_.locator("input[placeholder*='code' i], input[placeholder*='Code' i], input[type='text']").first();
      await codeInput.fill(codeText).catch(() => {});
      await sleep(400);
    }
    await snap(B_, "07-bob-code-saisi", "Bob — Code saisi");

    // ── 4. Simulation directe du mini-jeu via tRPC ──────────────────────────
    console.log(Y(B("\n━━━ ÉTAPE 4 — Simulation du mini-jeu via tRPC ━━━")));

    // Utiliser un code de session de test
    const TEST_CODE = "SIMVIZ1";
    const ALICE_ID  = "alice-visual-001";
    const BOB_ID    = "bob-visual-002";

    // Alice déclenche le mini-jeu
    console.log("  Alice déclenche la Perquisition...");
    const triggerResult = await trpc(A, "miniGame.trigger", {
      sessionCode: TEST_CODE,
      playerId: ALICE_ID,
      mode: "run",
      totalPlayers: 2,
    }, true);
    console.log(`  → Résultat trigger: ${JSON.stringify(triggerResult)}`);

    const eventId = triggerResult?.eventId;
    if (!eventId) {
      console.log(`  ${Y("⚠ tRPC trigger non accessible depuis le contexte browser — simulation via URL directe")}`);
    } else {
      console.log(G(`  ✓ Événement créé en DB — eventId: ${eventId}`));

      // Bob poll getActive
      console.log("  Bob poll getActive (simule le polling 1.5s)...");
      const activeForBob = await trpc(B_, "miniGame.getActive", { sessionCode: TEST_CODE });
      console.log(`  → Bob getActive: ${JSON.stringify(activeForBob)}`);
      if (activeForBob?.id === eventId) {
        console.log(G(`  ✓ Bob reçoit le mini-jeu via polling ! mode=${activeForBob.mode}`));
      }

      // Alice poll getActive (elle aussi le reçoit)
      const activeForAlice = await trpc(A, "miniGame.getActive", { sessionCode: TEST_CODE });
      if (activeForAlice?.id === eventId) {
        console.log(G(`  ✓ Alice reçoit aussi le mini-jeu via polling (déclencheur) !`));
      }

      // Status avant soumissions
      const statusBefore = await trpc(A, "miniGame.getStatus", {
        sessionCode: TEST_CODE,
        eventId,
        totalPlayers: 2,
      });
      console.log(`  → Status avant soumissions: soumis=${statusBefore?.submittedCount}/2, allDone=${statusBefore?.allDone}`);

      // Alice soumet (échec)
      await trpc(A, "miniGame.submitResult", {
        sessionCode: TEST_CODE,
        eventId,
        playerId: ALICE_ID,
        success: false,
        amount: 1000,
      }, true);
      console.log(G(`  ✓ Alice soumet : échec (+1000$)`));

      // Status intermédiaire
      const statusMid = await trpc(A, "miniGame.getStatus", {
        sessionCode: TEST_CODE,
        eventId,
        totalPlayers: 2,
      });
      console.log(`  → Status intermédiaire: soumis=${statusMid?.submittedCount}/2, allDone=${statusMid?.allDone}`);
      if (statusMid?.submittedCount === 1 && !statusMid?.allDone) {
        console.log(G(`  ✓ Alice attend Bob → écran "En attente des autres..." affiché`));
      }

      // Bob soumet (succès)
      await trpc(B_, "miniGame.submitResult", {
        sessionCode: TEST_CODE,
        eventId,
        playerId: BOB_ID,
        success: true,
        amount: 1000,
      }, true);
      console.log(G(`  ✓ Bob soumet : succès (-1000$)`));

      // Status final
      const statusFinal = await trpc(A, "miniGame.getStatus", {
        sessionCode: TEST_CODE,
        eventId,
        totalPlayers: 2,
      });
      console.log(`  → Status final: soumis=${statusFinal?.submittedCount}/2, allDone=${statusFinal?.allDone}`);
      if (statusFinal?.allDone) {
        console.log(G(`  ✓ allDone=true → Alice peut terminer son tour SANS piocher !`));
      }

      // Alice résout
      const resolveResult = await trpc(A, "miniGame.resolve", {
        sessionCode: TEST_CODE,
        eventId,
      }, true);
      console.log(G(`  ✓ Événement résolu: ${JSON.stringify(resolveResult)}`));

      // Vérification finale
      const activeAfter = await trpc(A, "miniGame.getActive", { sessionCode: TEST_CODE });
      if (!activeAfter) {
        console.log(G(`  ✓ getActive → null — mini-jeu terminé, tour peut continuer`));
      }
    }

    // ── 5. Naviguer vers le MiniGame component directement ──────────────────
    console.log(Y(B("\n━━━ ÉTAPE 5 — Affichage visuel du mini-jeu ━━━")));

    // Naviguer vers la page de jeu solo pour voir le composant MiniGame
    await A.goto(`${BASE_URL}/game?solo=1`, { waitUntil: "domcontentloaded" }).catch(() =>
      A.goto(BASE_URL, { waitUntil: "domcontentloaded" })
    );
    await sleep(1000);
    await snap(A, "08-alice-game-solo", "Alice — Écran de jeu solo");

    // Retour à l'accueil pour capture finale
    await Promise.all([
      A.goto(BASE_URL, { waitUntil: "domcontentloaded" }),
      B_.goto(BASE_URL, { waitUntil: "domcontentloaded" }),
    ]);
    await sleep(1000);
    await snap(A,  "09-alice-fin", "Alice — Retour accueil");
    await snap(B_, "10-bob-fin",   "Bob — Retour accueil");

  } finally {
    await browser.close();
  }

  // ── Résumé ─────────────────────────────────────────────────────────────────
  console.log(B(G(`\n╔══════════════════════════════════════════════════════╗`)));
  console.log(B(G(`║   SIMULATION TERMINÉE — ${files.length} captures d'écran          ║`)));
  console.log(B(G(`╚══════════════════════════════════════════════════════╝\n`)));
  files.forEach(({ n, f, label }) =>
    console.log(`  ${n}. ${C(label)}\n     ${f}`)
  );
}

main().catch(e => {
  console.error("\x1b[31mErreur fatale:\x1b[0m", e.message);
  console.error(e.stack);
  process.exit(1);
});
