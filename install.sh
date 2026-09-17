#!/usr/bin/env bash
set -e

echo "🚀 Installing Antigravity Custom Modes (/agent, /ask, /plan)..."

TARGET_DIR="${HOME}/.gemini/config"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure target directories exist
mkdir -p "${TARGET_DIR}/rules"
mkdir -p "${TARGET_DIR}/workflows"
mkdir -p "${TARGET_DIR}/global_workflows"
mkdir -p "${TARGET_DIR}/skills/agent"
mkdir -p "${TARGET_DIR}/skills/ask"
mkdir -p "${TARGET_DIR}/skills/plan"

# Copy global instruction files
cp "${SCRIPT_DIR}/config/GEMINI.md" "${TARGET_DIR}/GEMINI.md"
cp "${SCRIPT_DIR}/config/AGENTS.md" "${TARGET_DIR}/AGENTS.md"

# Copy rules
cp "${SCRIPT_DIR}/config/rules/modes.md" "${TARGET_DIR}/rules/modes.md"

# Copy workflows
cp "${SCRIPT_DIR}/config/workflows/"*.md "${TARGET_DIR}/workflows/"
cp "${SCRIPT_DIR}/config/global_workflows/"*.md "${TARGET_DIR}/global_workflows/"

# Copy skills
cp "${SCRIPT_DIR}/config/skills/agent/SKILL.md" "${TARGET_DIR}/skills/agent/SKILL.md"
cp "${SCRIPT_DIR}/config/skills/ask/SKILL.md" "${TARGET_DIR}/skills/ask/SKILL.md"
cp "${SCRIPT_DIR}/config/skills/plan/SKILL.md" "${TARGET_DIR}/skills/plan/SKILL.md"

echo "✅ Antigravity custom modes installed successfully to ${TARGET_DIR}!"
echo "✨ Available Modes:"
echo "   - (Default)  : Full Agent mode (/agent)"
echo "   - /ask       : Read-only Q&A mode"
echo "   - /plan      : Planning and design review mode"
echo "   - /agent     : Explicit full autonomous execution mode"
