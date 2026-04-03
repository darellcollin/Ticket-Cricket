/**
 * simulate-direct.mjs
 * Simulation visuelle directe — navigue vers les pages du jeu et capture les états
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE = "http://localhost:3000";
const OUT  = "/home/ubuntu/sim-screenshots";
mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let n = 0;
const files = [];

async function snap(page, slug, label) {
  n++;
  const f = path.join(OUT, `${String(n).padStart(2,"0")}-${slug}.png`);
  await page.screenshot({ path: f, fullPage: false });
  files.push({ label, f });
  console.log(`  📸 [${n}] ${label}`);
  return f;
}

async function trpcMut(page, proc, input) {
  return page.evaluate(async ([proc, input]) => {
    try {
      const r = await fetch(`/api/trpc/${proc}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const j = await r.json();
      return j?.result?.data ?? j?.error ?? null;
    } catch(e) { return { error: e.message }; }
  }, [proc, input]);
}

async function trpcQ(page, proc, input) {
  return page.evaluate(async ([proc, input]) => {
    try {
      const r = await fetch(`/api/trpc/${proc}?input=${encodeURIComponent(JSON.stringify(input))}`, {
        credentials: "include",
      });
      const j = await r.json();
      return j?.result?.data ?? j?.error ?? null;
    } catch(e) { return { error: e.message }; }
  }, [proc, input]);
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   SIMULATION VISUELLE — MINI-JEU MULTIJOUEUR         ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctxA = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const ctxB = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const A = await ctxA.newPage();
  const B = await ctxB.newPage();

  const SIM_CODE = "SIMV" + Math.floor(Math.random() * 9000 + 1000);
  const ALICE = "alice-" + Date.now();
  const BOB   = "bob-"   + Date.now();

  try {
    // ── 1. Accueil ──────────────────────────────────────────────────────────
    console.log("\n━━━ 1. Les deux joueurs ouvrent le jeu ━━━");
    await Promise.all([
      A.goto(BASE, { waitUntil: "networkidle", timeout: 20000 }),
      B.goto(BASE, { waitUntil: "networkidle", timeout: 20000 }),
    ]);
    await sleep(1000);
    await snap(A, "alice-accueil", "Alice — Accueil");
    await snap(B, "bob-accueil",   "Bob — Accueil");

    // ── 2. Flux tRPC mini-jeu ───────────────────────────────────────────────
    console.log("\n━━━ 2. Flux mini-jeu via tRPC (simulation API) ━━━");

    // Nettoyer d'abord
    const existing = await trpcQ(A, "miniGame.getActive", { sessionCode: SIM_CODE });
    if (existing?.id) {
      await trpcMut(A, "miniGame.resolve", { sessionCode: SIM_CODE, eventId: existing.id });
    }

    // Alice déclenche
    console.log(`  [Alice] Déclenche la Perquisition (session: ${SIM_CODE})...`);
    const trigger = await trpcMut(A, "miniGame.trigger", {
      sessionCode: SIM_CODE,
      playerId: ALICE,
      mode: "run",
      totalPlayers: 2,
    });
    console.log(`  → Trigger: ${JSON.stringify(trigger)}`);

    const eventId = trigger?.eventId;
    if (!eventId) {
      console.log("  ⚠ Pas d'eventId retourné — vérifier que le serveur tRPC est accessible");
    } else {
      console.log(`  ✓ Événement créé ! eventId=${eventId}`);

      // Capturer l'état de l'accueil pendant que le mini-jeu est "actif"
      await snap(A, "alice-minigame-actif", "Alice — Mini-jeu déclenché (attente polling)");

      // Bob poll getActive
      console.log(`  [Bob] Poll getActive...`);
      const activeB = await trpcQ(B, "miniGame.getActive", { sessionCode: SIM_CODE });
      console.log(`  → Bob getActive: ${JSON.stringify(activeB)}`);
      if (activeB?.id === eventId) {
        console.log(`  ✓ Bob reçoit le mini-jeu ! mode=${activeB.mode}`);
      }

      // Alice poll getActive aussi
      const activeA = await trpcQ(A, "miniGame.getActive", { sessionCode: SIM_CODE });
      if (activeA?.id === eventId) {
        console.log(`  ✓ Alice reçoit aussi le mini-jeu via polling !`);
      }

      // Status initial
      const s0 = await trpcQ(A, "miniGame.getStatus", { sessionCode: SIM_CODE, eventId, totalPlayers: 2 });
      console.log(`  → Status initial: soumis=${s0?.submittedCount}/2, allDone=${s0?.allDone}`);

      // Alice soumet (échec)
      await trpcMut(A, "miniGame.submitResult", {
        sessionCode: SIM_CODE, eventId, playerId: ALICE, success: false, amount: 1000,
      });
      console.log(`  ✓ Alice soumet : ÉCHEC (+1000$)`);

      // Status intermédiaire
      const s1 = await trpcQ(A, "miniGame.getStatus", { sessionCode: SIM_CODE, eventId, totalPlayers: 2 });
      console.log(`  → Status intermédiaire: soumis=${s1?.submittedCount}/2, allDone=${s1?.allDone}`);
      if (s1?.submittedCount === 1 && !s1?.allDone) {
        console.log(`  ✓ Alice attend Bob → écran "En attente..." actif`);
      }

      // Bob soumet (succès)
      await trpcMut(B, "miniGame.submitResult", {
        sessionCode: SIM_CODE, eventId, playerId: BOB, success: true, amount: 1000,
      });
      console.log(`  ✓ Bob soumet : SUCCÈS (-1000$)`);

      // Status final
      const s2 = await trpcQ(A, "miniGame.getStatus", { sessionCode: SIM_CODE, eventId, totalPlayers: 2 });
      console.log(`  → Status final: soumis=${s2?.submittedCount}/2, allDone=${s2?.allDone}`);
      if (s2?.allDone) {
        console.log(`  ✓ allDone=true ! Alice peut terminer son tour SANS piocher`);
        if (s2.results) {
          s2.results.forEach(r => {
            const who = r.playerId === ALICE ? "Alice" : "Bob";
            console.log(`    → ${who}: ${r.success ? "✓ Succès" : "✗ Échec"} (${r.amount}$)`);
          });
        }
      }

      // Alice résout
      const resolved = await trpcMut(A, "miniGame.resolve", { sessionCode: SIM_CODE, eventId });
      console.log(`  ✓ Résolu: ${JSON.stringify(resolved)}`);

      // Vérification finale
      const afterResolve = await trpcQ(A, "miniGame.getActive", { sessionCode: SIM_CODE });
      if (!afterResolve) {
        console.log(`  ✓ getActive → null — mini-jeu terminé, tour continue normalement`);
      }
    }

    // ── 3. Naviguer vers le jeu solo pour voir l'interface ──────────────────
    console.log("\n━━━ 3. Captures des interfaces de jeu ━━━");

    // Accueil avec boutons
    await snap(A, "accueil-final", "Interface accueil — boutons JOUER/RÈGLES");

    // Ouvrir le modal de jeu
    await A.locator("button").filter({ hasText: /jouer/i }).first().click().catch(() => {});
    await sleep(800);
    await snap(A, "modal-jeu", "Modal — choix de mode de jeu");

    // Fermer et aller sur les règles
    await A.keyboard.press("Escape").catch(() => {});
    await sleep(400);
    await A.locator("button").filter({ hasText: /règles/i }).first().click().catch(() => {});
    await sleep(800);
    await snap(A, "regles", "Page des règles du jeu");

    // Fermer
    await A.keyboard.press("Escape").catch(() => {});
    await sleep(400);
    await snap(A, "accueil-clean", "Accueil — état final");

  } finally {
    await browser.close();
  }

  // ── Résumé ─────────────────────────────────────────────────────────────────
  console.log(`\n✓ Simulation terminée — ${files.length} captures d'écran :`);
  files.forEach(({ label, f }) => console.log(`  • ${label}\n    ${f}`));
}

main().catch(e => {
  console.error("Erreur:", e.message);
  process.exit(1);
});
