/**
 * Script pour attribuer l'accès VIP admin au compte Sandot1245.
 * Usage : node scripts/set-admin.mjs
 */
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL non défini dans .env");
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);

// Vérifier si le compte existe
const [rows] = await conn.execute(
  "SELECT id, pseudo, email, isAdmin FROM game_profiles WHERE pseudo = ?",
  ["Sandot1245"]
);

if (rows.length === 0) {
  console.log("⚠️  Compte Sandot1245 non trouvé en base de données.");
  console.log("   Créez d'abord le compte via l'interface du jeu, puis relancez ce script.");
} else {
  const profile = rows[0];
  console.log(`✅ Compte trouvé : ID=${profile.id}, pseudo=${profile.pseudo}, email=${profile.email}`);
  
  if (profile.isAdmin) {
    console.log("ℹ️  Ce compte a déjà l'accès VIP admin.");
  } else {
    await conn.execute(
      "UPDATE game_profiles SET isAdmin = 1 WHERE pseudo = ?",
      ["Sandot1245"]
    );
    console.log("🎉 Accès VIP admin attribué avec succès à Sandot1245 !");
    console.log("   Tous les skins et la limite illimitée de cartes sont maintenant actifs.");
  }
}

await conn.end();
