# PowerShell installer for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing Antigravity Custom Modes & IDE Configuration..." -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$TargetDir = Join-Path $env:USERPROFILE ".gemini\config"

# 1. AI Customizations (~/.gemini/config)
Write-Host "[1/2] Installing AI Modes (/agent, /ask, /plan)..." -ForegroundColor Yellow

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

Copy-Item "$ScriptDir\config\GEMINI.md" "$TargetDir\GEMINI.md" -Force
Copy-Item "$ScriptDir\config\AGENTS.md" "$TargetDir\AGENTS.md" -Force
Copy-Item "$ScriptDir\config\rules\*.md" "$TargetDir\rules\" -Force
Copy-Item "$ScriptDir\config\workflows\*.md" "$TargetDir\workflows\" -Force
Copy-Item "$ScriptDir\config\global_workflows\*.md" "$TargetDir\global_workflows\" -Force
Copy-Item "$ScriptDir\config\skills\agent\SKILL.md" "$TargetDir\skills\agent\SKILL.md" -Force
Copy-Item "$ScriptDir\config\skills\ask\SKILL.md" "$TargetDir\skills\ask\SKILL.md" -Force
Copy-Item "$ScriptDir\config\skills\plan\SKILL.md" "$TargetDir\skills\plan\SKILL.md" -Force
Write-Host "  ✓ AI Modes installed to $TargetDir." -ForegroundColor Green

# 2. IDE Editor Settings (Tab Autocomplete)
Write-Host "[2/2] Configuring IDE Editor (Tab auto-completion & zero-delay suggestions)..." -ForegroundColor Yellow
$IdeUserDir = Join-Path $env:APPDATA "Antigravity IDE\User"
if (-not (Test-Path $IdeUserDir)) {
    New-Item -ItemType Directory -Path $IdeUserDir -Force | Out-Null
}

$TargetSettingsPath = Join-Path $IdeUserDir "settings.json"
$SourceSettingsPath = Join-Path $ScriptDir "ide\settings.json"

if (Test-Path $SourceSettingsPath) {
    if (Test-Path $TargetSettingsPath) {
        $existing = Get-Content $TargetSettingsPath -Raw | ConvertFrom-Json
    } else {
        $existing = [PSCustomObject]@{}
    }
    $newSettings = Get-Content $SourceSettingsPath -Raw | ConvertFrom-Json
    foreach ($prop in $newSettings.PSObject.Properties) {
        $existing | Add-Member -NotePropertyName $prop.Name -NotePropertyValue $prop.Value -Force
    }
    $existing | ConvertTo-Json -Depth 10 | Set-Content $TargetSettingsPath -Encoding UTF8
    Write-Host "  ✓ IDE settings.json configured." -ForegroundColor Green
}

$TargetKbPath = Join-Path $IdeUserDir "keybindings.json"
$SourceKbPath = Join-Path $ScriptDir "ide\keybindings.json"
Copy-Item $SourceKbPath $TargetKbPath -Force
Write-Host "  ✓ IDE keybindings.json (Tab priority on suggestions) configured." -ForegroundColor Green

Write-Host ""
Write-Host "✅ All Antigravity AI modes & Tab autocomplete settings installed successfully!" -ForegroundColor Green
Write-Host "💡 Tip: In Antigravity IDE, press Ctrl+Shift+P -> 'Developer: Reload Window' to apply immediately." -ForegroundColor Cyan
