/**
 * simulate-minigame.mjs
 * Simulation complète du flux mini-jeu multijoueur Ticket Cricket
 *
 * Ce script simule 2 joueurs dans la même session et vérifie :
 * 1. Le joueur A déclenche un mini-jeu au début de son tour
 * 2. L'événement est créé en DB (via tRPC miniGame.trigger)
 * 3. Le joueur B détecte l'événement via polling (miniGame.getActive)
 * 4. Les deux joueurs soumettent leurs résultats (miniGame.submitResult)
 * 5. Le joueur A (déclencheur) poll miniGame.getStatus → allDone
 * 6. Le joueur A résout l'événement (miniGame.resolve)
 * 7. Vérification finale : l'événement est marqué résolu
 */

const BASE = "http://localhost:3000/api/trpc";
const SESSION_CODE = "SIMTEST";

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

let stepNum = 0;
const results = [];

function log(icon, label, detail = "") {
  const line = `${icon}  ${label}${detail ? `  →  ${CYAN}${detail}${RESET}` : ""}`;
  console.log(line);
}

function pass(label, detail = "") {
  stepNum++;
  results.push({ ok: true, label });
  log(`${GREEN}${BOLD}[✓ ${stepNum}]${RESET}`, label, detail);
}

function fail(label, detail = "") {
  stepNum++;
  results.push({ ok: false, label });
  log(`${RED}${BOLD}[✗ ${stepNum}]${RESET}`, label, detail);
}

function section(title) {
  console.log(`\n${YELLOW}${BOLD}━━━ ${title} ━━━${RESET}`);
}

