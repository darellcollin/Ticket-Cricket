/**
 * ══════════════════════════════════════════════════════════════════════
 *  CONFIGURATION DES CARTES — TICKET CRICKET 2026
 *  ⚠️  SOURCE UNIQUE DE VÉRITÉ — DONNÉES PERMANENTES DANS LE CODE
 *  Ne pas modifier manuellement : utiliser le format de saisie ci-dessous.
 * ══════════════════════════════════════════════════════════════════════
 *
 *  FORMAT DE SAISIE (par numéro de carte) :
 *    { category, cardType, ticketPrice, frais?, impots?, taxe?, note? }
 *
 *  TYPES DE CARTES :
 *  ┌─────┬──────────────────────────────────────────────────────────────┐
 *  │ T1  │ Ticket + Frais (opt) → AJOUTÉS à la dette du joueur qui pioche│
 *  │ T2  │ Impôts (opt) → RÉDUIT la dette du joueur qui pioche          │
 *  │ T3  │ Ticket → AJOUTÉ au joueur SUIVANT │ Taxe → réduit le piocheur│
 *  └─────┴──────────────────────────────────────────────────────────────┘
 *
 *  CATÉGORIES :
 *    "contravention" | "contribuable" | "investisseur"
 *
 *  NUMÉROTATION :
 *    1–63   : Investisseurs (T3)
 *    64–116 : Contribuables (T2)
 *    117–324: Contraventions (T1)
 */

export type CardCategory = "contravention" | "contribuable" | "investisseur";
export type CardTypeNum  = 1 | 2 | 3;

