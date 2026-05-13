# CHAINCACAO — DOCUMENT DE RÉFÉRENCE PROJET

# Traçabilité Blockchain des Filières Café-Cacao au Togo

# Miabé Hackathon 2026 — PROJET T-01 — Phase 3 Finale

# Équipe TG-16 : Shadow Garden — Mai 2026

# ─────────────────────────────────────────────────────────────────────────────

# Ce fichier est la SOURCE DE VÉRITÉ UNIQUE du projet ChainCacao.

# Toute décision de design, technique, architecturale ou éditoriale y est consignée.

# Il doit être lu avant toute nouvelle session de travail par CHAQUE membre.

# Chaque membre l'uploade dans son outil IA pour garantir la cohérence des contributions.

# Dernière mise à jour : 13 Mai 2026 — Session 9 : Dashboard transformateur (ATC Kpalimé)

# ─────────────────────────────────────────────────────────────────────────────

---

## TABLE DES MATIÈRES

**SECTIONS FONDATRICES (communes à toute l'équipe)**
1. Identité du projet
2. Stack technologique figée
3. Identité visuelle
4. Ton éditorial
5. Accessibilité

**SECTIONS ARCHITECTURE (critiques pour l'alignement Web/Mobile)**
6. Architecture globale
7. Schémas blockchain (Smart Contract)
8. Schémas Supabase (Base de données)
9. Contrats API (anti-divergence Web/Mobile)
10. Mode offline-first

**SECTIONS ORGANISATION (gestion d'équipe)**
11. Répartition des responsabilités
12. Structure du monorepo
13. Conventions de code
14. Variables d'environnement

**SECTIONS FONCTIONNELLES (le QUOI)**
15. Les 5 acteurs et leurs interfaces
16. Flux fonctionnel complet
17. Conformité EUDR
18. Génération QR Code et vérification publique

**SECTIONS LIVRABLES (objectifs hackathon)**
19. Périmètre MVP Phase 3
20. Démo live — script du pitch 10 min
21. Roadmap V2 (exclus)
22. Décisions prises et en attente
23. Historique des sessions
24. Contacts équipe

---

## 1. IDENTITÉ DU PROJET

- **Nom du projet** : ChainCacao
- **Slogan** : *"La technologie au service de la terre"*
- **Hackathon** : Miabé Hackathon 2026 (MBH 2026)
- **Organisateur** : Darollo Technologies Corporation (DTC)
- **Code projet** : T-01 (Togo — Domaine D01 Agriculture & Traçabilité)
- **Équipe** : TG-16 — Shadow Garden
- **Phase actuelle** : Phase 3 — Finale (MVP complet à livrer)
- **Pays cible** : Togo (région des Plateaux : Wawa, Akébou, Kloto, Danyi, Amou, Agou)
- **Public cible** : Producteurs, coopératives, transformateurs, exportateurs, importateurs UE, Ministère de l'Agriculture, CCFCC
- **ODD couverts** : ODD 1 (Pauvreté), ODD 2 (Faim zéro), ODD 8 (Travail décent), ODD 12 (Consommation responsable)
- **Dépôt GitHub** : https://github.com/Godwin-creator/chaincacao-monorepo.git
- **URL démo (à venir)** : Vercel — sous-domaine `chaincacao.vercel.app` (à confirmer après déploiement)
- **Langue de l'interface et de la démo** : Français exclusivement

### 1.1 Membres de l'équipe TG-16

| Membre | Rôle | Sous-équipe | Établissement |
|--------|------|-------------|---------------|
| **EDOH BEDI Komi Godwin** | Développeur Web + Architecture | Web | EPL |
| **FOLIKPO-AWUTE Dzogoedzikpe Sophos** | Développeur Web | Web | Lomé Business School |
| **KOUYOM Bikala** | Développeur Mobile | Mobile | ESA |
| **QUENUM Abla Anne-Marie** | Développeuse Mobile | Mobile | IAI Togo  |

### 1.2 Mission de ChainCacao

Permettre à n'importe quel acteur de la filière café-cacao togolaise — de l'agriculteur de Wawa à l'importateur européen — de consulter l'historique complet, immuable et vérifiable d'un lot de café ou de cacao, en conformité totale avec le règlement EUDR 2025 de l'Union Européenne.

### 1.3 Problème central résolu

Sans traçabilité blockchain, le Togo perd l'accès au marché européen (principal débouché) à cause du règlement EUDR. Les producteurs togolais ne perçoivent que 15-25 % de la valeur finale et perdent 30-40 millions USD/an en fraudes sur les pesées. ChainCacao résout simultanément :

1. **Conformité EUDR** : génération automatique des preuves de géolocalisation + non-déforestation
2. **Réduction des fraudes** : chaque pesée enregistrée immuablement sur blockchain
3. **Accès aux marchés premium** : preuves Bio/Fairtrade vérifiables, plus-value de 20 à 40 %

---

## 2. STACK TECHNOLOGIQUE (FIGÉE)

> ⚠️ **Toute introduction de librairie hors de cette liste nécessite une décision explicite consignée dans la section "Décisions" et une mise à jour de ce document.**

### 2.1 Couche Blockchain

| Élément | Technologie | Version | Remarque |
|---------|-------------|---------|----------|
| Réseau testnet | Polygon Amoy | — | Successeur de Mumbai (déprécié 2024). RPC : `https://rpc-amoy.polygon.technology` |
| Réseau prod (V2) | Polygon PoS Mainnet | — | Migration prévue après hackathon |
| Smart Contracts | Solidity | ^0.8.20 | Pas de version inférieure |
| Framework dev | Hardhat | Dernière | Tests + déploiement |
| Bibliothèque | OpenZeppelin Contracts | ^5.0 | ERC-721, AccessControl |
| Standard NFT | ERC-721 | — | Chaque lot = NFT unique non-fongible |
| Wallet | MetaMask + WalletConnect v2 | — | Compatible mobile + desktop |

### 2.2 Couche Web (binôme Komi + Sophos)

| Couche | Technologie | Version | Remarque |
|--------|-------------|---------|----------|
| Framework | React.js | 19.x | Avec Vite 8.x comme bundler |
| Styles | Tailwind CSS | 4.x | Plugin `@tailwindcss/vite` (palette via `@theme {}` dans `index.css`) |
| Animations | Framer Motion | Dernière | Légères uniquement |
| Routing | React Router DOM | 7.x | Navigation entre pages |
| Web3 | ethers.js | v6 | Interaction smart contract |
| Wallet Connect | `@web3modal/wagmi` + `wagmi` + `viem` | Dernière | Connexion wallet multi-provider |
| Cartographie | Leaflet + `react-leaflet` | Dernière | OpenStreetMap (libre, pas de Google Maps) |
| QR Code génération | `qrcode.react` | Dernière | Génération côté client |
| QR Code lecture | `html5-qrcode` | ^2.3.8 | Scan via webcam, import dynamique (lazy) |
| Graphiques | `recharts` | ^3.8.1 | BarChart, PieChart donut pour dashboards |
| Backend client | `@supabase/supabase-js` | v2 | Client Supabase |
| Icônes | Lucide React | Dernière | SVG natif, léger, accessible |
| Hébergement | Vercel | — | Déploiement continu depuis GitHub |

### 2.3 Couche Mobile (binôme Bikala + Anne-Marie)

| Couche | Technologie | Version | Remarque |
|--------|-------------|---------|----------|
| Framework | Flutter SDK | 3.24+ | Stable channel |
| Langage | Dart | 3.5+ | — |
| State management | Provider | ^6.1 | Choix simple, suffisant pour MVP |
| GPS/Géolocalisation | `geolocator` | ^12.0 | Précision sub-métrique |
| Géocodage inverse | `geocoding` | ^3.0 | Nom commune/préfecture depuis coords |
| Base locale | `sqflite` | ^2.3 | SQLite chiffré pour mode offline |
| Chemin fichiers | `path_provider` | ^2.1 | Localisation DB locale |
| Connectivité | `connectivity_plus` | ^6.0 | Détection 4G/Wi-Fi pour sync |
| Web3 | `web3dart` | ^2.7 | Interaction Polygon depuis Flutter |
| WalletConnect | `walletconnect_flutter_v2` | Dernière | Connexion wallet mobile |
| Backend client | `supabase_flutter` | ^2.5 | Client Supabase Flutter |
| QR Code | `qr_flutter` (génération) + `mobile_scanner` (lecture) | Dernière | — |
| Cartographie | `flutter_map` | ^7.0 | Équivalent Leaflet pour Flutter |
| Permissions | `permission_handler` | ^11.3 | Gestion permissions GPS, caméra |
| Build cible | APK Android | — | Priorité absolue ; iOS si temps |

### 2.4 Couche Backend (mutualisée Web + Mobile)

| Couche | Technologie | Version | Remarque |
|--------|-------------|---------|----------|
| BaaS | Supabase | Cloud Free Tier | PostgreSQL + PostGIS + Storage + Auth + Realtime |
| Base de données | PostgreSQL | 15+ | Avec extension PostGIS pour géospatial |
| Storage fichiers | Supabase Storage | — | GeoJSON, photos pesée, certificats |
| Auth | Supabase Auth | — | Email/password + magic links pour démo |
| Vercel Functions | Node.js | 20.x | Logique serveur (signature blockchain, génération PDF EUDR) |
| Versioning | GitHub (dépôt privé) | — | github.com/Godwin-creator/chaincacao-monorepo |

### 2.5 Outils partagés

| Outil | Usage |
|-------|-------|
| **GitHub** | Versioning monorepo |
| **WhatsApp groupe TG-16** | Coordination équipe quotidienne |
| **Figma** | Maquettes UI partagées (optionnel) |
| **Notion / Discord** | Documentation et discussion technique (optionnel) |

---

## 3. IDENTITÉ VISUELLE

### 3.1 Direction artistique

**Principe directeur : "La technologie au service de la terre"**

ChainCacao n'est pas une ONG humanitaire. C'est une **solution tech-agricole** qui doit inspirer simultanément confiance technologique (importateurs UE, jurys hackathon) et proximité agricole (producteurs togolais).

**À privilégier :**
- Chaleur des couleurs terre pour les zones humaines (producteur, coopérative)
- Fraîcheur tech (cyans, blancs) pour les zones blockchain et vérification
- Or premium pour souligner valeur ajoutée EUDR et certifications
- Lisibilité absolue (le site sera consulté en plein soleil sur smartphone bas de gamme)

**À éviter :**
- Néons agressifs, gradients criards
- Glassmorphism excessif (lourd à charger sur 3G/4G dégradée)
- Illustrations exotiques caricaturales (l'Afrique vue d'Europe)
- Typographies fantaisistes ou serif chaleureuses (= ONG)

### 3.2 Palette de couleurs

```css
/* ═══════════════════════════════════════════════════════ */
/*  COULEURS PRIMAIRES — Issues du logo ChainCacao         */
/* ═══════════════════════════════════════════════════════ */

--cacao-green-dark    : #2D5F2E   /* Vert cacao foncé — titres, navbar         */
--cacao-green         : #4A9B3E   /* Vert cabosse principal — boutons, accents */
--cacao-green-light   : #7DC96F   /* Vert clair — hover, highlights, succès    */

--blockchain-cyan     : #4FC3E8   /* Cyan blockchain principal — éléments tech */
--blockchain-cyan-dark: #2196C7   /* Cyan profond — liens, boutons secondaires */
--blockchain-cyan-light: #B3E5F2  /* Cyan pâle — fonds tech, badges            */

/* ═══════════════════════════════════════════════════════ */
/*  COULEURS SECONDAIRES — Terre, cacao torréfié, Togo     */
/* ═══════════════════════════════════════════════════════ */

--cocoa-brown         : #5D3A1F   /* Brun cacao torréfié — accents forts       */
--cocoa-brown-light   : #8B5E3C   /* Brun moyen — texte mis en avant           */
--earth-ochre         : #D4A574   /* Ocre terre — fonds chaleureux             */
--harvest-gold        : #E8B547   /* Or moisson — CTA premium, certifications  */

/* ═══════════════════════════════════════════════════════ */
/*  NEUTRES                                                */
/* ═══════════════════════════════════════════════════════ */

--white               : #FDFCF8   /* Blanc cassé chaleureux — fond principal   */
--cream               : #F5F1E8   /* Crème — sections alternées                */
--gray-light          : #E8E5DD   /* Gris sable — bordures, séparateurs        */
--gray-medium         : #9B9489   /* Gris neutre — texte secondaire            */
--gray-text           : #3D3530   /* Gris brun — texte courant                 */
--black-soft          : #1A1612   /* Quasi-noir — titres principaux            */

/* ═══════════════════════════════════════════════════════ */
/*  ÉTATS & FEEDBACK                                       */
/* ═══════════════════════════════════════════════════════ */

--success             : #4A9B3E   /* Vert cacao — confirmation, lot validé     */
--warning             : #E8B547   /* Or — avertissement, données incomplètes   */
--error               : #C1440E   /* Rouge terre — erreur, fraude détectée     */
--info                : #4FC3E8   /* Cyan — information, données blockchain    */
--focus-ring          : #2196C7   /* Cyan — outline focus accessibilité        */

/* ═══════════════════════════════════════════════════════ */
/*  COULEURS SECTORIELLES — Statuts spécifiques métier     */
/* ═══════════════════════════════════════════════════════ */

--status-harvest      : #4A9B3E   /* Récolté — vert cabosse                    */
--status-transit      : #E8B547   /* En transit — or                           */
--status-processed    : #8B5E3C   /* Transformé — brun                         */
--status-exported     : #2196C7   /* Exporté — cyan blockchain                 */
--status-verified     : #2D5F2E   /* Vérifié EUDR — vert foncé                 */
```

### 3.3 Logique d'usage de la palette

| Contexte d'usage | Couleur dominante | Justification |
|---|---|---|
| Header / Navigation | Vert cacao foncé `#2D5F2E` | Identité, sérieux, ancrage agricole |
| CTA primaire ("Enregistrer un lot") | Vert cacao `#4A9B3E` | Action positive, lié à la cabosse du logo |
| CTA blockchain ("Vérifier sur chaîne") | Cyan `#2196C7` | Cohérence avec la chaîne du logo |
| Badge "Conforme EUDR" | Or `#E8B547` | Certification, valeur premium |
| Badge "Vérifié blockchain" | Cyan clair `#B3E5F2` | Tech, immuabilité |
| Erreur / Fraude détectée | Rouge terre `#C1440E` | Alerte sans agressivité |
| Fond sections "Producteur" | Crème `#F5F1E8` | Chaleur, terrain, humain |
| Fond sections "Blockchain" | Blanc `#FDFCF8` + accents cyan | Tech, propreté |

### 3.4 Logo ChainCacao

**Composition :**
- **Cabosse de cacao verte** au centre — agriculture, fraîcheur, Togo
- **Chaîne hexagonale cyan** autour — blockchain, traçabilité immuable
- **Forme hexagonale** — référence directe aux blocs blockchain

**Fichiers disponibles :**
- `logo-chaincacao-sans-fond.png` — version transparente (usage principal)
- `logo-chaincacao-avec-fond-blanc.png` — version sur fond blanc (impression, documents)

**Règles d'usage :**
- **Formats requis** : SVG (priorité, à régénérer) + PNG 512px minimum
- **Fond clair** → utiliser version sans fond
- **Fond sombre** → utiliser version sur cercle blanc (à créer si besoin)
- **Zone de protection** : espace minimum = hauteur du logo × 0.25 autour
- **Ne jamais** : déformer, recolorer, ajouter d'effet, placer sur fond conflictuel
- **Favicon** : silhouette de la cabosse seule sur fond vert foncé `#2D5F2E`

### 3.5 Typographies

```css
/* ═══════════════════════════════════════════════════════ */
/*  POLICES — Toutes via Google Fonts                       */
/* ═══════════════════════════════════════════════════════ */

/* Titres : Plus Jakarta Sans (moderne, géométrique, tech-agricole) */
font-family: 'Plus Jakarta Sans', sans-serif;

/* Corps : Inter (lisibilité optimale, neutre, multi-langues) */
font-family: 'Inter', sans-serif;

/* Données techniques (hash blockchain, UUID, GPS) : JetBrains Mono */
font-family: 'JetBrains Mono', monospace;

/* ═══════════════════════════════════════════════════════ */
/*  TAILLES (rem, mobile-first)                            */
/* ═══════════════════════════════════════════════════════ */

--text-xs   : 0.75rem
--text-sm   : 0.875rem
--text-base : 1rem
--text-lg   : 1.125rem
--text-xl   : 1.25rem
--text-2xl  : 1.5rem
--text-3xl  : 1.875rem
--text-4xl  : 2.25rem
--text-5xl  : 3rem      /* Héros uniquement */
```

### 3.6 Règles d'animation (Framer Motion / Flutter animations)

- **Principe** : les animations servent le contenu, jamais ne le distraient
- **Fade-in au scroll** : opacity 0→1, translateY 20px→0, duration 0.5s, ease "easeOut"
- **Hover sur boutons (web)** : scale 1→1.03, duration 0.2s
- **Hover sur cards (web)** : translateY 0→-4px + légère ombre, duration 0.25s
- **Transitions de page** : fade simple, duration 0.3s
- **Loader blockchain** : animation cyclique cyan pulsant pendant transactions (max 3-5 secondes annoncées)
- **Interdit** : rotations, bounces, parallaxe lourd, animations en boucle constante

---

## 4. TON ÉDITORIAL

ChainCacao s'adresse à 3 types de publics très différents. Le ton doit s'adapter sans jamais perdre la **clarté technique** et la **crédibilité institutionnelle**.

### 4.1 Règles globales

- **Vouvoyer** systématiquement (acteurs professionnels, institutionnels)
- **Éviter le jargon blockchain** dans les interfaces utilisateur (producteur, coopérative) — préférer "registre vérifiable", "preuve numérique", "certificat immuable"
- **Garder le vocabulaire blockchain** dans les interfaces techniques (exportateur, vérificateur UE) — "hash", "transaction on-chain", "smart contract"
- **Verbes d'action** dans les CTA : "Enregistrer un lot", "Transférer", "Vérifier", "Générer le certificat EUDR"
- **Pas d'emojis** dans les interfaces (professionnalisme), sauf statuts visuels (✅ ⏳ ⚠️) dans les tableaux
- **Pas de promesses irréalistes** : pas de "révolutionner", "disruption", "uberisation"

### 4.2 Tons par contexte

| Contexte | Ton à adopter |
|----------|---------------|
| Page d'accueil (site vitrine) | Professionnel, démonstratif, ancré dans les chiffres (40 000 familles, 30-40 M$ pertes) |
| Interface Agriculteur (mobile) | Simple, direct, en grands caractères, vocabulaire concret ("Photo du sac", "Position GPS") |
| Interface Coopérative (web) | Clair, factuel, organisé, met l'accent sur la traçabilité visible |
| Interface Transformateur (web) | Technique mais lisible, met l'accent sur la qualité (séchage, fermentation) |
| Interface Exportateur (web) | Institutionnel, conforme, formel — c'est l'interface qui produit la déclaration EUDR officielle |
| Interface Vérificateur UE (web public) | Anglais possible en V2 ; français V1 ; ton institutionnel européen, données factuelles |
| Page "Comment ça marche" | Pédagogique, étape par étape, avec schémas |

### 4.3 Vocabulaire ChainCacao

| À utiliser | À éviter |
|------------|----------|
| Lot | Batch, parcel |
| Producteur, agriculteur | Fermier, paysan |
| Coopérative | Coop, association |
| Pisteur (interne) / Collecteur (officiel) | Intermédiaire, négociant informel |
| Certificat EUDR | Conformité européenne |
| Registre blockchain | Base de données décentralisée |
| Hash de vérification | Empreinte cryptographique |
| Parcelle géolocalisée | Champ GPS |
| Transfert de propriété | Cession, vente |

---

## 5. ACCESSIBILITÉ

### 5.1 Standards WCAG AA

- **Contrastes** : minimum 4.5:1 pour texte normal, 3:1 pour grands titres
- **Navigation clavier** : tous les éléments interactifs accessibles via Tab (web)
- **Focus visible** : outline cyan `#2196C7` 2px sur tous les éléments focusables
- **Alt textes** : obligatoires sur toutes les images (voir convention §10)
- **Labels formulaires** : explicites, associés via `<label htmlFor>` (web) ou `Semantics` (Flutter)
- **Langue** : attribut `lang="fr"` sur `<html>`

### 5.2 Spécificités terrain africain

Adaptations critiques au contexte d'usage :

- **Zones cliquables mobile** : minimum **48×48 dp** (au-dessus du standard 44 px), car utilisation à une main, sous soleil, parfois avec des doigts mouillés ou tachés
- **Contraste renforcé** : préférer le ratio 7:1 quand possible (lecture en plein soleil)
- **Tailles de texte** : minimum **16 sp** sur mobile (corps), **20 sp** pour les actions importantes
- **Pas de glissements horizontaux complexes** : navigation par boutons explicites (carrousel autorisé seulement avec indicateurs visibles)
- **Indicateurs de statut redondants** : couleur + icône + texte (pas seulement la couleur, pour daltoniens et écrans bas de gamme)
- **Mode hors-ligne explicite** : badge "Hors-ligne — Sera synchronisé" toujours visible quand pas de connexion
- **Feedback de progression** : toute action > 1 seconde affiche un loader avec texte ("Enregistrement sur blockchain en cours…")

---

## 6. ARCHITECTURE GLOBALE

### 6.1 Schéma de flux complet

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   MOBILE FLUTTER        │         │   WEB REACT             │
│   (Bikala + Anne-Marie) │         │   (Komi + Sophos)       │
│                         │         │                         │
│  Acteurs principaux :   │         │  Acteurs principaux :   │
│  - Agriculteur          │         │  - Coopérative          │
│  - Pisteur (collecte)   │         │  - Transformateur       │
│                         │         │  - Exportateur          │
│  Mode offline-first :   │         │  - Vérificateur UE      │
│  SQLite local chiffré   │         │  - Site vitrine public  │
└──────────┬──────────────┘         └────────────┬────────────┘
           │                                     │
           │  Sync opportuniste 4G/Wi-Fi         │
           │                                     │
           └──────────────┬──────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │       SUPABASE CLOUD (Free Tier)     │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │  PostgreSQL + PostGIS          │  │
        │  │  - users                       │  │
        │  │  - producers                   │  │
        │  │  - parcels (geom polygon)      │  │
        │  │  - lots                        │  │
        │  │  - transfers                   │  │
        │  │  - verifications               │  │
        │  └────────────────────────────────┘  │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │  Storage (S3-compatible)       │  │
        │  │  - geojson/                    │  │
        │  │  - photos/                     │  │
        │  │  - certificates/               │  │
        │  └────────────────────────────────┘  │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │  Auth (Row Level Security)     │  │
        │  │  Roles: producer, cooperative, │  │
        │  │  processor, exporter, verifier │  │
        │  └────────────────────────────────┘  │
        └──────────────────┬───────────────────┘
                           │
                           │  Hash SHA-256 + UUID
                           │  via Vercel Function
                           ▼
        ┌──────────────────────────────────────┐
        │     VERCEL FUNCTIONS (Node.js)       │
        │                                      │
        │  - /api/blockchain/register-lot      │
        │  - /api/blockchain/transfer-lot      │
        │  - /api/blockchain/verify-lot        │
        │  - /api/eudr/generate-certificate    │
        │  - /api/sync/pending-transactions    │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     POLYGON AMOY (Testnet)           │
        │                                      │
        │  Smart Contract : ChainCacao.sol     │
        │  - ERC-721 (chaque lot = NFT)        │
        │  - registerLot()                     │
        │  - transferLot()                     │
        │  - verifyLot()                       │
        │  - generateEUDRProof()               │
        └──────────────────────────────────────┘
```

### 6.2 Principe On-chain / Off-chain

> **Règle absolue :** ne JAMAIS mettre les fichiers GeoJSON, photos, ou documents complets sur la blockchain. Coût explosif et saturation.

**On-chain (Polygon — immuable) :**
- UUID du lot (identifiant unique)
- Hash SHA-256 du fichier GeoJSON complet
- Hash SHA-256 des photos de pesée
- Métadonnées : poids net, espèce (cacao/café), date/heure UTC
- Identifiants des parties (wallet addresses)
- Statut du lot (créé, transféré, transformé, exporté)
- Historique complet des transferts (chaîne d'événements)

**Off-chain (Supabase — modifiable contrôlé) :**
- Fichiers GeoJSON complets (polygones de parcelles)
- Photos de pesée et de la cabosse
- Certificats Bio/Fairtrade scannés (PDF)
- Profils détaillés des producteurs (RGPD : modifiables)
- Métadonnées qualité (profil de fermentation, taux d'humidité)

**Garantie d'intégrité :** le hash on-chain prouve que le fichier off-chain n'a pas été modifié. Si quelqu'un altère le GeoJSON dans Supabase, le hash recalculé ne correspondra plus à celui inscrit sur la blockchain.

---

## 7. SCHÉMAS BLOCKCHAIN (Smart Contract)

### 7.1 Smart Contract principal — `ChainCacao.sol`

Le contrat hérite de **ERC-721** (chaque lot = NFT unique) et **AccessControl** (rôles).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ChainCacao is ERC721, AccessControl {

    // ═══════════════════════════════════════════════════
    //  RÔLES
    // ═══════════════════════════════════════════════════
    bytes32 public constant PRODUCER_ROLE     = keccak256("PRODUCER_ROLE");
    bytes32 public constant COOPERATIVE_ROLE  = keccak256("COOPERATIVE_ROLE");
    bytes32 public constant PROCESSOR_ROLE    = keccak256("PROCESSOR_ROLE");
    bytes32 public constant EXPORTER_ROLE     = keccak256("EXPORTER_ROLE");
    bytes32 public constant VERIFIER_ROLE     = keccak256("VERIFIER_ROLE");

    // ═══════════════════════════════════════════════════
    //  STATUTS DU LOT
    // ═══════════════════════════════════════════════════
    enum LotStatus {
        Harvested,    // 0 - Récolté par producteur
        Collected,    // 1 - Collecté par coopérative
        Processed,    // 2 - Transformé (séchage/fermentation)
        Exported,     // 3 - Exporté vers UE
        Verified      // 4 - Vérifié EUDR par autorité UE
    }

    // ═══════════════════════════════════════════════════
    //  STRUCTURE LOT (on-chain)
    // ═══════════════════════════════════════════════════
    struct Lot {
        uint256 tokenId;            // ID unique (auto-incrémenté)
        bytes32 lotUUID;            // UUID v4 généré côté app
        string species;             // "cacao" | "robusta_coffee" | "arabica_coffee"
        uint256 weightGrams;        // Poids net en grammes (pour précision)
        uint256 harvestTimestamp;   // Date de récolte (UNIX)
        bytes32 geoJsonHash;        // SHA-256 du fichier GeoJSON
        bytes32 photoHash;          // SHA-256 des photos pesée
        address currentOwner;       // Adresse wallet du propriétaire actuel
        LotStatus status;           // Statut courant
        string countryCode;         // "TG" (ISO 3166-1 alpha-2)
        string region;              // "Plateaux"
        string commune;             // "Wawa", "Akébou", etc.
    }

    // ═══════════════════════════════════════════════════
    //  STRUCTURE TRANSFERT (historique)
    // ═══════════════════════════════════════════════════
    struct Transfer {
        uint256 lotId;
        address from;
        address to;
        uint256 timestamp;
        LotStatus newStatus;
        bytes32 contextHash;        // Hash métadonnées contextuelles
    }

    // ═══════════════════════════════════════════════════
    //  STORAGE
    // ═══════════════════════════════════════════════════
    mapping(uint256 => Lot) public lots;
    mapping(uint256 => Transfer[]) public lotTransfers;
    uint256 private _nextTokenId;

    // ═══════════════════════════════════════════════════
    //  ÉVÉNEMENTS
    // ═══════════════════════════════════════════════════
    event LotRegistered(uint256 indexed tokenId, bytes32 indexed lotUUID, address indexed producer);
    event LotTransferred(uint256 indexed tokenId, address indexed from, address indexed to, LotStatus newStatus);
    event LotVerified(uint256 indexed tokenId, address indexed verifier);

    // ═══════════════════════════════════════════════════
    //  FONCTIONS PRINCIPALES
    // ═══════════════════════════════════════════════════

    /// Enregistre un nouveau lot (appelé par PRODUCER_ROLE)
    function registerLot(
        bytes32 _lotUUID,
        string memory _species,
        uint256 _weightGrams,
        bytes32 _geoJsonHash,
        bytes32 _photoHash,
        string memory _countryCode,
        string memory _region,
        string memory _commune
    ) external onlyRole(PRODUCER_ROLE) returns (uint256);

    /// Transfère un lot vers un acteur suivant
    function transferLot(
        uint256 _tokenId,
        address _to,
        LotStatus _newStatus,
        bytes32 _contextHash
    ) external;

    /// Lit l'historique complet d'un lot
    function getLotHistory(uint256 _tokenId) external view returns (Lot memory, Transfer[] memory);

    /// Vérifie qu'un lot est conforme EUDR (appelé par VERIFIER_ROLE)
    function verifyLotEUDR(uint256 _tokenId) external onlyRole(VERIFIER_ROLE);
}
```

### 7.2 Format des hash

- **Algorithme** : SHA-256
- **Encodage** : `bytes32` Solidity (préfixe `0x` + 64 caractères hex)
- **Calcul côté app** : `crypto.subtle.digest('SHA-256', file)` (web) ou `crypto` package Dart (mobile)
- **Vérification publique** : un visiteur peut télécharger le GeoJSON depuis Supabase, le rehasher, et comparer avec le hash on-chain

### 7.3 Stratégie de transactions

- **Toutes les transactions sont signées côté Vercel Function**, pas côté client (pour éviter d'imposer aux utilisateurs de gérer du gas en MATIC)
- **Wallet maître ChainCacao** : 1 wallet propriétaire qui paie le gas pour toutes les opérations métier (financé en MATIC testnet via faucet)
- **Identification utilisateurs** : par leur compte Supabase (email/password), pas par wallet personnel
- **V2 (post-hackathon)** : chaque acteur aura son propre wallet pour la décentralisation totale

---

## 8. SCHÉMAS SUPABASE (Base de données)

### 8.1 Tables PostgreSQL

```sql
-- ═══════════════════════════════════════════════════════
--  EXTENSIONS
-- ═══════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ═══════════════════════════════════════════════════════
--  TABLE : users (étend supabase auth.users)
-- ═══════════════════════════════════════════════════════
CREATE TYPE user_role AS ENUM (
  'producer', 'cooperative', 'processor', 'exporter', 'verifier', 'admin'
);

CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  role            user_role NOT NULL,
  phone           TEXT,
  organization    TEXT,                    -- nom coopérative, exportateur, etc.
  region          TEXT,                    -- "Plateaux", "Kara", etc.
  commune         TEXT,                    -- "Wawa", "Akébou", etc.
  wallet_address  TEXT,                    -- optionnel V1, requis V2
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
--  TABLE : producers (détails producteurs)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.producers (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES public.users(id) ON DELETE CASCADE,
  cooperative_id       UUID REFERENCES public.users(id),  -- coopérative de rattachement
  family_size          INTEGER,
  years_experience     INTEGER,
  certifications       TEXT[],            -- ['bio', 'fairtrade', 'rainforest_alliance']
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
--  TABLE : parcels (parcelles GPS)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.parcels (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id          UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,           -- "Parcelle Nord", "Champ Akébou 2"
  area_hectares        DECIMAL(10,4) NOT NULL,
  geom                 GEOMETRY(POLYGON, 4326), -- WGS84 (EPSG:4326) - EUDR compliant
  geom_point           GEOMETRY(POINT, 4326),   -- pour parcelles < 4 ha
  geojson_url          TEXT NOT NULL,           -- URL Supabase Storage
  geojson_hash         TEXT NOT NULL,           -- SHA-256 hex
  is_eudr_compliant    BOOLEAN DEFAULT FALSE,   -- vérifié non-déforestation après 2020
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parcels_geom ON public.parcels USING GIST(geom);

-- ═══════════════════════════════════════════════════════
--  TABLE : lots (lots de récolte)
-- ═══════════════════════════════════════════════════════
CREATE TYPE lot_status AS ENUM (
  'harvested', 'collected', 'processed', 'exported', 'verified'
);

CREATE TYPE species_type AS ENUM (
  'cacao', 'robusta_coffee', 'arabica_coffee'
);

CREATE TABLE public.lots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blockchain_token_id  BIGINT,                  -- ID NFT sur Polygon (null si pas encore inscrit)
  blockchain_tx_hash   TEXT,                    -- hash de la transaction de création
  parcel_id            UUID REFERENCES public.parcels(id),
  producer_id          UUID REFERENCES public.producers(id),
  current_owner_id     UUID REFERENCES public.users(id),
  species              species_type NOT NULL,
  weight_grams         BIGINT NOT NULL,         -- en grammes pour précision
  harvest_date         DATE NOT NULL,
  status               lot_status NOT NULL DEFAULT 'harvested',
  photo_urls           TEXT[],                  -- URLs Supabase Storage
  photo_hashes         TEXT[],                  -- SHA-256 des photos
  quality_data         JSONB,                   -- {fermentation_days, humidity_pct, ...}
  is_synced_blockchain BOOLEAN DEFAULT FALSE,   -- false si créé offline en attente sync
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
--  TABLE : transfers (historique des transferts)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.transfers (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id               UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  from_user_id         UUID REFERENCES public.users(id),
  to_user_id           UUID REFERENCES public.users(id),
  new_status           lot_status NOT NULL,
  transfer_date        TIMESTAMPTZ DEFAULT NOW(),
  blockchain_tx_hash   TEXT,
  context_data         JSONB,                   -- {weight_verified, notes, ...}
  context_hash         TEXT,
  is_synced_blockchain BOOLEAN DEFAULT FALSE
);

-- ═══════════════════════════════════════════════════════
--  TABLE : eudr_certificates (certificats EUDR générés)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.eudr_certificates (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id               UUID REFERENCES public.lots(id),
  exporter_id          UUID REFERENCES public.users(id),
  certificate_pdf_url  TEXT NOT NULL,           -- PDF généré
  geojson_export_url   TEXT NOT NULL,           -- GeoJSON conforme TRACES
  generated_at         TIMESTAMPTZ DEFAULT NOW(),
  is_submitted_traces  BOOLEAN DEFAULT FALSE    -- soumis à TRACES (V2)
);

-- ═══════════════════════════════════════════════════════
--  TABLE : verifications (logs vérifications publiques)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.verifications (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id               UUID REFERENCES public.lots(id),
  verifier_ip          TEXT,
  verifier_country     TEXT,
  verified_at          TIMESTAMPTZ DEFAULT NOW(),
  verification_method  TEXT                     -- 'qr_scan', 'web_search', 'api'
);
```

### 8.2 Politique de sécurité (RLS)

Chaque table doit avoir des **Row Level Security policies** :

```sql
-- Exemple : un producteur voit uniquement ses lots
CREATE POLICY "Producers see own lots"
  ON public.lots FOR SELECT
  USING (producer_id IN (
    SELECT id FROM public.producers WHERE user_id = auth.uid()
  ));

-- Une coopérative voit les lots qu'elle a reçus
CREATE POLICY "Cooperative sees received lots"
  ON public.lots FOR SELECT
  USING (current_owner_id = auth.uid());

-- Un vérificateur UE voit tous les lots exportés
CREATE POLICY "Verifier sees exported lots"
  ON public.lots FOR SELECT
  USING (
    status IN ('exported', 'verified')
    AND auth.jwt() ->> 'role' = 'verifier'
  );
```

### 8.3 Buckets Supabase Storage

| Bucket | Contenu | Accès |
|--------|---------|-------|
| `geojson` | Fichiers GeoJSON des parcelles | Lecture publique, écriture authentifiée |
| `photos` | Photos pesée, cabosse, transformation | Lecture publique, écriture par propriétaire |
| `certificates` | Certificats EUDR PDF générés | Lecture publique (vérification UE), écriture serveur uniquement |
| `documents` | Certificats Bio/Fairtrade scannés | Lecture authentifiée, écriture authentifiée |

---

## 9. CONTRATS API (anti-divergence Web/Mobile)

> **CRITIQUE :** Cette section définit les endpoints que **Web ET Mobile consomment de manière strictement identique**. Toute modification de ces contrats nécessite une décision d'équipe et une mise à jour synchronisée des deux côtés.

### 9.1 Authentification

Toutes les requêtes (sauf vérification publique) requièrent :
```
Authorization: Bearer <supabase_access_token>
```

### 9.2 Endpoints API

#### POST `/api/lots/register`
**Créer un nouveau lot (Producteur)**

**Request Body :**
```json
{
  "parcelId": "uuid-string",
  "species": "cacao",
  "weightGrams": 50000,
  "harvestDate": "2026-11-15",
  "photoUrls": ["https://supabase.../photo1.jpg"],
  "photoHashes": ["a3f2..."],
  "qualityData": {
    "humidityPct": 7.5,
    "fermentationDays": 6
  },
  "createdOffline": false,
  "offlineCreatedAt": "2026-11-15T08:30:00Z"
}
```

**Response 201 :**
```json
{
  "lotId": "uuid-string",
  "blockchainTokenId": null,
  "blockchainTxHash": null,
  "isSyncedBlockchain": false,
  "qrCodeUrl": "https://chaincacao.vercel.app/verify/uuid-string"
}
```

**Notes :**
- `blockchainTokenId` et `blockchainTxHash` sont `null` au moment de la création offline ; ils sont remplis après synchronisation
- L'API renvoie immédiatement même si la blockchain n'est pas encore mise à jour (sync asynchrone)

---

#### POST `/api/lots/transfer`
**Transférer un lot vers un autre acteur**

**Request Body :**
```json
{
  "lotId": "uuid-string",
  "toUserId": "uuid-string",
  "newStatus": "collected",
  "contextData": {
    "weightVerified": 49850,
    "notes": "Léger écart -0.3% acceptable"
  }
}
```

**Response 200 :**
```json
{
  "transferId": "uuid-string",
  "blockchainTxHash": "0x...",
  "lot": { /* lot complet mis à jour */ }
}
```

---

#### GET `/api/lots/:lotId`
**Récupérer les détails complets d'un lot**

**Response 200 :**
```json
{
  "id": "uuid-string",
  "blockchainTokenId": 42,
  "species": "cacao",
  "weightGrams": 50000,
  "status": "exported",
  "harvestDate": "2026-11-15",
  "parcel": {
    "id": "uuid",
    "name": "Parcelle Nord",
    "areaHectares": 2.5,
    "geojsonUrl": "https://...",
    "geojsonHash": "a3f2..."
  },
  "producer": {
    "fullName": "Kossi AYITE",
    "commune": "Wawa"
  },
  "transfers": [
    { /* transfer 1 */ },
    { /* transfer 2 */ }
  ],
  "currentOwner": { "fullName": "Coopérative Wawa Cacao" }
}
```

---

#### GET `/api/lots/:lotId/verify`
**Vérification publique (vérificateur UE, scan QR)**

**Response 200 :**
```json
{
  "isValid": true,
  "lot": { /* données du lot */ },
  "blockchainProof": {
    "tokenId": 42,
    "contractAddress": "0x...",
    "network": "polygon-amoy",
    "blockExplorerUrl": "https://amoy.polygonscan.com/token/0x.../42"
  },
  "eudrCompliance": {
    "isCompliant": true,
    "geojsonValid": true,
    "noDeforestationAfter2020": true,
    "geolocationPrecision": "polygon"
  }
}
```

---

#### POST `/api/parcels/register`
**Enregistrer une nouvelle parcelle GPS**

**Request Body :**
```json
{
  "name": "Parcelle Nord",
  "areaHectares": 2.5,
  "geojson": {
    "type": "Polygon",
    "coordinates": [[
      [0.901234, 7.123456],
      [0.901567, 7.123890],
      [0.901890, 7.124200],
      [0.901234, 7.123456]
    ]]
  }
}
```

**Validation serveur :**
- Système de référence WGS84 (EPSG:4326) obligatoire
- Polygone fermé (premier point = dernier point)
- Au moins 4 points pour un polygone valide
- Pas d'auto-intersection
- Précision minimum 6 décimales sur lat/long

**Response 201 :**
```json
{
  "parcelId": "uuid-string",
  "geojsonUrl": "https://supabase.../parcel.geojson",
  "geojsonHash": "a3f2..."
}
```

---

#### POST `/api/eudr/generate-certificate`
**Générer un certificat EUDR pour un lot exporté (Exportateur)**

**Request Body :**
```json
{
  "lotId": "uuid-string"
}
```

**Response 200 :**
```json
{
  "certificateId": "uuid-string",
  "certificatePdfUrl": "https://supabase.../cert.pdf",
  "geojsonExportUrl": "https://supabase.../export.geojson",
  "tracesCompatible": true
}
```

---

#### POST `/api/sync/pending`
**Synchroniser les lots créés offline (Mobile)**

**Request Body :**
```json
{
  "pendingLots": [
    {
      "localId": "local-uuid",
      "data": { /* données lot */ }
    }
  ]
}
```

**Response 200 :**
```json
{
  "synced": [
    {
      "localId": "local-uuid",
      "serverId": "uuid-string",
      "blockchainTxHash": "0x..."
    }
  ],
  "failed": []
}
```

### 9.3 Codes d'erreur standard

| Code HTTP | Signification |
|-----------|---------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Données invalides (validation GeoJSON, etc.) |
| 401 | Non authentifié |
| 403 | Non autorisé (rôle incorrect) |
| 404 | Ressource introuvable |
| 409 | Conflit (lot déjà transféré, etc.) |
| 422 | Données EUDR non conformes |
| 500 | Erreur serveur |
| 503 | Blockchain indisponible (réessayer plus tard) |

### 9.4 Format des erreurs

```json
{
  "error": {
    "code": "EUDR_VALIDATION_FAILED",
    "message": "Le polygone GeoJSON contient une auto-intersection",
    "details": {
      "field": "geojson.coordinates",
      "expected": "Polygone simple sans intersection"
    }
  }
}
```

---

## 10. MODE OFFLINE-FIRST (Mobile)

### 10.1 Principe directeur

L'application Flutter doit fonctionner **intégralement sans connexion** dans les zones de Wawa, Akébou et autres zones grises de la région des Plateaux. La synchronisation se fait dès qu'une connexion 4G/Wi-Fi est détectée.

### 10.2 Architecture offline

```
┌────────────────────────────────────┐
│  COUCHE UI (Flutter Widgets)       │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│  COUCHE SERVICE (Provider)         │
│  - LotService                      │
│  - ParcelService                   │
│  - SyncService                     │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│  COUCHE REPOSITORY                 │
│  ┌──────────────────────────────┐  │
│  │ LotRepository                │  │
│  │ - getLocalLots()             │  │
│  │ - createLotLocally()         │  │
│  │ - syncWithServer()           │  │
│  └──────────────────────────────┘  │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│  COUCHE DATA                       │
│  ┌──────────────────────────────┐  │
│  │ SQLite (sqflite)             │  │
│  │ - lots_local                 │  │
│  │ - parcels_local              │  │
│  │ - sync_queue                 │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Supabase Client              │  │
│  │ (utilisé si connectivity OK) │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 10.3 Tables SQLite locales

```sql
-- Lots créés offline en attente de sync
CREATE TABLE lots_local (
  local_id          TEXT PRIMARY KEY,        -- UUID généré localement
  server_id         TEXT,                    -- rempli après sync
  parcel_id         TEXT,
  species           TEXT,
  weight_grams      INTEGER,
  harvest_date      TEXT,
  photo_paths       TEXT,                    -- JSON array de chemins locaux
  status            TEXT DEFAULT 'harvested',
  is_synced         INTEGER DEFAULT 0,       -- 0=non sync, 1=sync
  created_at        TEXT,
  sync_attempts     INTEGER DEFAULT 0
);

-- Parcelles créées offline
CREATE TABLE parcels_local (
  local_id          TEXT PRIMARY KEY,
  server_id         TEXT,
  name              TEXT,
  area_hectares     REAL,
  geojson_data      TEXT,                    -- GeoJSON sérialisé
  is_synced         INTEGER DEFAULT 0,
  created_at        TEXT
);

-- File d'attente de synchronisation
CREATE TABLE sync_queue (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type       TEXT,                    -- 'lot' | 'parcel' | 'transfer'
  entity_local_id   TEXT,
  action            TEXT,                    -- 'create' | 'update'
  payload           TEXT,                    -- JSON sérialisé
  created_at        TEXT,
  attempts          INTEGER DEFAULT 0,
  last_error        TEXT
);
```

### 10.4 Stratégie de synchronisation

1. **Détection connectivité** via `connectivity_plus` (listener actif)
2. **Synchronisation automatique** dès passage offline → online
3. **Synchronisation manuelle** via bouton "Synchroniser maintenant" toujours visible
4. **Retry exponentiel** : 1s, 5s, 30s, 2min, 10min, abandon après 5 échecs
5. **Gestion conflits** : last-write-wins côté serveur, log local des conflits
6. **UI état synchronisation** :
   - Badge orange "Hors-ligne — N éléments en attente"
   - Badge cyan "Synchronisation en cours…"
   - Badge vert "Tout synchronisé"

### 10.5 Capture GPS hors-ligne

- **Source** : capteurs GNSS natifs du smartphone (pas besoin d'internet pour le GPS)
- **Précision cible** : ≤ 5 mètres (mode haute précision Android)
- **Fallback** : si précision > 10 m, demander à l'utilisateur de réessayer dans 30 secondes
- **Format de stockage** : GeoJSON sérialisé en TEXT dans SQLite, puis envoyé tel quel à Supabase lors de la sync

---

## 11. RÉPARTITION DES RESPONSABILITÉS

### 11.1 Sous-équipe Web (Komi + Sophos)

**Périmètre :**
- Site vitrine public ChainCacao
- Interface Coopérative (réception lots, vérification poids)
- Interface Transformateur (séchage, fermentation, qualité)
- Interface Exportateur (génération certificats EUDR)
- Interface Vérificateur UE (consultation publique via QR code)
- Page de vérification publique `/verify/:lotId`
- Smart Contract Solidity + déploiement Polygon Amoy
- Vercel Functions (logique serveur, signatures blockchain)

**Komi :**
- Architecture globale, smart contracts, intégration blockchain
- Coordination avec sous-équipe mobile
- Vercel Functions critiques (`register-lot`, `transfer-lot`, `verify-lot`)
- Setup Supabase (tables, RLS, buckets)

**Sophos :**
- Pages web (site vitrine, dashboards des 4 acteurs web)
- Composants UI réutilisables (Tailwind + Framer Motion)
- Intégration Leaflet pour cartes
- Génération QR Code, lecture QR Code

### 11.2 Sous-équipe Mobile (Bikala + Anne-Marie)

**Périmètre :**
- Application Flutter Android (APK) avec mode offline-first
- Interface Agriculteur (création lots, capture GPS, photos)
- Interface Pisteur/Collecteur (collecte terrain, transferts initiaux)
- SQLite local + service de synchronisation
- Capture photo + hashing local
- Capture GPS haute précision

**Bikala :**
- Architecture Flutter, services (LotService, SyncService)
- Intégration `geolocator` et capture GPS
- SQLite local et stratégie de sync
- Tests sur appareils Android réels

**Anne-Marie :**
- Interfaces utilisateur Flutter (écrans agriculteur, collecteur)
- Composants visuels (formulaires, cards, loaders offline)
- Intégration `mobile_scanner` pour QR codes
- Intégration `flutter_map` pour visualisation parcelles

### 11.3 Responsabilités partagées (toute l'équipe)

- **Documentation utilisateur** (rédaction tutoriels)
- **Pitch final 10 min** (préparation collective)
- **Démo live** (chaque membre joue un rôle d'acteur de la chaîne)
- **Tests d'intégration end-to-end** (Web + Mobile + Blockchain)

### 11.4 Règle de coordination

> **Toute modification des contrats API (§9), des schémas blockchain (§7) ou des schémas Supabase (§8) doit être annoncée dans le groupe WhatsApp TG-16 AVANT implémentation, et validée par les 2 chefs de sous-équipe (Komi pour Web, Bikala pour Mobile).**

---

## 12. STRUCTURE DU MONOREPO

```
chaincacao-monorepo/
├── README.md
├── CHAINCACAO_PROJECT_REFERENCE.md      ← CE DOCUMENT
├── .gitignore
├── .env.example
├── package.json                          ← scripts globaux monorepo
│
├── web/                                  ← Sous-équipe Komi + Sophos
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo-chaincacao-sans-fond.png
│   │   └── og-image.jpg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── LoadingState.jsx
│   │   │   ├── blockchain/
│   │   │   │   ├── TxStatus.jsx
│   │   │   │   └── HashDisplay.jsx
│   │   │   ├── maps/
│   │   │   │   └── ParcelMap.jsx
│   │   │   └── qr/
│   │   │       ├── QRGenerator.jsx
│   │   │       └── QRScanner.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   └── Verify.jsx              ← /verify/:lotId
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── cooperative/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── LotsReceived.jsx
│   │   │   │   └── TransferLot.jsx
│   │   │   ├── processor/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── QualityEntry.jsx
│   │   │   ├── exporter/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── EUDRCertificate.jsx
│   │   │   │   └── ExportRecords.jsx
│   │   │   └── verifier/
│   │   │       ├── Dashboard.jsx
│   │   │       └── LotInspection.jsx
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   ├── blockchain.js
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useLot.js
│   │   │   └── useBlockchain.js
│   │   ├── utils/
│   │   │   ├── geojson-validator.js
│   │   │   ├── hash.js
│   │   │   └── format.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── api/                              ← Vercel Functions
│   │   ├── lots/
│   │   │   ├── register.js
│   │   │   ├── transfer.js
│   │   │   └── [lotId].js
│   │   ├── parcels/
│   │   │   └── register.js
│   │   ├── eudr/
│   │   │   └── generate-certificate.js
│   │   ├── blockchain/
│   │   │   ├── register-lot.js
│   │   │   ├── transfer-lot.js
│   │   │   └── verify-lot.js
│   │   └── sync/
│   │       └── pending.js
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── vercel.json
│
├── mobile/                               ← Sous-équipe Bikala + Anne-Marie
│   ├── android/
│   ├── ios/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app.dart
│   │   ├── config/
│   │   │   ├── theme.dart                 ← palette ChainCacao Dart
│   │   │   ├── routes.dart
│   │   │   └── constants.dart
│   │   ├── models/
│   │   │   ├── lot.dart
│   │   │   ├── parcel.dart
│   │   │   ├── user.dart
│   │   │   └── transfer.dart
│   │   ├── services/
│   │   │   ├── auth_service.dart
│   │   │   ├── lot_service.dart
│   │   │   ├── parcel_service.dart
│   │   │   ├── sync_service.dart
│   │   │   ├── gps_service.dart
│   │   │   └── connectivity_service.dart
│   │   ├── repositories/
│   │   │   ├── lot_repository.dart
│   │   │   ├── parcel_repository.dart
│   │   │   └── sync_queue_repository.dart
│   │   ├── data/
│   │   │   ├── local/
│   │   │   │   ├── database_helper.dart
│   │   │   │   └── migrations.dart
│   │   │   └── remote/
│   │   │       ├── supabase_client.dart
│   │   │       └── api_client.dart
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── signup_screen.dart
│   │   │   ├── producer/
│   │   │   │   ├── home_screen.dart
│   │   │   │   ├── new_lot_screen.dart
│   │   │   │   ├── lot_details_screen.dart
│   │   │   │   ├── parcels_screen.dart
│   │   │   │   └── new_parcel_screen.dart
│   │   │   ├── collector/
│   │   │   │   ├── home_screen.dart
│   │   │   │   └── transfer_screen.dart
│   │   │   └── shared/
│   │   │       ├── qr_scanner_screen.dart
│   │   │       └── sync_status_screen.dart
│   │   ├── widgets/
│   │   │   ├── primary_button.dart
│   │   │   ├── lot_card.dart
│   │   │   ├── offline_banner.dart
│   │   │   └── sync_indicator.dart
│   │   └── utils/
│   │       ├── hash_helper.dart
│   │       ├── geojson_helper.dart
│   │       └── formatters.dart
│   ├── pubspec.yaml
│   └── README.md
│
├── contracts/                            ← Smart Contracts (Komi)
│   ├── contracts/
│   │   └── ChainCacao.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── seed-test-data.js
│   ├── test/
│   │   └── ChainCacao.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── shared/                               ← Code partagé Web/Mobile
│   ├── schemas/
│   │   ├── lot.schema.json               ← JSON Schema pour validation
│   │   ├── parcel.schema.json
│   │   └── eudr-geojson.schema.json
│   ├── docs/
│   │   ├── API.md                        ← duplication §9 pour facilité
│   │   ├── BLOCKCHAIN.md
│   │   └── EUDR.md
│   └── assets/
│       ├── logo-chaincacao-sans-fond.png
│       ├── logo-chaincacao-avec-fond-blanc.png
│       └── palette.json
│
└── docs/
    ├── DEMO_SCRIPT.md                    ← script pitch 10 min
    ├── USER_GUIDE.md                     ← guide utilisateur final
    ├── DEPLOYMENT.md                     ← procédure de déploiement
    └── TROUBLESHOOTING.md
```

---

## 13. CONVENTIONS DE CODE

### 13.1 Nommage

- **Code** : anglais (variables, fonctions, classes, fichiers)
- **Commentaires** : français
- **Documentation utilisateur** : français exclusivement
- **Composants React** : PascalCase (`LotCard.jsx`, `EUDRCertificate.jsx`)
- **Widgets Flutter** : snake_case fichiers, PascalCase classes (`lot_card.dart` → `class LotCard`)
- **Fonctions / variables** : camelCase (`registerLot`, `isOffline`)
- **Constantes** : SCREAMING_SNAKE_CASE (`POLYGON_AMOY_RPC`, `MAX_OFFLINE_LOTS`)
- **Fichiers utilitaires** : kebab-case (`geojson-validator.js`, `hash-helper.dart`)
- **Images** : kebab-case avec préfixe catégorie (`logo-chaincacao-sans-fond.png`, `photo-parcelle-wawa.webp`)
- **Tables SQL** : snake_case (`lots`, `eudr_certificates`)
- **Colonnes SQL** : snake_case (`weight_grams`, `is_synced_blockchain`)

### 13.2 Style CSS

- **Web** : Tailwind CSS uniquement, pas de fichiers `.css` custom (sauf animations complexes)
- **Mobile** : `theme.dart` centralisé, jamais de couleurs hardcodées dans les widgets
- **Icônes web** : Lucide React uniquement (pas d'emojis, pas de Font Awesome)
- **Icônes mobile** : Material Icons (built-in Flutter) ou `lucide_icons` package

### 13.3 Commits Git (conventionnels)

Format : `<type>(<scope>): <description>`

**Types autorisés :**
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `style` : formatage, palette, UI
- `refactor` : refactor sans changement fonctionnel
- `docs` : documentation
- `chore` : maintenance, dépendances
- `test` : ajout/modification de tests

**Scopes recommandés :**
- `web` : changements web
- `mobile` : changements mobile
- `contracts` : smart contracts
- `api` : Vercel Functions
- `db` : schémas Supabase
- `shared` : code partagé

**Exemples :**
```
feat(mobile): add GPS capture screen for new lot
fix(api): correct GeoJSON validation for parcels < 4ha
style(web): apply ChainCacao palette to dashboard cards
docs(shared): update API contracts with sync endpoint
```

### 13.4 Branches Git

- `main` : version stable, déployée sur Vercel
- `dev` : branche d'intégration avant merge sur main
- `feat/web/dashboard-cooperative` : feature branches préfixées par sous-équipe
- `feat/mobile/offline-sync`
- `fix/contracts/transfer-event`

**Règle :** chaque sous-équipe travaille sur ses propres branches, merge sur `dev` après revue par l'autre sous-équipe pour les changements touchant aux contrats partagés.

---

## 14. VARIABLES D'ENVIRONNEMENT

### 14.1 Fichier `.env.example` (à la racine du monorepo)

```bash
# ═══════════════════════════════════════════════════════
#  SUPABASE
# ═══════════════════════════════════════════════════════
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...                        # Public, OK côté client
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # SECRET, serveur uniquement

# Pour Web (Vite)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Pour Mobile (Flutter — gérés via dart-define ou flutter_dotenv)
SUPABASE_URL_MOBILE=https://xxxxx.supabase.co
SUPABASE_ANON_KEY_MOBILE=eyJ...

# ═══════════════════════════════════════════════════════
#  POLYGON BLOCKCHAIN
# ═══════════════════════════════════════════════════════
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
POLYGON_AMOY_CHAIN_ID=80002
POLYGON_AMOY_BLOCK_EXPLORER=https://amoy.polygonscan.com

# Wallet maître ChainCacao (paye le gas)
CHAINCACAO_WALLET_PRIVATE_KEY=0x...             # SECRET ABSOLU, serveur uniquement
CHAINCACAO_WALLET_ADDRESS=0x...                 # Public

# Adresse du smart contract déployé
CHAINCACAO_CONTRACT_ADDRESS=0x...               # Public

# Pour Web (Vite)
VITE_CHAINCACAO_CONTRACT_ADDRESS=0x...
VITE_POLYGON_AMOY_CHAIN_ID=80002

# ═══════════════════════════════════════════════════════
#  API URLS
# ═══════════════════════════════════════════════════════
VITE_API_BASE_URL=https://chaincacao.vercel.app/api
API_BASE_URL_MOBILE=https://chaincacao.vercel.app/api

# ═══════════════════════════════════════════════════════
#  POLYGONSCAN API (pour vérification contrat)
# ═══════════════════════════════════════════════════════
POLYGONSCAN_API_KEY=                            # Pour vérifier le contrat sur explorer
```

### 14.2 Sécurité des secrets

- **`.env` et `.env.local` doivent être dans `.gitignore`** (jamais commit)
- **Ne JAMAIS exposer `CHAINCACAO_WALLET_PRIVATE_KEY` côté client** (utilisée uniquement dans Vercel Functions)
- **Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` côté client** (bypass RLS, super-admin)
- **Variables `VITE_*` ou `dart-define` sont publiques** (visibles dans le code compilé)

### 14.3 Statut des variables par environnement

| Variable | Local Dev | Vercel Prod | Mobile Build |
|----------|:---------:|:-----------:|:------------:|
| `SUPABASE_URL` | ⏳ | ⏳ | ⏳ |
| `SUPABASE_ANON_KEY` | ⏳ | ⏳ | ⏳ |
| `SUPABASE_SERVICE_ROLE_KEY` | ⏳ | ⏳ | — |
| `POLYGON_AMOY_RPC` | ⏳ | ⏳ | ⏳ |
| `CHAINCACAO_WALLET_PRIVATE_KEY` | ⏳ | ⏳ | — |
| `CHAINCACAO_CONTRACT_ADDRESS` | ⏳ | ⏳ | ⏳ |

---

## 15. LES 5 ACTEURS ET LEURS INTERFACES

### 15.1 Acteur 1 — Agriculteur (Mobile Flutter)

**Profil utilisateur :** producteur de cacao/café à Wawa, Akébou, etc. Smartphone Android d'entrée de gamme. Souvent en zone à connectivité fluctuante. Niveau technique : faible.

**Fonctionnalités essentielles :**
1. **Connexion** : email + mot de passe (assistance possible par coopérative)
2. **Tableau de bord** : voir ses parcelles enregistrées, ses lots créés, statut sync
3. **Enregistrer une parcelle** :
   - Saisir nom de la parcelle
   - Capturer le contour GPS (marche autour de la parcelle, point toutes les 10 secondes)
   - Calcul automatique de la superficie
   - Validation GeoJSON locale
4. **Créer un nouveau lot** :
   - Sélectionner la parcelle d'origine
   - Choisir l'espèce (cacao / café robusta / café arabica)
   - Saisir le poids (en kg, converti en grammes)
   - Prendre 1 à 3 photos (sac, cabosse, lieu)
   - Saisir la date de récolte
   - Validation et enregistrement local (offline OK)
5. **Transférer un lot** : à la coopérative, scan QR code de la coopérative ou sélection dans la liste
6. **Statut de synchronisation** : badge permanent + bouton "Synchroniser maintenant"

**Spécificités UX :**
- Écrans en grandes polices (corps minimum 18 sp)
- Boutons primaires en `cacao-green` `#4A9B3E`
- Banner offline orange en haut quand déconnecté
- Confirmation systématique avant chaque action

### 15.2 Acteur 2 — Coopérative (Web React)

**Profil utilisateur :** gestionnaire de coopérative à Kpalimé ou Atakpamé. PC ou tablette. Connexion 4G stable. Niveau technique : moyen.

**Fonctionnalités essentielles :**
1. **Tableau de bord** : lots reçus en attente, lots vérifiés, statistiques mensuelles
2. **Réception d'un lot** :
   - Scan QR code du lot apporté par l'agriculteur ou pisteur
   - Affichage des informations enregistrées par le producteur
   - Pesée de vérification (saisie du poids constaté)
   - Détection automatique d'écart > 2 % → alerte
   - Validation et confirmation du transfert sur blockchain
3. **Liste des lots reçus** : filtrable par espèce, date, producteur, statut
4. **Carte des parcelles fournisseurs** : visualisation Leaflet de toutes les parcelles
5. **Transfert vers transformateur** : sélection de plusieurs lots, transfert groupé

**Spécificités UX :**
- Layout dashboard avec sidebar gauche (navigation)
- Couleurs principales : crème `#F5F1E8` (zone agricole) + accents cyan pour blockchain
- Tableaux denses avec recherche et filtres

### 15.3 Acteur 3 — Transformateur (Web React)

**Profil utilisateur :** responsable d'unité de transformation (séchage, fermentation). PC. Connexion stable.

**Fonctionnalités essentielles :**
1. **Tableau de bord** : lots en cours de transformation, lots prêts pour exportateur
2. **Réception lot** : depuis coopérative
3. **Saisie données qualité** :
   - Durée de fermentation (jours)
   - Taux d'humidité finale (%)
   - Notes de profil de saveur (texte libre)
   - Photos des étapes
4. **Validation transformation terminée** : transfert vers exportateur
5. **Historique transformations** : statistiques par batch, par espèce

**Spécificités UX :**
- Interface technique mais lisible
- Couleurs principales : brun chocolat `#8B5E3C` + verts (qualité)
- Saisies numériques avec validation stricte

### 15.4 Acteur 4 — Exportateur (Web React)

**Profil utilisateur :** responsable export à Lomé (CACAOMAX, COCOLMEX, ETC Agro, GEBANA). PC. Maîtrise des exigences EUDR.

**Fonctionnalités essentielles :**
1. **Tableau de bord** : lots prêts pour export, certificats EUDR générés
2. **Sélection lots pour export** : sélection multiple
3. **Génération certificat EUDR** :
   - Bouton "Générer le certificat EUDR"
   - Compilation automatique des GeoJSON des parcelles concernées
   - Génération du PDF officiel avec :
     * Identité de l'exportateur
     * Liste des lots avec leurs parcelles
     * GeoJSON consolidé conforme TRACES
     * Hash blockchain de chaque lot
     * Déclaration de non-déforestation
   - Export `.geojson` séparé pour soumission TRACES
4. **Historique exports** : par destination, par client UE
5. **Visualisation cartographique** : superposition de toutes les parcelles exportées

**Spécificités UX :**
- Interface institutionnelle, formelle
- Couleurs principales : vert foncé `#2D5F2E` + or `#E8B547` (premium, EUDR)
- Génération PDF longue (2-5s) → loader explicite

### 15.5 Acteur 5 — Vérificateur UE (Web Public)

**Profil utilisateur :** importateur européen, autorité douanière UE, organisme de certification. Anglais ou français. Niveau technique : élevé.

**Fonctionnalités essentielles :**
1. **Page de vérification publique** : `/verify/:lotId` (accessible via QR code)
   - **Aucune authentification requise** (vérification publique)
   - Affichage des informations du lot
   - Affichage de la chaîne complète de transferts
   - Affichage de la parcelle sur carte (Leaflet)
   - **Lien direct vers Polygonscan** pour vérifier la transaction blockchain
   - Bouton "Télécharger le certificat EUDR" (PDF)
   - Bouton "Télécharger le GeoJSON" (format TRACES)
2. **Page d'inspection avancée** (avec compte vérificateur) :
   - Recherche par hash blockchain, UUID, nom de producteur
   - Comparaison automatique avec données satellite (V2)
   - Marquage "Lot vérifié EUDR" (transaction blockchain dédiée)

**Spécificités UX :**
- Interface ultra-claire, peu de couleurs
- Affichage des hash en `JetBrains Mono`
- Liens externes sortants vers Polygonscan, OpenStreetMap
- Pas de friction : tout doit être consultable en 2 clics

---

## 16. FLUX FONCTIONNEL COMPLET

### 16.1 Parcours d'un lot de la ferme à l'UE

```
ÉTAPE 1 — RÉCOLTE (Agriculteur — Mobile)
  ▼
  • L'agriculteur Kossi récolte 50 kg de cacao sur sa parcelle "Champ Nord" (2.5 ha à Wawa)
  • Il ouvre l'app Flutter → "Nouveau lot"
  • Sélectionne la parcelle (déjà enregistrée avec polygone GPS)
  • Saisit poids = 50000 g, espèce = cacao, date = aujourd'hui
  • Prend 2 photos (sac + cabosse)
  • Validation : lot créé localement (offline)
  • UUID généré : 123e4567-e89b-12d3-a456-426614174000
  • QR code disponible immédiatement

ÉTAPE 2 — SYNCHRONISATION (Mobile)
  ▼
  • Kossi rentre vers le centre du village, capte la 4G
  • SyncService détecte la connectivité
  • Upload automatique : photos + métadonnées vers Supabase
  • Vercel Function /api/lots/register :
    1. Calcule SHA-256 du GeoJSON et des photos
    2. Insère dans table public.lots
    3. Appelle smart contract registerLot() sur Polygon Amoy
    4. Reçoit blockchainTokenId = 42, txHash = 0x...
  • Retour OK → mise à jour SQLite local : is_synced = 1, server_id = uuid

ÉTAPE 3 — COLLECTE PAR COOPÉRATIVE (Web — Coopérative)
  ▼
  • Le pisteur de la coopérative arrive chez Kossi
  • Il scanne le QR code du sac avec son mobile
  • La page web /verify/uuid s'ouvre, mais le pisteur clique "Recevoir ce lot"
  • Connexion à son compte coopérative
  • Pesée de vérification : 49.85 kg saisis
  • Écart : -0.3 % → ACCEPTABLE (seuil 2 %)
  • Validation → /api/lots/transfer
    - Smart contract : transferLot(lotId=42, to=coopAddress, status=Collected)
    - Statut blockchain = Collected
  • Lot apparaît dans le dashboard de la coopérative

ÉTAPE 4 — TRANSFORMATION (Web — Transformateur)
  ▼
  • La coopérative groupe plusieurs lots (10 lots Wawa) et les envoie au transformateur
  • Transferts groupés via dashboard
  • Le transformateur reçoit, confirme, démarre fermentation 6 jours puis séchage
  • Saisie qualité : humidité 7.2 %, fermentation 6 jours, profil "fruité acide"
  • Validation transformation → statut blockchain = Processed

ÉTAPE 5 — EXPORT (Web — Exportateur)
  ▼
  • L'exportateur GEBANA reçoit les lots transformés
  • Sélection de 50 lots pour export vers Belgique
  • Clic "Générer certificat EUDR"
  • Vercel Function /api/eudr/generate-certificate :
    1. Récupère tous les GeoJSON des parcelles concernées
    2. Consolide en un seul fichier GeoJSON FeatureCollection
    3. Vérifie validation EUDR (polygones fermés, 6 décimales, etc.)
    4. Génère PDF avec hash blockchain de chaque lot
    5. Stocke sur Supabase Storage
  • Statut blockchain de chaque lot = Exported
  • Le certificat est téléchargeable + transmis avec le container

ÉTAPE 6 — VÉRIFICATION UE (Web public)
  ▼
  • L'importateur belge reçoit le container avec le certificat EUDR
  • Il scanne le QR code d'un sac aléatoire (lot 42)
  • Page /verify/uuid s'ouvre publiquement
  • Voit toute l'histoire :
    - Producteur Kossi AYITE, Wawa
    - Parcelle 2.5 ha, GeoJSON visualisable sur carte
    - Coopérative, Transformateur, Exportateur
    - Tous les hash blockchain cliquables vers Polygonscan
  • Vérifie le hash du GeoJSON → identique à celui sur blockchain
  • Marque "Lot vérifié EUDR" → transaction blockchain finale
  • Statut = Verified
```

### 16.2 Démonstration en temps réel pour le hackathon

**Durée totale du flux démontré : 5-7 minutes**

**Acteurs simulés :**
- 1 producteur (mobile sur smartphone réel projeté)
- 1 coopérative (web sur écran 1)
- 1 transformateur (web sur écran 2)
- 1 exportateur (web sur écran 3)
- 1 vérificateur UE (scan QR sur mobile + projection)

---

## 17. CONFORMITÉ EUDR

### 17.1 Exigences techniques EUDR

Le règlement EUDR (UE 2023/1115) impose, pour chaque lot exporté vers l'Union Européenne :

1. **Coordonnées GPS précises** de chaque parcelle de production
2. **Système de référence** : WGS84 (EPSG:4326) exclusivement
3. **Pour parcelles < 4 ha** : un point GPS suffit (latitude, longitude)
4. **Pour parcelles ≥ 4 ha** : polygone fermé requis (premier point = dernier point)
5. **Précision** : minimum 6 chiffres décimaux par coordonnée (~ précision métrique)
6. **Format de soumission** : GeoJSON via portail TRACES de l'UE
7. **Limites techniques** : fichier max 25 MB, pas d'auto-intersection, pas de "trous"
8. **Preuve de non-déforestation** : démontrer que la parcelle n'était pas déforestée après le 31 décembre 2020
9. **Documentation due diligence** : archivage et vérifiabilité

### 17.2 Validation côté ChainCacao

**Validation automatique avant inscription blockchain :**

```javascript
function validateGeoJsonForEUDR(geojson, areaHectares) {
  const errors = [];

  // 1. Système de référence
  if (geojson.crs && geojson.crs.properties.name !== 'EPSG:4326') {
    errors.push('Seul le système WGS84 (EPSG:4326) est accepté');
  }

  // 2. Type
  if (areaHectares < 4 && geojson.geometry.type !== 'Point') {
    errors.push('Pour < 4 ha, un point GPS est attendu');
  }
  if (areaHectares >= 4 && geojson.geometry.type !== 'Polygon') {
    errors.push('Pour ≥ 4 ha, un polygone fermé est obligatoire');
  }

  // 3. Précision décimale
  const coords = flatten(geojson.geometry.coordinates);
  for (const coord of coords) {
    const decimals = countDecimals(coord);
    if (decimals < 6) {
      errors.push(`Précision insuffisante : ${coord} (minimum 6 décimales)`);
    }
  }

  // 4. Polygone fermé
  if (geojson.geometry.type === 'Polygon') {
    const ring = geojson.geometry.coordinates[0];
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      errors.push('Polygone non fermé (premier point ≠ dernier point)');
    }
    if (ring.length < 4) {
      errors.push('Polygone invalide (minimum 4 points)');
    }
  }

  // 5. Auto-intersection (utiliser turf.js côté web)
  if (geojson.geometry.type === 'Polygon' && hasSelfIntersection(geojson)) {
    errors.push('Le polygone contient une auto-intersection');
  }

  return { isValid: errors.length === 0, errors };
}
```

### 17.3 Standard GS1 EPCIS (préparation V2)

Le standard GS1 EPCIS structure les événements de la supply chain :

| Question | Champ EPCIS | Exemple ChainCacao |
|----------|-------------|---------------------|
| **Quoi** (What) | EPC / GTIN | UUID du lot ChainCacao |
| **Où** (Where) | Read Point / GLN | Coordonnées parcelle ou GLN coopérative |
| **Quand** (When) | EventTime | Timestamp UTC de l'événement |
| **Pourquoi** (Why) | BizStep | "Harvesting", "Aggregation", "Inspection" |
| **Qui** (Who) | Source / Destination | Identifiants des acteurs |

ChainCacao adopte cette structure dès la V1 pour faciliter l'interopérabilité future avec les systèmes des importateurs européens.

### 17.4 Génération du certificat EUDR

Le PDF généré par `/api/eudr/generate-certificate` contient :

1. **En-tête** : logo ChainCacao + identité exportateur (raison sociale, adresse Lomé)
2. **Numéro de certificat** : `CC-EUDR-2026-XXXXXX`
3. **Date d'émission** + horodatage UTC
4. **Liste des lots concernés** :
   - UUID
   - Hash blockchain (lien vers Polygonscan)
   - Espèce, poids, date de récolte
   - Producteur et commune
   - Hash GeoJSON
5. **Tableau récapitulatif des parcelles** avec superficies et coordonnées
6. **Carte cartographique** des parcelles (Leaflet → image PNG)
7. **Déclaration de non-déforestation** signée numériquement
8. **Annexe technique** : structure GeoJSON exportée

---

## 18. GÉNÉRATION QR CODE ET VÉRIFICATION PUBLIQUE

### 18.1 Format du QR Code

Le QR code encode l'URL publique de vérification :

```
https://chaincacao.vercel.app/verify/<lot-uuid>
```

**Avantages de cette approche :**
- N'importe quel scanner QR mobile (pas besoin d'app dédiée)
- L'URL est lisible et partageable par d'autres canaux
- Ouverture directe dans le navigateur web

### 18.2 Génération côté Web (React)

```jsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG
  value={`https://chaincacao.vercel.app/verify/${lotId}`}
  size={256}
  level="H"
  includeMargin
  imageSettings={{
    src: "/logo-chaincacao-sans-fond.png",
    height: 48,
    width: 48,
    excavate: true
  }}
/>
```

### 18.3 Génération côté Mobile (Flutter)

```dart
QrImageView(
  data: 'https://chaincacao.vercel.app/verify/$lotId',
  version: QrVersions.auto,
  size: 256.0,
  embeddedImage: AssetImage('assets/logo-chaincacao.png'),
  embeddedImageStyle: const QrEmbeddedImageStyle(
    size: Size(48, 48),
  ),
)
```

### 18.4 Page publique `/verify/:lotId`

**Structure de la page :**

1. **Header simple** avec logo ChainCacao
2. **Titre** : "Vérification du lot CC-XXXXXX"
3. **Badge de statut** géant : "✓ Conforme EUDR" ou "✗ Non vérifié"
4. **Section 1 — Informations du lot** :
   - Espèce, poids, date de récolte
   - Producteur, coopérative, transformateur, exportateur
5. **Section 2 — Parcelle d'origine** :
   - Carte Leaflet avec polygone
   - Superficie, commune, région
6. **Section 3 — Chaîne de traçabilité** :
   - Timeline des transferts
   - Chaque transfert cliquable → détails + lien Polygonscan
7. **Section 4 — Preuves blockchain** :
   - Hash du GeoJSON (cliquable pour télécharger le fichier)
   - Hash de la transaction de création (lien Polygonscan)
   - Adresse du smart contract
8. **Footer** : "Cette page est générée automatiquement par ChainCacao..."

### 18.5 Sécurité de la vérification

- **Aucune authentification requise** (volontairement public)
- **Rate limiting** : 100 requêtes/heure par IP (Vercel Edge config)
- **Logging** : chaque vérification enregistrée dans `public.verifications` (statistiques)
- **Pas d'information personnelle sensible** affichée (RGPD)

---

## 19. PÉRIMÈTRE MVP PHASE 3

### 19.1 Ce qui DOIT être livré (obligatoire)

| # | Élément | Sous-équipe | Statut |
|---|---------|-------------|--------|
| 1 | Smart contract `ChainCacao.sol` déployé sur Polygon Amoy | Web (Komi) | ✅ |
| 2 | Tables Supabase + RLS configurées | Web (Komi) | ✅ |
| 3 | Site vitrine public (Home, About, How It Works) | Web (Sophos) | ✅ |
| 4 | Page de vérification publique `/verify/:lotId` | Web (Sophos) | ✅ |
| 5 | Auth Supabase (login/signup avec rôles) | Web + Mobile | ✅ Web · ⏳ Mobile |
| 6 | Dashboard Coopérative + réception lot + transferts | Web (Sophos) | ✅ |
| 7 | Dashboard Transformateur + saisie qualité | Web (Sophos) | 🚧 Dashboard ✅ · Saisie qualité ⏳ |
| 8 | Dashboard Exportateur + génération certificat EUDR | Web (Sophos + Komi) | ⏳ |
| 9 | Vercel Functions critiques (register-lot, transfer, verify) | Web (Komi) | ⏳ |
| 10 | App Flutter Android : login + dashboard producteur | Mobile (Bikala) | ⏳ |
| 11 | App Flutter Android : création lot + capture GPS + photos | Mobile (Anne-Marie) | ⏳ |
| 12 | App Flutter Android : enregistrement parcelle GPS | Mobile (Anne-Marie) | ⏳ |
| 13 | App Flutter Android : mode offline + SyncService | Mobile (Bikala) | ⏳ |
| 14 | Génération QR Code (web + mobile) | Web + Mobile | ✅ Web · ⏳ Mobile |
| 15 | Lecture QR Code (web + mobile) | Web + Mobile | ✅ Web (html5-qrcode, lazy) · ⏳ Mobile |
| 16 | APK Android signé téléchargeable | Mobile | ⏳ |
| 17 | Déploiement Vercel fonctionnel | Web (Komi) | ⏳ |
| 18 | Documentation technique (README, API docs) | Tous | ⏳ |
| 19 | Guide utilisateur producteur (FR, illustré) | Tous | ⏳ |
| 20 | Pitch deck 10 min + script démo live | Tous | ⏳ |

### 19.2 Ce qui peut être simulé/mocké pour la démo

- **Wallet maître ChainCacao** : un seul wallet finance toutes les transactions (pas de wallet personnel par utilisateur)
- **Comptes utilisateurs de démo** : 5 comptes pré-créés (1 par acteur), connexion en 1 clic
- **Photos** : possibilité d'uploader des photos pré-sélectionnées si caméra non disponible
- **Vérification non-déforestation** : booléen manuel V1 (V2 = intégration Global Forest Watch API)
- **TRACES UE** : génération du GeoJSON conforme V1, soumission réelle = V2

### 19.3 Ce qui est explicitement EXCLU du MVP

- ❌ Wallets blockchain personnels par acteur (V2)
- ❌ Paiements crypto entre acteurs (V2)
- ❌ Détection automatique de déforestation par satellite (V2)
- ❌ Soumission directe à TRACES UE (V2)
- ❌ Application iOS (V2 — Android prioritaire)
- ❌ Multi-langues (V2 — Français V1)
- ❌ Notifications push (V2)
- ❌ Mode visiteur sans compte sur mobile (V2)

---

## 20. DÉMO LIVE — SCRIPT DU PITCH 10 MINUTES

### 20.1 Découpage du pitch

| Temps | Section | Intervenant | Contenu |
|-------|---------|-------------|---------|
| 0:00 - 1:00 | **Hook** | Komi | Le problème : 40 000 familles, EUDR, 30-40 M$ pertes |
| 1:00 - 2:00 | **Solution** | Komi | Présentation ChainCacao + logo + slogan |
| 2:00 - 8:00 | **Démo live 5 acteurs** | Toute l'équipe | Flux complet (voir §16.2) |
| 8:00 - 9:00 | **Impact + différenciation** | Anne-Marie | ODD, comparaison concurrents |
| 9:00 - 10:00 | **Plan de déploiement** | Bikala | Phase pilote Wawa, partenariats CCFCC |

### 20.2 Découpage de la démo live (6 minutes)

```
┌─────────────────────────────────────────────────────────────┐
│  MINUTE 1 — AGRICULTEUR (Mobile)                            │
│  • Anne-Marie joue Kossi, agriculteur de Wawa               │
│  • Affiche son téléphone (mirroring sur écran)              │
│  • Crée un nouveau lot (parcelle déjà enregistrée)          │
│  • Capture GPS + photo + poids                              │
│  • SHOW : badge "Hors-ligne, sera synchronisé"              │
│  • Active le Wi-Fi → sync auto → blockchain confirmée       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MINUTE 2 — COOPÉRATIVE (Web)                               │
│  • Sophos joue le gestionnaire de coopérative               │
│  • Scan QR du lot avec sa webcam                            │
│  • Pesée de vérification (saisit 49.85 kg vs 50 kg)         │
│  • SHOW : alerte écart < 2 % acceptable                     │
│  • Validation transfert → blockchain confirmation           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MINUTE 3 — TRANSFORMATEUR (Web)                            │
│  • Sophos passe à l'écran transformateur                    │
│  • Saisit données qualité (fermentation, humidité)          │
│  • Transfert vers exportateur                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MINUTE 4-5 — EXPORTATEUR (Web) — POINT FORT                │
│  • Komi joue l'exportateur GEBANA                           │
│  • Sélectionne le lot                                       │
│  • Clique "Générer certificat EUDR"                         │
│  • Affiche le PDF généré (carte, hashes, signatures)        │
│  • Affiche le GeoJSON conforme TRACES                       │
│  • Affirme : "Ce document est légalement opposable"         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MINUTE 6 — VÉRIFICATEUR UE — CLIMAX                        │
│  • Bikala joue l'importateur belge                          │
│  • Scanne le QR code original avec son mobile               │
│  • Page /verify s'ouvre, affiche TOUT l'historique          │
│  • Clique sur le hash blockchain → ouvre Polygonscan        │
│  • SHOW : transaction réelle visible sur blockchain         │
│  • Conclusion : "100 % vérifiable, immuable, conforme EUDR" │
└─────────────────────────────────────────────────────────────┘
```

### 20.3 Plan B en cas de panne technique

- **Vidéo de secours** : enregistrement complet du flux (5 min) en cas de panne réseau
- **Données pré-créées** : tous les acteurs ont déjà un compte et au moins 1 lot test pré-rempli
- **Connexion 4G mobile** en backup du Wi-Fi de la salle
- **Transaction blockchain pré-confirmée** : 1 lot témoin déjà sur Polygonscan

---

## 21. ROADMAP V2 (EXCLUS DU MVP)

| Fonctionnalité | Priorité V2 | Effort estimé |
|----------------|-------------|---------------|
| Wallets personnels par acteur | Haute | 2-3 semaines |
| Application iOS | Haute | 2 semaines |
| Détection déforestation auto (Global Forest Watch API) | Haute | 3 semaines |
| Soumission directe à TRACES UE | Haute | 2 semaines |
| Paiements crypto entre acteurs (USDC/USDT) | Moyenne | 4 semaines |
| Multi-langues (anglais, ewé, mina) | Moyenne | 1 semaine |
| Notifications push (lots, alertes) | Moyenne | 1 semaine |
| Dashboard analytique CCFCC (Ministère) | Moyenne | 2 semaines |
| Intégration GS1 EPCIS complète | Basse | 3 semaines |
| Module formation utilisateurs intégré | Basse | 1 semaine |
| Marketplace acheteurs/exportateurs | Basse | 4 semaines |
| Migration Polygon Mainnet (production) | Haute | 1 semaine |

---

## 22. DÉCISIONS PRISES ET EN ATTENTE

### 22.1 Décisions actées

| Décision | Choix | Date | Justification |
|----------|-------|------|---------------|
| Blockchain | Polygon PoS (Amoy testnet) | Nov 2026 | EVM, écosystème mature, frais faibles, MetaMask compatible |
| Stockage off-chain | Supabase | Nov 2026 | PostgreSQL + PostGIS natif, Auth + Storage intégrés |
| Stack mobile | Flutter | Nov 2026 | Offline-first robuste, GPS rapide, performances natives |
| Acteurs simulés démo | 5 (Producteur, Coopérative, Transformateur, Exportateur, Vérificateur UE) | Nov 2026 | Démonstration valeur de bout en bout |
| Dépôt GitHub | `chaincacao-monorepo` (monorepo) | Nov 2026 | Cohérence + facilité partage `shared/` |
| Domaine | Vercel-only (`chaincacao.vercel.app`) | Nov 2026 | Pas de coût de domaine pour hackathon |
| Langue interface | Français exclusivement | Nov 2026 | Public togolais + jury MIABE |
| Palette | Verts cacao + cyans blockchain + ors terre | Nov 2026 | Inspirée du logo officiel |
| Typographies | Plus Jakarta Sans + Inter + JetBrains Mono | Nov 2026 | Modernité tech-agricole, lisibilité, données techniques |
| Wallet utilisateur V1 | Wallet maître unique ChainCacao | Nov 2026 | Simplifie UX (pas de gas pour utilisateurs) |

### 22.1 Décisions actées (complément Sessions 1-9)

| Décision | Choix | Date | Justification |
|----------|-------|------|---------------|
| Recharts pour graphiques | `recharts ^3.8.1` | Mai 2026 | BarChart + PieChart donut, bundle acceptable |
| html5-qrcode (lazy) | Import dynamique `Html5QrcodeScanner` | Mai 2026 | Évite d'alourdir le bundle initial |
| Pattern mock/Supabase | try Supabase → catch → fallback mock | Mai 2026 | Démo fonctionnelle même sans tables configurées |
| Routes coopérative | `/cooperative`, `/cooperative/lots-received`, `/cooperative/transfer-lot` | Mai 2026 | Nommage final confirmé dans App.jsx |
| Route transfert | `/cooperative/transfer-lot` (pas `/cooperative/transfer`) | Mai 2026 | Correction par rapport à spec initiale |
| SidebarContent module-level | Défini hors du composant Layout | Mai 2026 | Évite unmount/remount React à chaque re-render |
| Modal bottom-sheet mobile | `AnimatePresence` + `motion.aside` slide-up | Mai 2026 | UX mobile-first pour terrain (tablette/smartphone) |
| SelectionSummary sticky | Sidebar desktop + bottom-bar fixe mobile | Mai 2026 | Accès permanent au récapitulatif pendant sélection |
| Guard `beforeunload` | Actif si sélection lots > 0 non confirmée | Mai 2026 | Éviter perte de sélection par navigation accidentelle |
| Historique transferts lazy | Chargé uniquement au premier switch d'onglet | Mai 2026 | Optimisation réseau/Supabase |
| Pipeline transformateur | Composant `ProcessingPipeline` autonome | Mai 2026 | Réutilisable sur page saisie qualité |

### 22.2 Décisions en attente

| Décision | Statut |
|----------|--------|
| Logos SVG haute résolution (vectorisation) | ✅ Terminé |
| Création des comptes test (5 acteurs démo) | ✅ Terminé |
| Choix du nom utilisateur démo (Kossi AYITE ?) | ⏳ À valider |
| Vidéo de secours pour démo (Plan B) | ⏳ À tourner avant finale |
| Faucet MATIC Amoy (financement gas) | ✅ Terminé |
| Ouverture compte Supabase (free tier) | ✅ Terminé |
| Configuration domaine Vercel | ⏳ Komi à déployer |
| Saisie qualité transformateur (QualityEntry.jsx) | ⏳ Session suivante |
| Dashboard exportateur + certificat EUDR | ⏳ Prochaine priorité |
| Dashboard vérificateur | ⏳ À planifier |

---

## 23. HISTORIQUE DES SESSIONS

### Session 0 — Mai 2026 : Initialisation du Cahier de Référence

**Objectif** : Établir la source de vérité unique du projet ChainCacao avant le démarrage du développement Phase 3.

**Réalisations :**

- Analyse complète des documents fournis :
  - `Etude_du_terrain_-_ChainCacao.md` (étude Gemini DeepResearch)
  - `PROJET_N_1_TOGO.pdf` (cadre de référence MIABE)
  - `ChainCacao_Documentation_Probleme.pdf` (Phase 1 présélection)
- Validation des 4 décisions structurantes par l'équipe :
  1. Blockchain → Polygon PoS (Amoy testnet)
  2. Stockage off-chain → Supabase
  3. Stack mobile → Flutter
  4. Acteurs démo → 5 (Producteur, Coopérative, Transformateur, Exportateur, Vérificateur UE)
- Validation des 3 décisions complémentaires :
  1. Dépôt GitHub → `chaincacao-monorepo`
  2. Domaine → Vercel-only
  3. Langue → Français exclusivement
- Création de la palette ChainCacao inspirée du logo officiel
- Sélection des typographies (Plus Jakarta Sans + Inter + JetBrains Mono)
- Définition de l'architecture globale (Web + Mobile + Backend + Blockchain)
- Conception des schémas blockchain (smart contract Solidity)
- Conception des schémas Supabase (PostgreSQL + PostGIS)
- Définition des contrats API (anti-divergence Web/Mobile)
- Stratégie offline-first pour mobile (SQLite + SyncService)
- Répartition des responsabilités entre les 4 membres
- Structure du monorepo détaillée

**Prochaines étapes prioritaires (Session 1) :**

1. **[CRITIQUE]** Komi : créer le projet Supabase + tables + RLS [✅TERMINÉ]
2. **[CRITIQUE]** Komi : initialiser le monorepo GitHub + dossiers `web/`, `mobile/`, `contracts/`, `shared/` [✅TERMINÉ]
3. **[CRITIQUE]** Komi : déployer le smart contract `ChainCacao.sol` sur Polygon Amoy [✅TERMINÉ]
4. **[HAUTE]** Sophos : scaffolder le projet web React + Tailwind + intégration Supabase [✅TERMINÉ]
5. **[HAUTE]** Bikala : scaffolder le projet Flutter + structure dossiers + intégration Supabase
6. **[HAUTE]** Anne-Marie : créer le `theme.dart` ChainCacao + composants UI de base Flutter
7. **[MOYENNE]** Tous : créer les 5 comptes utilisateurs de démo dans Supabase [✅TERMINÉ]
8. **[MOYENNE]** Komi : faucet MATIC pour le wallet maître ChainCacao [✅TERMINÉ]
9. **[FAIBLE]** Vectorisation des logos (SVG haute résolution) [✅TERMINÉ]

---

### Session 1–4 — Mai 2026 : Scaffolding & fondations web

**Réalisations :**
- Monorepo GitHub initialisé (`web/`, `mobile/`, `contracts/`, `shared/`)
- Smart contract `ChainCacao.sol` déployé sur Polygon Amoy
- Supabase : projet créé, tables + RLS configurées, 5 comptes démo créés
- Scaffold React 19 + Vite + Tailwind CSS 4 (`@theme {}` dans `index.css`)
- Tokens couleurs : `chain-bg`, `chain-cyan`, `chain-cyan-light`, `cacao-brown`, `cacao-green`, `gold-premium`, `gold-link`, `error`, `warning`, `cream`
- Typographies configurées : `font-sans` (Plus Jakarta Sans), `font-body` (Inter), `font-mono` (JetBrains Mono)
- Intégration Supabase (`lib/supabase.js`) — throw si variables manquantes
- `.env.example` créé, `.env.local` exclu du tracking

**Fichiers clés créés :** `web/src/lib/supabase.js`, `web/index.css`, `tailwind.config.js`, `vite.config.js`

---

### Session 5 — Mai 2026 : Routing + Auth (Tâche 5)

**Réalisations :**
- `createBrowserRouter` (React Router v7) avec lazy loading sur toutes les pages rôle
- `AuthProvider` dans `hooks/useAuth.js` : lit le rôle depuis `user_metadata` puis fallback table `profiles`
- `signIn` retourne `{ data, error, role }` · `signOut` fait `window.location.replace('/')`
- `ProtectedRoute` → `RoleGuard` → `Layout` (lazy) → pages enfants (lazy)
- 4 layouts créés : `CooperativeLayout`, `ProcessorLayout`, `ExporterLayout`, `VerifierLayout`
- Pages auth complètes : `Login.jsx` (boutons démo, redirection par rôle), `Signup.jsx` (mapping libellé→rôle)
- `LoadingState.jsx` — spinner fallback Suspense
- `components/ui/Card.jsx`, `Badge.jsx` (8 variants), `components/team/TeamAvatar.jsx`

---

### Session 6 — 11 Mai 2026 : Dashboard Coopérative (Tâche 6)

**Réalisations :**
- `pages/cooperative/Dashboard.jsx` complet : header + bandeau attention + 4 KpiCards + BarChart + PieChart donut + zone travail (lots récents + top producteurs) + 3 quick actions
- `components/dashboard/KpiCard.jsx` : count-up animé `useInView` + `requestAnimationFrame` (easeOutCubic)
- `recharts ^3.8.1` installé
- `CooperativeLayout.jsx` enrichi : CTA "Réceptionner", icônes lucide sur nav, TeamAvatar, drawer mobile `AnimatePresence`
- `utils/mockCooperative.js` : données SCOOPS Wawa (pendingLots, recentLots, stats, weeklyVolume, speciesBreakdown, supplierProducers)
- `lib/api.js` : `fetchCooperativeDashboard` avec pattern Supabase-try/mock-fallback

---

### Session 7 — 11 Mai 2026 : Lots reçus coopérative (Tâche 7)

**Réalisations :**
- `pages/cooperative/LotsReceived.jsx` : liste filtrable (statut, espèce, recherche), tableau desktop / cards mobile, vue carte placeholder, query params `?action=new / ?filter=pending / ?view=map`
- 20 lots mock dans `utils/mockCooperative.js` (4 pending / 6 received / 3 alert / 7 transferred)
- Exports ajoutés : `getMockCooperativeLots(filters)`, `getMockLotByUuid(uuid)`, `getMockPendingLots()`
- `utils/format.js` créé : `formatWeight`, `formatRelativeDate`, `formatFullDate`, `formatDelta`
- `components/ui/Modal.jsx` : bottom-sheet mobile + dialog desktop, scroll-lock, focus trap, Escape key
- `components/qr/QRScanner.jsx` : html5-qrcode lazy (`import()`), facingMode environment, fallback saisie manuelle, regex UUID `\/verify\/([a-zA-Z0-9_-]+)`
- `components/cooperative/ReceptionModal.jsx` : machine 4 étapes (scan → confirm → verify → success), calcul écart temps réel, checkbox alerte > 2%, txHash mock
- `lib/api.js` : `fetchCooperativeLots`, `fetchLotByUuid`, `confirmLotReception` (délai 1500ms mock)

---

### Session 8 — 13 Mai 2026 : Transferts coopérative (Tâche 8)

**Réalisations :**
- `pages/cooperative/TransferLot.jsx` : 2 onglets (Nouveau transfert / Historique), sélection multi-lots (`Set`, O(1)), guard `beforeunload`
- `components/cooperative/ProcessorCard.jsx` : jauge capacité (vert < 70% / orange 70-90% / rouge > 90%), badges spécialités + certifications, détection incompatibilité espèces
- `components/cooperative/SelectionSummary.jsx` : sidebar desktop + bottom-bar fixe mobile
- `components/cooperative/TransferConfirmModal.jsx` : 4 étapes (confirm → executing → success | error), messages rotatifs blockchain toutes les 600ms, animation check vert
- `utils/mockCooperative.js` enrichi : `MOCK_PROCESSORS` (4 transformateurs région Plateaux), 8 transferts historiques, `getMockProcessors()`, `getMockTransferHistory()`, `getMockTransferableLots()`
- `lib/api.js` : `fetchProcessors`, `fetchTransferableLots`, `fetchTransferHistory`, `executeBatchTransfer` (délai 2000ms mock + txHash 64 hex)
- Historique onglet chargement lazy (au premier switch seulement)

---

### Session 9 — 13 Mai 2026 : Dashboard Transformateur (Tâche 9)

**Réalisations :**
- `pages/processor/Dashboard.jsx` complet : header + bandeau attention (pending/alertes/prêts) + 4 KpiCards + Pipeline + BarChart hebdo + donut Grade A/B/C + activité récente (timeline) + lots alertes + 3 quick actions
- `components/processor/ProcessingPipeline.jsx` : 4 étapes (Reçus/Fermentation/Séchage/Prêts), horizontal desktop + vertical mobile, count-up animé par étape, stagger 0.1s, hints contextuels, lien `/processor/quality-entry?filter=`
- `ProcessorLayout.jsx` enrichi : même pattern que CooperativeLayout (drawer mobile, TeamAvatar, CTA "Saisir qualité", 4 navlinks avec icônes)
- `utils/mockProcessor.js` créé : profil ATC Kpalimé, 18 lots (4 received / 6 fermenting / 5 drying / 3 processed), stats mensuelles, pipeline, weeklyProduction, qualityGrades (A/B/C), recentActivity (10 événements), alertLots
- `lib/api.js` : `fetchProcessorDashboard` avec pattern Supabase-try/fallback mock

**État du build** : ✅ 2855 modules, 0 erreurs, 2.35s

**Prochaines étapes (Session 10+) :**
1. **[CRITIQUE]** `QualityEntry.jsx` — saisie données qualité transformateur (fermentation, séchage, grade)
2. **[HAUTE]** `Dashboard.jsx` exportateur — pipeline export + certificat EUDR
3. **[HAUTE]** Déploiement Vercel initial (pour tests d'intégration)
4. **[MOYENNE]** `LotsIncoming.jsx` transformateur — réception lots depuis coopérative
5. **[MOYENNE]** Dashboard vérificateur

---

## 24. CONTACTS ÉQUIPE

| Membre | Rôle | Sous-équipe | Email | Établissement |
|--------|------|-------------|-------|---------------|
| **EDOH BEDI Komi Godwin** | Développeur Web + Architecture | Web | edohbedigodwin@gmail.com | EPL |
| **FOLIKPO-AWUTE Dzogoedzikpe Sophos** | Développeur Web | Web | (à compléter) | IAI Togo |
| **KOUYOM Bikala** | Développeur Mobile | Mobile | (à compléter) | Lomé Business School |
| **QUENUM Abla Anne-Marie** | Développeuse Mobile | Mobile | (à compléter) | ESA |

**Coordination quotidienne** : Groupe WhatsApp TG-16
**Hackathon** : Miabé Hackathon 2026 — Darollo Technologies Corporation (DTC)
**Site officiel hackathon** : www.miabehackathon.com

---

*Dernière mise à jour : 13 Mai 2026 — Session 9 : Dashboard transformateur (ATC Kpalimé)*
*Ce document évolue avec le projet — toute modification doit être datée et consignée dans la section 23.*
*Source de vérité unique du projet ChainCacao à respecter.*
