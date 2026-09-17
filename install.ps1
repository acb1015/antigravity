# PowerShell installer for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing Antigravity Custom Modes (/agent, /ask, /plan)..." -ForegroundColor Cyan

$TargetDir = Join-Path $env:USERPROFILE ".gemini\config"
$ScriptDir = $PSScriptRoot

# Ensure target directories exist
$Dirs = @(
    "$TargetDir\rules",
    "$TargetDir\workflows",
    "$TargetDir\global_workflows",
    "$TargetDir\skills\agent",
    "$TargetDir\skills\ask",
    "$TargetDir\skills\plan"
)

foreach ($Dir in $Dirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

# Copy global instruction files
Copy-Item "$ScriptDir\config\GEMINI.md" "$TargetDir\GEMINI.md" -Force
Copy-Item "$ScriptDir\config\AGENTS.md" "$TargetDir\AGENTS.md" -Force

# Copy rules
Copy-Item "$ScriptDir\config\rules\modes.md" "$TargetDir\rules\modes.md" -Force

# Copy workflows
Copy-Item "$ScriptDir\config\workflows\*.md" "$TargetDir\workflows\" -Force
Copy-Item "$ScriptDir\config\global_workflows\*.md" "$TargetDir\global_workflows\" -Force

# Copy skills
Copy-Item "$ScriptDir\config\skills\agent\SKILL.md" "$TargetDir\skills\agent\SKILL.md" -Force
Copy-Item "$ScriptDir\config\skills\ask\SKILL.md" "$TargetDir\skills\ask\SKILL.md" -Force
Copy-Item "$ScriptDir\config\skills\plan\SKILL.md" "$TargetDir\skills\plan\SKILL.md" -Force

Write-Host "✅ Antigravity custom modes installed successfully to $TargetDir!" -ForegroundColor Green
Write-Host "✨ Available Modes:" -ForegroundColor Yellow
Write-Host "   - (Default)  : Full Agent mode (/agent)"
Write-Host "   - /ask       : Read-only Q&A mode"
Write-Host "   - /plan      : Planning and design review mode"
Write-Host "   - /agent     : Explicit full autonomous execution mode"