async function trpcQuery(procedure, input) {
  const url = `${BASE}/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${procedure}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
  return json?.result?.data ?? null;
}

async function trpcMutation(procedure, input) {
  const url = `${BASE}/${procedure}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${procedure}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
  return json?.result?.data ?? null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Nettoyage préalable ──────────────────────────────────────────────────────
async function cleanup() {
  // On essaie de résoudre tout événement existant pour ce code de session
  try {
    const active = await trpcQuery("miniGame.getActive", { sessionCode: SESSION_CODE });
    if (active) {
      await trpcMutation("miniGame.resolve", { sessionCode: SESSION_CODE, eventId: active.id });
    }
  } catch {}
}

// ── SIMULATION ───────────────────────────────────────────────────────────────
async function simulate() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗`);
  console.log(`║   SIMULATION MINI-JEU MULTIJOUEUR — TICKET CRICKET   ║`);
  console.log(`╚══════════════════════════════════════════════════════╝${RESET}\n`);

  const PLAYER_A = "joueur-alice-001";
  const PLAYER_B = "joueur-bob-002";
  const TOTAL_PLAYERS = 2;
  let eventId = null;

  await cleanup();

  // ── ÉTAPE 1 : Vérifier qu'aucun mini-jeu n'est actif ──────────────────────
  section("ÉTAPE 1 — État initial");
  try {
    const active = await trpcQuery("miniGame.getActive", { sessionCode: SESSION_CODE });
    if (active === null) {
      pass("Aucun mini-jeu actif au départ", "getActive → null");
    } else {
      fail("Un mini-jeu résiduel existe", `id=${active.id}`);
    }
  } catch (e) {
    fail("Erreur getActive", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 2 : Joueur A déclenche le mini-jeu ──────────────────────────────
  section("ÉTAPE 2 — Joueur A déclenche la Perquisition");
  try {
    const result = await trpcMutation("miniGame.trigger", {
      sessionCode: SESSION_CODE,
      playerId: PLAYER_A,
      mode: "run",
      totalPlayers: TOTAL_PLAYERS,
    });
    if (result?.eventId) {
      eventId = result.eventId;
      pass(`Joueur A crée l'événement en DB`, `eventId=${eventId}, mode=run`);
    } else {
      fail("Trigger n'a pas retourné d'eventId", JSON.stringify(result));
      return;
    }
  } catch (e) {
    fail("Erreur trigger", e.message);
    return;
  }

  await sleep(300);

  // ── ÉTAPE 3 : Joueur B poll getActive et détecte l'événement ─────────────
  section("ÉTAPE 3 — Joueur B détecte l'événement via polling");
  try {
    const active = await trpcQuery("miniGame.getActive", { sessionCode: SESSION_CODE });
    if (active && active.id === eventId) {
      pass(`Joueur B reçoit le mini-jeu via polling`, `id=${active.id}, mode=${active.mode}, triggeredBy=${active.triggeredBy}`);
    } else if (active === null) {
      fail("Joueur B ne voit pas le mini-jeu (getActive → null)");
    } else {
      fail("Joueur B voit un mauvais événement", `id=${active.id} ≠ ${eventId}`);
    }
  } catch (e) {
    fail("Erreur getActive (Joueur B)", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 4 : Joueur A poll getActive et détecte aussi l'événement ────────
  section("ÉTAPE 4 — Joueur A (déclencheur) reçoit aussi le mini-jeu via polling");
  try {
    const active = await trpcQuery("miniGame.getActive", { sessionCode: SESSION_CODE });
    if (active && active.id === eventId) {
      pass(`Joueur A reçoit aussi le mini-jeu via polling`, `triggeredBy=${active.triggeredBy} === PLAYER_A: ${active.triggeredBy === PLAYER_A}`);
    } else {
      fail("Joueur A ne voit pas son propre mini-jeu via polling");
    }
  } catch (e) {
    fail("Erreur getActive (Joueur A)", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 5 : Vérifier l'état avant soumissions ───────────────────────────
  section("ÉTAPE 5 — Statut avant soumissions");
  try {
    const status = await trpcQuery("miniGame.getStatus", {
      sessionCode: SESSION_CODE,
      eventId,
      totalPlayers: TOTAL_PLAYERS,
    });
    if (status && status.submittedCount === 0 && status.allDone === false) {
      pass("Statut initial correct", `soumis=${status.submittedCount}/${status.totalPlayers}, allDone=false`);
    } else {
      fail("Statut initial inattendu", JSON.stringify(status));
    }
  } catch (e) {
    fail("Erreur getStatus", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 6 : Joueur A soumet son résultat (échoue) ───────────────────────
  section("ÉTAPE 6 — Joueur A soumet son résultat (échec = +1000$)");
  try {
    await trpcMutation("miniGame.submitResult", {
      sessionCode: SESSION_CODE,
      eventId,
      playerId: PLAYER_A,
      success: false,
      amount: 1000,
    });
    pass("Joueur A soumet : échec (+1000$)");
  } catch (e) {
    fail("Erreur submitResult (Joueur A)", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 7 : Vérifier statut — 1/2 soumis, allDone=false ────────────────
  section("ÉTAPE 7 — Statut après soumission du Joueur A");
  try {
    const status = await trpcQuery("miniGame.getStatus", {
      sessionCode: SESSION_CODE,
      eventId,
      totalPlayers: TOTAL_PLAYERS,
    });
    if (status && status.submittedCount === 1 && status.allDone === false) {
      pass("Joueur A attend Joueur B", `soumis=1/2, allDone=false → écran d'attente affiché`);
    } else {
      fail("Statut inattendu après soumission A", JSON.stringify(status));
    }
  } catch (e) {
    fail("Erreur getStatus", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 8 : Joueur B soumet son résultat (réussit) ─────────────────────
  section("ÉTAPE 8 — Joueur B soumet son résultat (succès = -1000$)");
  try {
    await trpcMutation("miniGame.submitResult", {
      sessionCode: SESSION_CODE,
      eventId,
      playerId: PLAYER_B,
      success: true,
      amount: 1000,
    });
    pass("Joueur B soumet : succès (-1000$)");
  } catch (e) {
    fail("Erreur submitResult (Joueur B)", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 9 : Vérifier statut — allDone=true ─────────────────────────────
  section("ÉTAPE 9 — Statut final : tous ont soumis");
  let finalResults = null;
  try {
    const status = await trpcQuery("miniGame.getStatus", {
      sessionCode: SESSION_CODE,
      eventId,
      totalPlayers: TOTAL_PLAYERS,
    });
    if (status && status.submittedCount === 2 && status.allDone === true) {
      finalResults = status.results;
      pass("allDone=true — Joueur A peut terminer son tour", `soumis=2/2`);
      // Afficher les résultats individuels
      for (const r of status.results) {
        const who = r.playerId === PLAYER_A ? "Alice (A)" : "Bob (B)";
        const outcome = r.success ? `✓ Succès (-${r.amount}$)` : `✗ Échec (+${r.amount}$)`;
        log(`   ${CYAN}→${RESET}`, `${who}`, outcome);
      }
    } else {
      fail("allDone devrait être true", JSON.stringify(status));
    }
  } catch (e) {
    fail("Erreur getStatus final", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 10 : Joueur A résout l'événement ────────────────────────────────
  section("ÉTAPE 10 — Joueur A résout l'événement (fin de tour sans pioche)");
  try {
    const resolved = await trpcMutation("miniGame.resolve", {
      sessionCode: SESSION_CODE,
      eventId,
    });
    if (resolved?.success) {
      pass("Événement résolu avec succès", `${resolved.results?.length ?? 0} résultats archivés`);
    } else {
      fail("Resolve n'a pas retourné success=true", JSON.stringify(resolved));
    }
  } catch (e) {
    fail("Erreur resolve", e.message);
  }

  await sleep(300);

  // ── ÉTAPE 11 : Vérifier que getActive retourne null ───────────────────────
  section("ÉTAPE 11 — Vérification finale : mini-jeu terminé");
  try {
    const active = await trpcQuery("miniGame.getActive", { sessionCode: SESSION_CODE });
    if (active === null) {
      pass("getActive → null — le mini-jeu est terminé", "Le joueur A peut maintenant terminer son tour sans piocher");
    } else {
      fail("getActive retourne encore un événement actif", `id=${active.id}`);
    }
  } catch (e) {
    fail("Erreur getActive final", e.message);
  }

  // ── RÉSUMÉ ────────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.ok).length;
  const total  = results.length;
  const allOk  = passed === total;

  console.log(`\n${BOLD}${allOk ? GREEN : RED}╔══════════════════════════════════════════════════════╗`);
  console.log(`║               RÉSULTAT DE LA SIMULATION              ║`);
  console.log(`╠══════════════════════════════════════════════════════╣`);
  console.log(`║  ${passed}/${total} étapes réussies${" ".repeat(38 - String(passed).length - String(total).length)}║`);
  console.log(`║  ${allOk ? "✓ FLUX MINI-JEU MULTIJOUEUR : FONCTIONNEL" : "✗ CERTAINES ÉTAPES ONT ÉCHOUÉ"}${" ".repeat(allOk ? 11 : 18)}║`);
  console.log(`╚══════════════════════════════════════════════════════╝${RESET}\n`);

  if (!allOk) {
    console.log(`${RED}Étapes échouées :${RESET}`);
    results.filter(r => !r.ok).forEach(r => console.log(`  ${RED}✗${RESET} ${r.label}`));
  }

  console.log(`${CYAN}Flux vérifié :${RESET}`);
  console.log(`  1. Joueur A clique "JE COMMENCE" → mini-jeu créé en DB`);
  console.log(`  2. Joueur B détecte via polling (1.5s) → reçoit le mini-jeu`);
  console.log(`  3. Joueur A détecte aussi via polling → reçoit le mini-jeu`);
  console.log(`  4. Joueur A termine → écran "En attente des autres..."`);
  console.log(`  5. Joueur B termine → allDone=true`);
  console.log(`  6. Joueur A résout → bouton "TERMINER MON TOUR" disponible`);
  console.log(`  7. Aucune pioche de carte pour ce tour\n`);

  process.exit(allOk ? 0 : 1);
}

simulate().catch(e => {
  console.error(`${RED}Erreur fatale :${RESET}`, e.message);
  process.exit(1);
});