export interface CardConfig {
  id:           number;
  category:     CardCategory;
  cardType:     CardTypeNum;
  /** Type 1 : ticket du piocheur. Type 3 : ticket transféré au suivant. Type 2 : ignoré. */
  ticketPrice:  number;
  /** Type 1 uniquement : frais additionnels, ajoutés à la dette du piocheur. */
  frais?:       number;
  /** Type 2 uniquement : réduction soustraite de la dette du piocheur. */
  impots?:      number;
  /** Type 3 uniquement : réduction soustraite de la dette du piocheur. */
  taxe?:        number;
  note?:        string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TABLE STATIQUE DES 324 CARTES
// ─────────────────────────────────────────────────────────────────────────────

type RawEntry = Omit<CardConfig, "id">;

const CARD_DATA: Record<number, RawEntry> = {
  // ── INVESTISSEURS (cartes 1–63) ──────────────────────────────────────────
  1: { category:"investisseur", cardType:3, ticketPrice:10, taxe:0  },
  2: { category:"investisseur", cardType:3, ticketPrice:10, taxe:10  },
  3: { category:"investisseur", cardType:3, ticketPrice:10, taxe:20  },
  4: { category:"investisseur", cardType:3, ticketPrice:10, taxe:30  },
  5: { category:"investisseur", cardType:3, ticketPrice:10, taxe:40  },
  6: { category:"investisseur", cardType:3, ticketPrice:10, taxe:50  },
  7: { category:"investisseur", cardType:3, ticketPrice:20, taxe:0  },
  8: { category:"investisseur", cardType:3, ticketPrice:20, taxe:10  },
  9: { category:"investisseur", cardType:3, ticketPrice:20, taxe:20  },
  10: { category:"investisseur", cardType:3, ticketPrice:20, taxe:30  },
  11: { category:"investisseur", cardType:3, ticketPrice:20, taxe:40  },
  12: { category:"investisseur", cardType:3, ticketPrice:20, taxe:50  },
  13: { category:"investisseur", cardType:3, ticketPrice:30, taxe:0  },
  14: { category:"investisseur", cardType:3, ticketPrice:30, taxe:10  },
  15: { category:"investisseur", cardType:3, ticketPrice:30, taxe:20  },
  16: { category:"investisseur", cardType:3, ticketPrice:30, taxe:30  },
  17: { category:"investisseur", cardType:3, ticketPrice:30, taxe:40  },
  18: { category:"investisseur", cardType:3, ticketPrice:30, taxe:50  },
  19: { category:"investisseur", cardType:3, ticketPrice:40, taxe:0  },
  20: { category:"investisseur", cardType:3, ticketPrice:40, taxe:10  },
  21: { category:"investisseur", cardType:3, ticketPrice:40, taxe:20  },
  22: { category:"investisseur", cardType:3, ticketPrice:40, taxe:30  },
  23: { category:"investisseur", cardType:3, ticketPrice:40, taxe:40  },
  24: { category:"investisseur", cardType:3, ticketPrice:40, taxe:50  },
  25: { category:"investisseur", cardType:3, ticketPrice:50, taxe:0  },
  26: { category:"investisseur", cardType:3, ticketPrice:50, taxe:10  },
  27: { category:"investisseur", cardType:3, ticketPrice:50, taxe:20  },
  28: { category:"investisseur", cardType:3, ticketPrice:50, taxe:30  },
  29: { category:"investisseur", cardType:3, ticketPrice:50, taxe:40  },
  30: { category:"investisseur", cardType:3, ticketPrice:50, taxe:50  },
  31: { category:"investisseur", cardType:3, ticketPrice:100, taxe:0  },
  32: { category:"investisseur", cardType:3, ticketPrice:100, taxe:10  },
  33: { category:"investisseur", cardType:3, ticketPrice:100, taxe:20  },
  34: { category:"investisseur", cardType:3, ticketPrice:100, taxe:30  },
  35: { category:"investisseur", cardType:3, ticketPrice:100, taxe:40  },
  36: { category:"investisseur", cardType:3, ticketPrice:100, taxe:50  },
  37: { category:"investisseur", cardType:3, ticketPrice:200, taxe:0  },
  38: { category:"investisseur", cardType:3, ticketPrice:200, taxe:10  },
  39: { category:"investisseur", cardType:3, ticketPrice:200, taxe:20  },
  40: { category:"investisseur", cardType:3, ticketPrice:200, taxe:30  },
  41: { category:"investisseur", cardType:3, ticketPrice:200, taxe:40  },
  42: { category:"investisseur", cardType:3, ticketPrice:200, taxe:50  },
  43: { category:"investisseur", cardType:3, ticketPrice:300, taxe:0  },
  44: { category:"investisseur", cardType:3, ticketPrice:300, taxe:10  },
  45: { category:"investisseur", cardType:3, ticketPrice:300, taxe:20  },
  46: { category:"investisseur", cardType:3, ticketPrice:300, taxe:30  },
  47: { category:"investisseur", cardType:3, ticketPrice:300, taxe:40  },
  48: { category:"investisseur", cardType:3, ticketPrice:300, taxe:50  },
  49: { category:"investisseur", cardType:3, ticketPrice:400, taxe:0  },
  50: { category:"investisseur", cardType:3, ticketPrice:400, taxe:10  },
  51: { category:"investisseur", cardType:3, ticketPrice:400, taxe:20  },
  52: { category:"investisseur", cardType:3, ticketPrice:400, taxe:30  },
  53: { category:"investisseur", cardType:3, ticketPrice:400, taxe:40  },
  54: { category:"investisseur", cardType:3, ticketPrice:400, taxe:50  },
  55: { category:"investisseur", cardType:3, ticketPrice:500, taxe:0  },
  56: { category:"investisseur", cardType:3, ticketPrice:600, taxe:0  },
  57: { category:"investisseur", cardType:3, ticketPrice:700, taxe:0  },
  58: { category:"investisseur", cardType:3, ticketPrice:800, taxe:0  },
  59: { category:"investisseur", cardType:3, ticketPrice:900, taxe:0  },
  60: { category:"investisseur", cardType:3, ticketPrice:1000, taxe:0  },
  61: { category:"investisseur", cardType:3, ticketPrice:2000, taxe:0  },
  62: { category:"investisseur", cardType:3, ticketPrice:3000, taxe:0  },
  63: { category:"investisseur", cardType:3, ticketPrice:4000, taxe:0  },
  // ── CONTRIBUABLES (cartes 64–116) ───────────────────────────────────────
  64:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  65:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  66:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  67:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  68:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  69:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  70:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  71:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  72:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  73:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  74:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  75:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  76:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  77:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  78:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:0  },
  79:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  80:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  81:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  82:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  83:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  84:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  85:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  86:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  87:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  88:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:10  },
  89:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  90:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  91:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  92:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  93:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  94:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  95:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  96:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  97:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  98:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:20  },
  99:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  100:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  101:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  102:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  103:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  104:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  105:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  106:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:30  },
  107:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  108:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  109:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  110:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  111:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  112:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:40  },
  113:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:50  },
  114:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:50  },
  115:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:50  },
  116:{ category:"contribuable",  cardType:2, ticketPrice:0, impots:50  },
  // ── CONTRAVENTIONS (cartes 117–324) ─────────────────────────────────────
  117:{ category:"contravention", cardType:1, ticketPrice:10, frais:0  },
  118:{ category:"contravention", cardType:1, ticketPrice:10, frais:0  },
  119:{ category:"contravention", cardType:1, ticketPrice:10, frais:0  },
  120:{ category:"contravention", cardType:1, ticketPrice:10, frais:10  },
  121:{ category:"contravention", cardType:1, ticketPrice:10, frais:20  },
  122:{ category:"contravention", cardType:1, ticketPrice:10, frais:30  },
  123:{ category:"contravention", cardType:1, ticketPrice:10, frais:40  },
  124:{ category:"contravention", cardType:1, ticketPrice:10, frais:50  },
  125:{ category:"contravention", cardType:1, ticketPrice:20, frais:0  },
  126:{ category:"contravention", cardType:1, ticketPrice:20, frais:0  },
  127:{ category:"contravention", cardType:1, ticketPrice:20, frais:0  },
  128:{ category:"contravention", cardType:1, ticketPrice:20, frais:10  },
  129:{ category:"contravention", cardType:1, ticketPrice:20, frais:20  },
  130:{ category:"contravention", cardType:1, ticketPrice:20, frais:30  },
  131:{ category:"contravention", cardType:1, ticketPrice:20, frais:40  },
  132:{ category:"contravention", cardType:1, ticketPrice:20, frais:50  },
  133:{ category:"contravention", cardType:1, ticketPrice:30, frais:0  },
  134:{ category:"contravention", cardType:1, ticketPrice:30, frais:0  },
  135:{ category:"contravention", cardType:1, ticketPrice:30, frais:0  },
  136:{ category:"contravention", cardType:1, ticketPrice:30, frais:10  },
  137:{ category:"contravention", cardType:1, ticketPrice:30, frais:20  },
  138:{ category:"contravention", cardType:1, ticketPrice:30, frais:30  },
  139:{ category:"contravention", cardType:1, ticketPrice:30, frais:40  },
  140:{ category:"contravention", cardType:1, ticketPrice:30, frais:50  },
  141:{ category:"contravention", cardType:1, ticketPrice:40, frais:0  },
  142:{ category:"contravention", cardType:1, ticketPrice:40, frais:0  },
  143:{ category:"contravention", cardType:1, ticketPrice:40, frais:0  },
  144:{ category:"contravention", cardType:1, ticketPrice:40, frais:10  },
  145:{ category:"contravention", cardType:1, ticketPrice:40, frais:20  },
  146:{ category:"contravention", cardType:1, ticketPrice:40, frais:30  },
  147:{ category:"contravention", cardType:1, ticketPrice:40, frais:40  },
  148:{ category:"contravention", cardType:1, ticketPrice:40, frais:50  },
  149:{ category:"contravention", cardType:1, ticketPrice:50, frais:0  },
  150:{ category:"contravention", cardType:1, ticketPrice:50, frais:0  },
  151:{ category:"contravention", cardType:1, ticketPrice:50, frais:0  },
  152:{ category:"contravention", cardType:1, ticketPrice:50, frais:10  },
  153:{ category:"contravention", cardType:1, ticketPrice:50, frais:20  },
  154:{ category:"contravention", cardType:1, ticketPrice:50, frais:30  },
  155:{ category:"contravention", cardType:1, ticketPrice:50, frais:40  },
  156:{ category:"contravention", cardType:1, ticketPrice:50, frais:50  },
  157:{ category:"contravention", cardType:1, ticketPrice:100, frais:0  },
  158:{ category:"contravention", cardType:1, ticketPrice:100, frais:0  },
  159:{ category:"contravention", cardType:1, ticketPrice:100, frais:0  },
  160:{ category:"contravention", cardType:1, ticketPrice:100, frais:10  },
  161:{ category:"contravention", cardType:1, ticketPrice:100, frais:20  },
  162:{ category:"contravention", cardType:1, ticketPrice:100, frais:30  },
  163:{ category:"contravention", cardType:1, ticketPrice:100, frais:40  },
  164:{ category:"contravention", cardType:1, ticketPrice:100, frais:50  },
  165:{ category:"contravention", cardType:1, ticketPrice:150, frais:0  },
  166:{ category:"contravention", cardType:1, ticketPrice:150, frais:0  },
  167:{ category:"contravention", cardType:1, ticketPrice:150, frais:0  },
  168:{ category:"contravention", cardType:1, ticketPrice:150, frais:10  },
  169:{ category:"contravention", cardType:1, ticketPrice:150, frais:20  },
  170:{ category:"contravention", cardType:1, ticketPrice:150, frais:30  },
  171:{ category:"contravention", cardType:1, ticketPrice:150, frais:40  },
  172:{ category:"contravention", cardType:1, ticketPrice:150, frais:50  },
  173:{ category:"contravention", cardType:1, ticketPrice:200, frais:0  },
  174:{ category:"contravention", cardType:1, ticketPrice:200, frais:0  },
  175:{ category:"contravention", cardType:1, ticketPrice:200, frais:0  },
  176:{ category:"contravention", cardType:1, ticketPrice:200, frais:10  },
  177:{ category:"contravention", cardType:1, ticketPrice:200, frais:20  },
  178:{ category:"contravention", cardType:1, ticketPrice:200, frais:30  },
  179:{ category:"contravention", cardType:1, ticketPrice:200, frais:40  },
  180:{ category:"contravention", cardType:1, ticketPrice:200, frais:50  },
  181:{ category:"contravention", cardType:1, ticketPrice:250, frais:0  },
  182:{ category:"contravention", cardType:1, ticketPrice:250, frais:0  },
  183:{ category:"contravention", cardType:1, ticketPrice:250, frais:0  },
  184:{ category:"contravention", cardType:1, ticketPrice:250, frais:10  },
  185:{ category:"contravention", cardType:1, ticketPrice:250, frais:20  },
  186:{ category:"contravention", cardType:1, ticketPrice:250, frais:30  },
  187:{ category:"contravention", cardType:1, ticketPrice:250, frais:40  },
  188:{ category:"contravention", cardType:1, ticketPrice:250, frais:50  },
  189:{ category:"contravention", cardType:1, ticketPrice:300, frais:0  },
  190:{ category:"contravention", cardType:1, ticketPrice:300, frais:0  },
  191:{ category:"contravention", cardType:1, ticketPrice:300, frais:0  },
  192:{ category:"contravention", cardType:1, ticketPrice:300, frais:10  },
  193:{ category:"contravention", cardType:1, ticketPrice:300, frais:20  },
  194:{ category:"contravention", cardType:1, ticketPrice:300, frais:30  },
  195:{ category:"contravention", cardType:1, ticketPrice:300, frais:40  },
  196:{ category:"contravention", cardType:1, ticketPrice:300, frais:50  },
  197:{ category:"contravention", cardType:1, ticketPrice:350, frais:0  },
  198:{ category:"contravention", cardType:1, ticketPrice:350, frais:0  },
  199:{ category:"contravention", cardType:1, ticketPrice:350, frais:0  },
  200:{ category:"contravention", cardType:1, ticketPrice:350, frais:10  },
  201:{ category:"contravention", cardType:1, ticketPrice:350, frais:20  },
  202:{ category:"contravention", cardType:1, ticketPrice:350, frais:30  },
  203:{ category:"contravention", cardType:1, ticketPrice:350, frais:40  },
  204:{ category:"contravention", cardType:1, ticketPrice:350, frais:50  },
  205:{ category:"contravention", cardType:1, ticketPrice:400, frais:0  },
  206:{ category:"contravention", cardType:1, ticketPrice:400, frais:0  },
  207:{ category:"contravention", cardType:1, ticketPrice:400, frais:0  },
  208:{ category:"contravention", cardType:1, ticketPrice:400, frais:10  },
  209:{ category:"contravention", cardType:1, ticketPrice:400, frais:20  },
  210:{ category:"contravention", cardType:1, ticketPrice:400, frais:30  },
  211:{ category:"contravention", cardType:1, ticketPrice:400, frais:40  },
  212:{ category:"contravention", cardType:1, ticketPrice:400, frais:50  },
  213:{ category:"contravention", cardType:1, ticketPrice:450, frais:0  },
  214:{ category:"contravention", cardType:1, ticketPrice:450, frais:0  },
  215:{ category:"contravention", cardType:1, ticketPrice:450, frais:0  },
  216:{ category:"contravention", cardType:1, ticketPrice:450, frais:10  },
  217:{ category:"contravention", cardType:1, ticketPrice:450, frais:20  },
  218:{ category:"contravention", cardType:1, ticketPrice:450, frais:30  },
  219:{ category:"contravention", cardType:1, ticketPrice:450, frais:40  },
  220:{ category:"contravention", cardType:1, ticketPrice:450, frais:50  },
  221:{ category:"contravention", cardType:1, ticketPrice:500, frais:0  },
  222:{ category:"contravention", cardType:1, ticketPrice:500, frais:0  },
  223:{ category:"contravention", cardType:1, ticketPrice:500, frais:0  },
  224:{ category:"contravention", cardType:1, ticketPrice:500, frais:10  },
  225:{ category:"contravention", cardType:1, ticketPrice:500, frais:20  },
  226:{ category:"contravention", cardType:1, ticketPrice:500, frais:30  },
  227:{ category:"contravention", cardType:1, ticketPrice:500, frais:40  },
  228:{ category:"contravention", cardType:1, ticketPrice:500, frais:50  },
  229:{ category:"contravention", cardType:1, ticketPrice:550, frais:0  },
  230:{ category:"contravention", cardType:1, ticketPrice:550, frais:10  },
  231:{ category:"contravention", cardType:1, ticketPrice:550, frais:20  },
  232:{ category:"contravention", cardType:1, ticketPrice:550, frais:30  },
  233:{ category:"contravention", cardType:1, ticketPrice:550, frais:40  },
  234:{ category:"contravention", cardType:1, ticketPrice:550, frais:50  },
  235:{ category:"contravention", cardType:1, ticketPrice:600, frais:0  },
  236:{ category:"contravention", cardType:1, ticketPrice:600, frais:10  },
  237:{ category:"contravention", cardType:1, ticketPrice:600, frais:20  },
  238:{ category:"contravention", cardType:1, ticketPrice:600, frais:30  },
  239:{ category:"contravention", cardType:1, ticketPrice:600, frais:40  },
  240:{ category:"contravention", cardType:1, ticketPrice:600, frais:50  },
  241:{ category:"contravention", cardType:1, ticketPrice:650, frais:0  },
  242:{ category:"contravention", cardType:1, ticketPrice:650, frais:10  },
  243:{ category:"contravention", cardType:1, ticketPrice:650, frais:20  },
  244:{ category:"contravention", cardType:1, ticketPrice:650, frais:30  },
  245:{ category:"contravention", cardType:1, ticketPrice:650, frais:40  },
  246:{ category:"contravention", cardType:1, ticketPrice:650, frais:50  },
  247:{ category:"contravention", cardType:1, ticketPrice:700, frais:0  },
  248:{ category:"contravention", cardType:1, ticketPrice:700, frais:10  },
  249:{ category:"contravention", cardType:1, ticketPrice:700, frais:20  },
  250:{ category:"contravention", cardType:1, ticketPrice:700, frais:30  },
  251:{ category:"contravention", cardType:1, ticketPrice:700, frais:40  },
  252:{ category:"contravention", cardType:1, ticketPrice:700, frais:50  },
  253:{ category:"contravention", cardType:1, ticketPrice:750, frais:0  },
  254:{ category:"contravention", cardType:1, ticketPrice:750, frais:10  },
  255:{ category:"contravention", cardType:1, ticketPrice:750, frais:20  },
  256:{ category:"contravention", cardType:1, ticketPrice:750, frais:30  },
  257:{ category:"contravention", cardType:1, ticketPrice:750, frais:40  },
  258:{ category:"contravention", cardType:1, ticketPrice:750, frais:50  },
  259:{ category:"contravention", cardType:1, ticketPrice:800, frais:0  },
  260:{ category:"contravention", cardType:1, ticketPrice:800, frais:10  },
  261:{ category:"contravention", cardType:1, ticketPrice:800, frais:20  },
  262:{ category:"contravention", cardType:1, ticketPrice:800, frais:30  },
  263:{ category:"contravention", cardType:1, ticketPrice:800, frais:40  },
  264:{ category:"contravention", cardType:1, ticketPrice:800, frais:50  },
  265:{ category:"contravention", cardType:1, ticketPrice:850, frais:0  },
  266:{ category:"contravention", cardType:1, ticketPrice:850, frais:10  },
  267:{ category:"contravention", cardType:1, ticketPrice:850, frais:20  },
  268:{ category:"contravention", cardType:1, ticketPrice:850, frais:30  },
  269:{ category:"contravention", cardType:1, ticketPrice:850, frais:40  },
  270:{ category:"contravention", cardType:1, ticketPrice:850, frais:50  },
  271:{ category:"contravention", cardType:1, ticketPrice:900, frais:0  },
  272:{ category:"contravention", cardType:1, ticketPrice:900, frais:10  },
  273:{ category:"contravention", cardType:1, ticketPrice:900, frais:20  },
  274:{ category:"contravention", cardType:1, ticketPrice:900, frais:30  },
  275:{ category:"contravention", cardType:1, ticketPrice:900, frais:40  },
  276:{ category:"contravention", cardType:1, ticketPrice:900, frais:50  },
  277:{ category:"contravention", cardType:1, ticketPrice:950, frais:0  },
  278:{ category:"contravention", cardType:1, ticketPrice:950, frais:10  },
  279:{ category:"contravention", cardType:1, ticketPrice:950, frais:20  },
  280:{ category:"contravention", cardType:1, ticketPrice:950, frais:30  },
  281:{ category:"contravention", cardType:1, ticketPrice:950, frais:40  },
  282:{ category:"contravention", cardType:1, ticketPrice:950, frais:50  },
  283:{ category:"contravention", cardType:1, ticketPrice:1000, frais:0  },
  284:{ category:"contravention", cardType:1, ticketPrice:1000, frais:10  },
  285:{ category:"contravention", cardType:1, ticketPrice:1000, frais:20  },
  286:{ category:"contravention", cardType:1, ticketPrice:1000, frais:30  },
  287:{ category:"contravention", cardType:1, ticketPrice:1000, frais:40  },
  288:{ category:"contravention", cardType:1, ticketPrice:1000, frais:50  },
  289:{ category:"contravention", cardType:1, ticketPrice:1500, frais:0  },
  290:{ category:"contravention", cardType:1, ticketPrice:1500, frais:10  },
  291:{ category:"contravention", cardType:1, ticketPrice:1500, frais:20  },
  292:{ category:"contravention", cardType:1, ticketPrice:1500, frais:30  },
  293:{ category:"contravention", cardType:1, ticketPrice:1500, frais:40  },
  294:{ category:"contravention", cardType:1, ticketPrice:1500, frais:50  },
  295:{ category:"contravention", cardType:1, ticketPrice:2000, frais:0  },
  296:{ category:"contravention", cardType:1, ticketPrice:2000, frais:10  },
  297:{ category:"contravention", cardType:1, ticketPrice:2000, frais:20  },
  298:{ category:"contravention", cardType:1, ticketPrice:2000, frais:30  },
  299:{ category:"contravention", cardType:1, ticketPrice:2000, frais:40  },
  300:{ category:"contravention", cardType:1, ticketPrice:2000, frais:50  },
  301:{ category:"contravention", cardType:1, ticketPrice:2500, frais:0  },
  302:{ category:"contravention", cardType:1, ticketPrice:2500, frais:10  },
  303:{ category:"contravention", cardType:1, ticketPrice:2500, frais:20  },
  304:{ category:"contravention", cardType:1, ticketPrice:2500, frais:30  },
  305:{ category:"contravention", cardType:1, ticketPrice:2500, frais:40  },
  306:{ category:"contravention", cardType:1, ticketPrice:2500, frais:50  },
  307:{ category:"contravention", cardType:1, ticketPrice:3000, frais:0  },
  308:{ category:"contravention", cardType:1, ticketPrice:3000, frais:10  },
  309:{ category:"contravention", cardType:1, ticketPrice:3000, frais:20  },
  310:{ category:"contravention", cardType:1, ticketPrice:3000, frais:30  },
  311:{ category:"contravention", cardType:1, ticketPrice:3000, frais:40  },
  312:{ category:"contravention", cardType:1, ticketPrice:3000, frais:50  },
  313:{ category:"contravention", cardType:1, ticketPrice:3500, frais:0  },
  314:{ category:"contravention", cardType:1, ticketPrice:3500, frais:10  },
  315:{ category:"contravention", cardType:1, ticketPrice:3500, frais:20  },
  316:{ category:"contravention", cardType:1, ticketPrice:3500, frais:30  },
  317:{ category:"contravention", cardType:1, ticketPrice:3500, frais:40  },
  318:{ category:"contravention", cardType:1, ticketPrice:3500, frais:50  },
  319:{ category:"contravention", cardType:1, ticketPrice:4000, frais:0  },
  320:{ category:"contravention", cardType:1, ticketPrice:4000, frais:10  },
  321:{ category:"contravention", cardType:1, ticketPrice:4000, frais:20  },
  322:{ category:"contravention", cardType:1, ticketPrice:4000, frais:30  },
  323:{ category:"contravention", cardType:1, ticketPrice:4000, frais:40  },
  324:{ category:"contravention", cardType:1, ticketPrice:4000, frais:50  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  DEFAULTS PAR PLAGE (si une carte n'est pas encore dans CARD_DATA)
// ─────────────────────────────────────────────────────────────────────────────

export function defaultCategory(id: number): CardCategory {
  if (id <= 63)  return "investisseur";
  if (id <= 116) return "contribuable";
  return "contravention";
}

const CAT_DEFAULTS: Record<CardCategory, { cardType: CardTypeNum; ticketPrice: number }> = {
  contravention: { cardType: 1, ticketPrice: 150  },
  contribuable:  { cardType: 2, ticketPrice: 0    },
  investisseur:  { cardType: 3, ticketPrice: 5000 },
};

export function getCardConfig(id: number): CardConfig {
  const raw = CARD_DATA[id];
  if (raw) return { id, ...raw };
  // Carte non encore configurée → default basé sur la plage
  const cat = defaultCategory(id);
  const def = CAT_DEFAULTS[cat];
  return { id, category: cat, cardType: def.cardType, ticketPrice: def.ticketPrice };
}

export function isCardConfigured(id: number): boolean {
  return id in CARD_DATA;
}

export function getConfiguredCount(): number {
  return Object.keys(CARD_DATA).length;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CALCULS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Montant net pour le joueur qui PIOCHE la carte :
 *   T1 → +(ticketPrice + frais)
 *   T2 → -(impots)
 *   T3 → -(taxe)  [le joueur reçoit une réduction via la taxe, pas d'addition]
 */
export function drawerNetAmount(cfg: CardConfig): number {
  switch (cfg.cardType) {
    case 1: return (cfg.ticketPrice ?? 0) + (cfg.frais  ?? 0);
    case 2: return -(cfg.impots ?? 0);
    case 3: return -(cfg.taxe   ?? 0);
    default: return 0;
  }
}

/**
 * Montant total envoyé en dette au joueur SUIVANT (T3 uniquement).
 * = ticketPrice + taxe  (les deux montants s'additionnent et sont transférés)
 */
export function nextPlayerAmount(cfg: CardConfig): number {
  return cfg.cardType === 3 ? (cfg.ticketPrice ?? 0) + (cfg.taxe ?? 0) : 0;
}

/**
 * Total net cumulé des cartes piochées par un joueur (sa propre dette).
 */
export function computePlayerTotal(cardIds: number[]): number {
  return cardIds.reduce((sum, id) => sum + drawerNetAmount(getCardConfig(id)), 0);
}

// ───────────────────────────────────────────────────────────────────────────
//  INFOS VISUELLES
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_INFO: Record<CardCategory, {
  label: string; emoji: string; color: string; border: string;
  badge: string; badgeColor: string; text: string;
}> = {
  contravention: {
    label: "Contravention", emoji: "🚨",
    color: "#FBBF24", border: "#D97706", badge: "#FEF08A", badgeColor: "#FEF08A", text: "#000",
  },
  contribuable: {
    label: "Contribuable", emoji: "📋",
    color: "#22C55E", border: "#16A34A", badge: "#BBF7D0", badgeColor: "#BBF7D0", text: "#fff",
  },
  investisseur: {
    label: "Investisseur", emoji: "💼",
    color: "#EC4899", border: "#BE185D", badge: "#FBCFE8", badgeColor: "#FBCFE8", text: "#fff",
  },
};

export const TYPE_INFO: Record<CardTypeNum, {
  label: string; shortLabel: string; desc: string; emoji: string; color: string; border: string;
}> = {
  1: {
    label: "Type 1 – Ticket",    shortLabel: "T1",
    desc:  "Ticket + Frais → cumule la dette du joueur",
    emoji: "📈", color: "#DC2626", border: "#991B1B",
  },
  2: {
    label: "Type 2 – Impôt",     shortLabel: "T2",
    desc:  "Réduit la dette du joueur (impôts)",
    emoji: "📉", color: "#16A34A", border: "#14532D",
  },
  3: {
    label: "Type 3 – Transfert", shortLabel: "T3",
    desc:  "Ticket → joueur suivant | Taxe → réduit le piocheur",
    emoji: "➡️", color: "#7C3AED", border: "#4C1D95",
  },
};

export const CATEGORY_ORDER: CardCategory[] = ["contravention", "contribuable", "investisseur"];
export const ALL_CARD_IDS: number[]         = Array.from({ length: 324 }, (_, i) => i + 1);

// ─────────────────────────────────────────────────────────────────────────────
//  FORMATAGE
// ─────────────────────────────────────────────────────────────────────────────

export function formatPrice(amount: number): string {
  const abs = Math.abs(amount);
  const str = abs.toLocaleString("fr-CA", {
    style: "currency", currency: "CAD", maximumFractionDigits: 0,
  });
  return amount < 0 ? `- ${str}` : str;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPATIBILITÉ — fonctions gardées pour ne pas casser les autres fichiers
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Plus utilisé — données dans CARD_DATA (code) */
export function saveCardConfig(_cfg: CardConfig): void {}
/** @deprecated Plus utilisé */
export function saveMultipleConfigs(_cfgs: CardConfig[]): void {}
/** @deprecated Plus utilisé */
export function loadAllConfigs(): Record<number, CardConfig> {
  const out: Record<number, CardConfig> = {};
  ALL_CARD_IDS.forEach((id) => { out[id] = getCardConfig(id); });
  return out;
}
/** @deprecated Plus utilisé */
export function getDefaultConfig(id: number): CardConfig { return getCardConfig(id); }
/** @deprecated Plus utilisé */
export function invalidateConfigCache(): void {}
/** @deprecated Plus utilisé */
export function exportConfigAsJson(): string { return "{}"; }