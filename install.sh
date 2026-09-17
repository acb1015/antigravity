#!/usr/bin/env bash
set -e

echo "🚀 Installing Antigravity Custom Modes & IDE Configuration..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR
TARGET_DIR="${HOME}/.gemini/config"

# 1. Antigravity AI Customizations (~/.gemini/config)
echo "[1/2] Installing AI Modes (/agent, /ask, /plan)..."
mkdir -p "${TARGET_DIR}/rules"
mkdir -p "${TARGET_DIR}/workflows"
mkdir -p "${TARGET_DIR}/global_workflows"
mkdir -p "${TARGET_DIR}/skills/agent"
mkdir -p "${TARGET_DIR}/skills/ask"
mkdir -p "${TARGET_DIR}/skills/plan"

cp "${SCRIPT_DIR}/config/GEMINI.md" "${TARGET_DIR}/GEMINI.md"
cp "${SCRIPT_DIR}/config/AGENTS.md" "${TARGET_DIR}/AGENTS.md"
cp "${SCRIPT_DIR}/config/rules/modes.md" "${TARGET_DIR}/rules/modes.md"
cp "${SCRIPT_DIR}/config/workflows/"*.md "${TARGET_DIR}/workflows/"
cp "${SCRIPT_DIR}/config/global_workflows/"*.md "${TARGET_DIR}/global_workflows/"
cp "${SCRIPT_DIR}/config/skills/agent/SKILL.md" "${TARGET_DIR}/skills/agent/SKILL.md"
cp "${SCRIPT_DIR}/config/skills/ask/SKILL.md" "${TARGET_DIR}/skills/ask/SKILL.md"
cp "${SCRIPT_DIR}/config/skills/plan/SKILL.md" "${TARGET_DIR}/skills/plan/SKILL.md"
echo "  ✓ AI Modes installed to ${TARGET_DIR}."

# 2. Antigravity IDE Editor Settings & Keybindings (Tab Autocomplete)
echo "[2/2] Configuring IDE Editor (Tab auto-completion & zero-delay suggestions)..."
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
print("  ✓ IDE settings.json (Tab autocomplete & zero delay) configured.")

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
print("  ✓ IDE keybindings.json (Tab priority on suggestions) configured.")
PYEOF
else
    # Fallback to direct copy
    cp "${SCRIPT_DIR}/ide/settings.json" "${IDE_USER_DIR}/settings.json"
    cp "${SCRIPT_DIR}/ide/keybindings.json" "${IDE_USER_DIR}/keybindings.json"
    echo "  ✓ IDE settings & keybindings copied to ${IDE_USER_DIR}."
fi

echo ""
echo "✅ All Antigravity AI modes & Tab autocomplete settings installed successfully!"
echo "💡 Tip: In Antigravity IDE, press Cmd+Shift+P -> 'Developer: Reload Window' to apply immediately."
