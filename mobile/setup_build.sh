#!/usr/bin/env bash
# =============================================================================
# ChainCacao Mobile — Setup & Build Script
# Génère le projet Android complet, configure la signature et produit l'APK.
#
# Usage:
#   chmod +x setup_build.sh
#   ./setup_build.sh
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Couleurs ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[setup]${NC} $1"; }
ok()   { echo -e "${GREEN}[ok]${NC} $1"; }
fail() { echo -e "${RED}[erreur]${NC} $1"; exit 1; }

# ── 1. Vérifications ──────────────────────────────────────────────────────────
log "Vérification des prérequis..."
command -v flutter >/dev/null 2>&1 || fail "Flutter non trouvé. Installe Flutter SDK et réessaie."
command -v keytool >/dev/null 2>&1 || fail "keytool non trouvé. Installe JDK (java-17-openjdk-amd64)."
ok "Flutter $(flutter --version --machine 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('flutterVersion','?'))" 2>/dev/null || flutter --version | head -1)"

# ── 2. Générer le scaffold Android/iOS ────────────────────────────────────────
if [ ! -d "android" ]; then
  log "Génération du scaffold Flutter (flutter create)..."
  # --project-name doit correspondre au nom dans pubspec.yaml
  flutter create . \
    --project-name chaincacao_mobile \
    --org com.chaincacao \
    --platforms android \
    --no-overwrite
  ok "Scaffold Android généré"
else
  ok "Dossier android/ déjà présent — scaffold ignoré"
fi

# ── 3. Générer le keystore de signature ───────────────────────────────────────
KEYSTORE_PATH="$SCRIPT_DIR/android/chaincacao.keystore"
KEY_ALIAS="chaincacao"
KEY_PASSWORD="ChainCacao2026!"
STORE_PASSWORD="ChainCacao2026!"

if [ ! -f "$KEYSTORE_PATH" ]; then
  log "Génération du keystore Android..."
  keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$STORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=ChainCacao, OU=Hackathon, O=ChainCacao TG, L=Lome, S=Maritime, C=TG" \
    -noprompt
  ok "Keystore généré : $KEYSTORE_PATH"
else
  ok "Keystore déjà présent — génération ignorée"
fi

# ── 4. Créer key.properties ───────────────────────────────────────────────────
KEY_PROPS="$SCRIPT_DIR/android/key.properties"
cat > "$KEY_PROPS" <<EOF
storePassword=$STORE_PASSWORD
keyPassword=$KEY_PASSWORD
keyAlias=$KEY_ALIAS
storeFile=chaincacao.keystore
EOF
ok "android/key.properties créé"

# ── 5. Patcher android/app/build.gradle avec la config de signature ───────────
BUILD_GRADLE="$SCRIPT_DIR/android/app/build.gradle"

# Injecter la lecture de key.properties avant le bloc android {}
if ! grep -q "key.properties" "$BUILD_GRADLE" 2>/dev/null; then
  log "Injection de la config de signature dans build.gradle..."

  # Créer une version patchée
  python3 - "$BUILD_GRADLE" <<'PYTHON'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

signing_header = '''
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

'''

signing_config_block = '''
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
'''

build_types_patch = '''
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
'''

# Insérer avant le bloc android {
content = re.sub(r'(android\s*\{)', signing_header + r'\1', content, count=1)

# Insérer signingConfigs avant buildTypes (ou defaultConfig)
if 'signingConfigs' not in content:
    content = re.sub(r'(\s*defaultConfig\s*\{)', signing_config_block + r'\1', content, count=1)

# Remplacer le bloc buildTypes existant
if 'buildTypes' in content:
    content = re.sub(r'\s*buildTypes\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}', build_types_patch, content, count=1)

with open(path, 'w') as f:
    f.write(content)

print("build.gradle patché avec succès")
PYTHON

  ok "android/app/build.gradle mis à jour avec la config de signature"
else
  ok "build.gradle déjà configuré pour la signature"
fi

# ── 6. Vérifier que le projet compile ─────────────────────────────────────────
log "Récupération des dépendances Flutter..."
flutter pub get

log "Analyse statique rapide..."
flutter analyze --no-fatal-infos 2>&1 | tail -5 || true

# ── 7. Build APK release ──────────────────────────────────────────────────────
log "Build APK release..."
flutter build apk --release --target-platform android-arm64

APK_PATH="$SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk"
if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -sh "$APK_PATH" | cut -f1)
  ok "APK générée : $APK_PATH ($APK_SIZE)"
  echo ""
  echo -e "${GREEN}=== BUILD RÉUSSI ===${NC}"
  echo "APK disponible pour distribution :"
  echo "  $APK_PATH"
  echo ""
  echo "Pour installer sur un device connecté :"
  echo "  adb install $APK_PATH"
else
  fail "APK non trouvée après le build. Vérifie les erreurs ci-dessus."
fi
