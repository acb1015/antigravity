#!/usr/bin/env bash
set -e

echo "🚀 Installing Antigravity Custom Modes & Complete UI Environment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR
TARGET_DIR="${HOME}/.gemini/config"

# 1. Antigravity AI Customizations (~/.gemini/config)
echo "[1/3] Installing AI Modes (/1-ask, /2-plan, /3-goal, /4-agent)..."
mkdir -p "${TARGET_DIR}/rules"
mkdir -p "${TARGET_DIR}/workflows"
mkdir -p "${TARGET_DIR}/global_workflows"

# Clean up legacy skills
rm -rf "${TARGET_DIR}/skills/agent" "${TARGET_DIR}/skills/ask" "${TARGET_DIR}/skills/plan"
rm -rf "${TARGET_DIR}/workflows/"* "${TARGET_DIR}/global_workflows/"*

cp "${SCRIPT_DIR}/config/GEMINI.md" "${TARGET_DIR}/GEMINI.md"
cp "${SCRIPT_DIR}/config/AGENTS.md" "${TARGET_DIR}/AGENTS.md"
cp "${SCRIPT_DIR}/config/rules/"*.md "${TARGET_DIR}/rules/"
cp "${SCRIPT_DIR}/config/workflows/"*.md "${TARGET_DIR}/workflows/"
cp "${SCRIPT_DIR}/config/global_workflows/"*.md "${TARGET_DIR}/global_workflows/"
echo "  ✓ AI Modes installed to ${TARGET_DIR}."

# 2. Antigravity Dedicated Mode Selector UI Extension (~/.antigravity-ide/extensions)
echo "[2/3] Installing Antigravity Dedicated Mode Selector UI Extension..."
EXT_TARGET_DIR="${HOME}/.antigravity-ide/extensions"
mkdir -p "${EXT_TARGET_DIR}/antigravity-mode-selector/media"
cp -r "${SCRIPT_DIR}/extension/antigravity-mode-selector/"* "${EXT_TARGET_DIR}/antigravity-mode-selector/"

# Register extension in extensions.json if python3 available
if command -v python3 >/dev/null 2>&1; then
python3 - << 'PYEOF'
import json, os
ext_json_path = os.path.expanduser("~/.antigravity-ide/extensions/extensions.json")
if os.path.exists(ext_json_path):
    try:
        with open(ext_json_path, "r") as f:
            data = json.load(f)
        exists = any(item.get("identifier", {}).get("id") == "acb.antigravity-mode-selector" for item in data)
        if not exists:
            data.append({
                "identifier": {"id": "acb.antigravity-mode-selector", "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"},
                "version": "1.0.0",
                "location": {"$mid": 1, "path": os.path.expanduser("~/.antigravity-ide/extensions/antigravity-mode-selector"), "scheme": "file"},
                "relativeLocation": "antigravity-mode-selector",
                "metadata": {"installedTimestamp": 1789638500000, "pinned": False, "source": "local", "publisherId": "acb", "publisherDisplayName": "acb", "targetPlatform": "universal", "updated": False, "private": False, "isPreReleaseVersion": False, "hasPreReleaseVersion": False}
            })
            with open(ext_json_path, "w") as f:
                json.dump(data, f, indent=2)
    except Exception as e:
        print("  Notice: extensions.json update skipped:", e)
PYEOF
fi
echo "  ✓ Dedicated Mode UI Extension installed."

# 3. Antigravity IDE Editor Settings & Keybindings (Tab Autocomplete)
echo "[3/3] Configuring IDE Editor (Tab auto-completion & zero-delay suggestions)..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    export IDE_USER_DIR="${HOME}/Library/Application Support/Antigravity IDE/User"
else
    export IDE_USER_DIR="${HOME}/.config/Antigravity IDE/User"
fi

mkdir -p "${IDE_USER_DIR}"

if command -v python3 >/dev/null 2>&1; then
python3 - << 'PYEOF'
import json, os

ide_user_dir = os.environ.get("IDE_USER_DIR")
script_dir = os.environ.get("SCRIPT_DIR")

# Settings.json
source_settings_path = os.path.join(script_dir, "ide", "settings.json")
target_settings_path = os.path.join(ide_user_dir, "settings.json")

target_data = {}
if os.path.exists(target_settings_path):
    try:
        with open(target_settings_path, 'r', encoding='utf-8') as f:
            target_data = json.load(f)
    except Exception:
        target_data = {}

if os.path.exists(source_settings_path):
    with open(source_settings_path, 'r', encoding='utf-8') as f:
        source_data = json.load(f)
    target_data.update(source_data)

with open(target_settings_path, 'w', encoding='utf-8') as f:
    json.dump(target_data, f, indent=4, ensure_ascii=False)
print("  ✓ IDE settings.json configured.")

# Keybindings.json
source_kb_path = os.path.join(script_dir, "ide", "keybindings.json")
target_kb_path = os.path.join(ide_user_dir, "keybindings.json")

target_kb = []
if os.path.exists(target_kb_path):
    try:
        with open(target_kb_path, 'r', encoding='utf-8') as f:
            target_kb = json.load(f)
    except Exception:
        target_kb = []

if os.path.exists(source_kb_path):
    with open(source_kb_path, 'r', encoding='utf-8') as f:
        source_kb = json.load(f)
    
    for item in source_kb:
        if not any(k.get("command") == item.get("command") and k.get("key") == item.get("key") for k in target_kb):
            target_kb.append(item)

with open(target_kb_path, 'w', encoding='utf-8') as f:
    json.dump(target_kb, f, indent=4, ensure_ascii=False)
print("  ✓ IDE keybindings.json configured.")
PYEOF
else
    cp "${SCRIPT_DIR}/ide/settings.json" "${IDE_USER_DIR}/settings.json"
    cp "${SCRIPT_DIR}/ide/keybindings.json" "${IDE_USER_DIR}/keybindings.json"
fi

echo ""
echo "✅ All Antigravity AI modes, Dedicated UI extension & Tab autocomplete installed successfully!"
echo "💡 Tip: In Antigravity IDE, press Cmd+Shift+P -> 'Developer: Reload Window' to apply immediately."
