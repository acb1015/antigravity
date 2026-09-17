# PowerShell installer for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing Antigravity Custom Modes & Complete UI Environment..." -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$TargetDir = Join-Path $env:USERPROFILE ".gemini\config"

# 1. AI Customizations (~/.gemini/config)
Write-Host "[1/3] Installing AI Modes (/1-ask, /2-plan, /3-goal, /4-agent)..." -ForegroundColor Yellow

$Dirs = @(
    "$TargetDir\rules",
    "$TargetDir\workflows",
    "$TargetDir\global_workflows"
)

foreach ($Dir in $Dirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

# Remove legacy skills
$LegacySkills = @(
    "$TargetDir\skills\agent",
    "$TargetDir\skills\ask",
    "$TargetDir\skills\plan"
)
foreach ($Skill in $LegacySkills) {
    if (Test-Path $Skill) {
        Remove-Item -Path $Skill -Recurse -Force
    }
}

Get-ChildItem -Path "$TargetDir\workflows\*" -Include *.md | Remove-Item -Force
Get-ChildItem -Path "$TargetDir\global_workflows\*" -Include *.md | Remove-Item -Force

Copy-Item "$ScriptDir\config\GEMINI.md" "$TargetDir\GEMINI.md" -Force
Copy-Item "$ScriptDir\config\AGENTS.md" "$TargetDir\AGENTS.md" -Force
Copy-Item "$ScriptDir\config\rules\*.md" "$TargetDir\rules\" -Force
Copy-Item "$ScriptDir\config\workflows\*.md" "$TargetDir\workflows\" -Force
Copy-Item "$ScriptDir\config\global_workflows\*.md" "$TargetDir\global_workflows\" -Force
Write-Host "  ✓ AI Modes installed to $TargetDir." -ForegroundColor Green

# 2. Antigravity Dedicated Mode Selector UI Extension
Write-Host "[2/3] Installing Antigravity Dedicated Mode Selector UI Extension..." -ForegroundColor Yellow
$ExtTargetDir = Join-Path $env:USERPROFILE ".antigravity-ide\extensions\antigravity-mode-selector"
if (-not (Test-Path $ExtTargetDir)) {
    New-Item -ItemType Directory -Path $ExtTargetDir -Force | Out-Null
}
Copy-Item "$ScriptDir\extension\antigravity-mode-selector\*" $ExtTargetDir -Recurse -Force
Write-Host "  ✓ Dedicated Mode UI Extension installed." -ForegroundColor Green

# 3. IDE Editor Settings (Tab Autocomplete)
Write-Host "[3/3] Configuring IDE Editor (Tab auto-completion & zero-delay suggestions)..." -ForegroundColor Yellow
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
Write-Host "✅ All Antigravity AI modes, Dedicated UI extension & Tab autocomplete installed successfully!" -ForegroundColor Green
Write-Host "💡 Tip: In Antigravity IDE, press Ctrl+Shift+P -> 'Developer: Reload Window' to apply immediately." -ForegroundColor Cyan
