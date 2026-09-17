const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MODES = {
  ask: {
    id: 'ask',
    name: 'Ask 모드',
    badgeText: '$(shield) AI: ASK',
    fullName: 'Ask 모드 (읽기 전용)',
    badgeColor: 'statusBarItem.warningBackground',
    icon: '🛡️',
    desc: '파일 수정 및 명령어 실행 절대 금지 (순수 질의응답 및 설명)',
    permissions: '읽기 전용 (수정/실행 금지)',
    ruleContent: `---
description: Current active AI mode selected from UI (Ask Mode)
always_on: true
---

# [UI ACTIVE MODE: ASK MODE (읽기 전용)]
현재 사용자가 Antigravity 전용 UI 패널에서 [Ask 모드]를 활성화했습니다.
- **파일 수정/생성 도구 절대 금지**: write_to_file, replace_file_content, multi_replace_file_content 등 어떠한 파일 수정 도구도 호출하지 마세요.
- **터미널 명령어 직접 실행 절대 금지**: run_command를 직접 실행하지 마세요.
- **허용 도구**: view_file, list_dir, grep_search 등 순수 읽기 도구만 허용됩니다.
- **응답 규칙**: [🛡️ ASK MODE] 같은 인위적인 대괄호 배지나 태그는 일절 출력하지 마세요. 파일 수정이나 실행 요청이 들어오면 자연스럽게 "현재 Ask 모드(읽기 전용)라서 직접 수정하지 못합니다"와 같이 친절한 대화체 문장으로 안내하고, 필요한 제안 코드 블록을 제공하세요.`
  },
  plan: {
    id: 'plan',
    name: 'Plan 모드',
    badgeText: '$(book) AI: PLAN',
    fullName: 'Plan 모드 (계획 수립)',
    badgeColor: undefined,
    icon: '📝',
    desc: '코드 작성 전 상세 기획서 및 구현 계획 승인',
    permissions: '기획서 작성 후 승인 대기',
    ruleContent: `---
description: Current active AI mode selected from UI (Plan Mode)
always_on: true
---

# [UI ACTIVE MODE: PLAN MODE (계획 수립)]
현재 사용자가 Antigravity 전용 UI 패널에서 [Plan 모드]를 활성화했습니다.
- **즉시 코드 작성 금지**: 바로 파일을 수정하거나 코드를 작성하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경할 파일 목록, 핵심 로직 및 검증 계획을 포함한 기획서를 먼저 작성하여 사용자 승인을 요청하세요.
- **응답 규칙**: 인위적인 대괄호 배지는 출력하지 말고, 자연스러운 문장으로 계획을 제시하세요.`
  },
  goal: {
    id: 'goal',
    name: 'Goal 모드',
    badgeText: '$(target) AI: GOAL',
    fullName: 'Goal 모드 (목표 완수)',
    badgeColor: undefined,
    icon: '🎯',
    desc: '목표가 100% 달성될 때까지 포기하지 않고 자율 완수',
    permissions: '자율 디버깅 & 테스트 무제한 완수',
    ruleContent: `---
description: Current active AI mode selected from UI (Goal Mode)
always_on: true
---

# [UI ACTIVE MODE: GOAL MODE (목표 완수)]
현재 사용자가 Antigravity 전용 UI 패널에서 [Goal 모드]를 활성화했습니다.
- **철저한 목표 완수**: 사용자의 목표가 완전히 달성될 때까지 스스로 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 수행하세요.
- **응답 규칙**: 인위적인 대괄호 배지는 출력하지 말고, 목표 완수를 위한 과정을 진행하세요.`
  },
  agent: {
    id: 'agent',
    name: 'Agent 모드',
    badgeText: '$(zap) AI: AGENT',
    fullName: 'Agent 모드 (전권 자율)',
    badgeColor: undefined,
    icon: '⚡',
    desc: '모든 권한 자율 활용 (파일 생성/수정, 터미널 실행)',
    permissions: '전권 자율 실행 (기본 모드)',
    ruleContent: `---
description: Current active AI mode selected from UI (Agent Mode)
always_on: true
---

# [UI ACTIVE MODE: AGENT MODE (전권 자율 실행)]
현재 사용자가 Antigravity 전용 UI 패널에서 [Agent 모드]를 활성화했습니다.
- **모든 권한 자율 활용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행 등을 스스로 판단하여 적극적으로 완수하세요.
- **응답 규칙**: 인위적인 대괄호 배지 없이 자연스럽게 요청 작업을 자율적으로 수행하고 보고하세요.`
  }
};

let currentMode = 'ask';
let statusBarItem;
let currentWebviewView = null;
let extContext = null;

function generateFullGeminiRule(modeId) {
  let section0 = '';
  if (modeId === 'ask') {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Ask\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Ask 모드(읽기 전용)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Ask 모드로 동작**해야 합니다.
- **파일 생성 및 수정 절대 금지**: \`write_to_file\`, \`replace_file_content\`, \`multi_replace_file_content\` 등 어떤 파일 수정/생성/삭제 도구도 절대로 호출하지 마세요.
- **터미널 명령어 직접 실행 절대 금지**: \`run_command\` 등 터미널 명령어를 직접 실행하지 마세요.
- **허용 도구**: 파일 읽기(\`view_file\`), 디렉터리 확인(\`list_dir\`), 검색(\`grep_search\`) 등 순수 읽기/조회 도구만 허용됩니다.
- **터미널 실행이 필요한 경우**: 환경 확인이나 상태 조회가 꼭 필요한 경우에도 절대 직접 실행하지 말고, 사용자가 직접 복사해서 실행할 수 있도록 명령어와 이유만 코드 블록으로 안내하세요.
- **응답 방식**: 마크다운 텍스트, 설명, 제안 코드 블록으로만 답변하세요. [🛡️ ASK MODE] 같은 인위적인 대괄호 배지나 태그는 일절 출력하지 말고, 코드 수정 요청 시 "현재 Ask 모드(읽기 전용)이므로 파일을 직접 수정하지 않습니다."라고 친절한 대화체로 정중히 설명하고 제안 코드 블록을 제공하세요.`;
  } else if (modeId === 'plan') {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Plan\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Plan 모드(계획 수립)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Plan 모드로 동작**해야 합니다.
- **즉각적인 코드 작성 금지**: 파일 수정이나 코드 작성을 바로 시작하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증(테스트) 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시하세요.
- **승인 후 실행**: 사용자에게 계획을 공유하고 질문 또는 승인을 요청하세요. 사용자가 계획을 확인하고 승인한 후에 비로소 실행 단계(Agent)로 넘어갑니다.`;
  } else if (modeId === 'goal') {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Goal\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Goal 모드(목표 완수)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Goal 모드로 동작**해야 합니다.
- 사용자가 설정한 목표가 100% 달성될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 수행하세요.
- 복잡하거나 시간이 걸리는 작업에 적합합니다.`;
  } else {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Agent\` 모드 적용 (기본 전권 자율)
- 현재 Antigravity UI에서 사용자가 **Agent 모드(전권 자율)**를 선택해 두었습니다.
- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.`;
  }

  return `# AI Interaction Modes Guidelines

어떤 경로, 어떤 프로젝트에서 작업하든 상관없이 다음 규칙을 **최우선이자 엄격하게 준수**해야 합니다.

---

${section0}

---

## 1. \`Ask\` 모드 (\`/ask\`, \`/1-ask\` - Cursor Ask 모드와 동일)
사용자 메시지 맨 앞 또는 본문에 \`/ask\` 또는 \`/1-ask\`가 포함되었거나, 현재 세션이 ask 모드로 고정된 경우 발동되는 순수 질의응답/읽기 전용 모드입니다.

- **파일 생성 및 수정 절대 금지**: \`write_to_file\`, \`replace_file_content\`, \`multi_replace_file_content\` 등 어떤 파일 수정/생성/삭제 도구도 절대로 호출하지 마세요.
- **터미널 명령어 직접 실행 절대 금지**: \`run_command\` 등 터미널 명령어를 직접 실행하지 마세요.
- **허용 도구**: 파일 읽기(\`view_file\`), 디렉터리 확인(\`list_dir\`), 검색(\`grep_search\`) 등 순수 읽기/조회 도구만 허용됩니다.
- **터미널 실행이 필요한 경우**: 환경 확인(가상환경, 패키지 등)이나 상태 조회가 꼭 필요한 경우에도 **절대 직접 실행하지 말고**, 사용자에게 실행해야 할 명령어와 이유를 코드 블록으로 안내하여 실행을 요청하세요.
- **응답 방식**: 마크다운 텍스트, 설명, 제안 코드 블록(사용자가 직접 복사해서 쓸 수 있는 형태)으로만 답변하세요.

---

## 2. \`Plan\` 모드 (\`/plan\`, \`/2-plan\` - Planning 모드)
코드 구현 전에 상세 계획을 수립하고 사용자의 승인을 받는 기획/계획 모드입니다.

- **즉각적인 코드 작성 금지**: 파일 수정이나 코드 작성을 바로 시작하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증(테스트) 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시하세요.
- **승인 후 실행**: 사용자에게 계획을 공유하고 질문 또는 승인을 요청하세요. 사용자가 계획을 확인하고 승인한 후에 비로소 실행 단계(Agent)로 넘어갑니다.

---

## 3. \`Goal\` 모드 (\`/goal\`, \`/3-goal\` - 목표 완수 모드)
장기 실행 및 목표 완수를 위해 끝까지 포기하지 않고 자율 실행하는 모드입니다.

- 사용자가 설정한 목표가 100% 달성될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 수행합니다.
- 복잡하거나 시간이 걸리는 작업에 적합합니다.

---

## 4. \`Agent\` 모드 (\`/agent\`, \`/4-agent\` - Full Agent 모드 명시 호출)
사용자 메시지에 \`/agent\` 또는 \`/4-agent\`가 포함되었거나, 아무 커맨드가 없는 기본 상태입니다.

- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.

---

## 5. 대화 세션 모드 고정 (Sticky Session Mode)
매번 프롬프트마다 커맨드를 치지 않아도 되도록 다음을 지원합니다:
- 사용자가 "지금부터 ask 모드로 해줘", "ask 모드 고정", "plan 모드로 전환", "goal 모드로 해줘" 등 모드 유지를 요청하면, 이후 프롬프트에 슬래시 커맨드가 없더라도 명시적으로 해제하기 전까지 해당 모드를 계속 유지합니다.
- 사용자가 "agent 모드로 돌아가줘", "모드 해제", "기본 모드로" 등을 요청하면 다시 기본 0번 상태(Full Agent)로 복귀합니다.
`;
}

function syncRuleFile(modeId) {
  try {
    const homeDir = os.homedir();
    const fullContent = generateFullGeminiRule(modeId);

    // 1. Write ~/.gemini/config/GEMINI.md and AGENTS.md
    const geminiConfigDir = path.join(homeDir, '.gemini', 'config');
    if (!fs.existsSync(geminiConfigDir)) {
      fs.mkdirSync(geminiConfigDir, { recursive: true });
    }
    fs.writeFileSync(path.join(geminiConfigDir, 'GEMINI.md'), fullContent, 'utf-8');
    fs.writeFileSync(path.join(geminiConfigDir, 'AGENTS.md'), fullContent, 'utf-8');

    // 2. Write rules/current_mode.md
    const ruleDir = path.join(geminiConfigDir, 'rules');
    if (!fs.existsSync(ruleDir)) {
      fs.mkdirSync(ruleDir, { recursive: true });
    }
    const mode = MODES[modeId];
    if (mode) {
      fs.writeFileSync(path.join(ruleDir, 'current_mode.md'), mode.ruleContent, 'utf-8');
    }

    // 3. Write to /Users/acb/antigravity repo if exists
    const repoPath = path.join(homeDir, 'antigravity');
    if (fs.existsSync(repoPath)) {
      fs.writeFileSync(path.join(repoPath, 'GEMINI.md'), fullContent, 'utf-8');
      fs.writeFileSync(path.join(repoPath, 'AGENTS.md'), fullContent, 'utf-8');
    }
  } catch (err) {
    console.error('Failed to sync rule files:', err);
  }
}

function updateUI() {
  const mode = MODES[currentMode] || MODES.agent;
  
  // 1. Status Bar update
  if (statusBarItem) {
    statusBarItem.text = mode.badgeText;
    if (mode.badgeColor) {
      statusBarItem.backgroundColor = new vscode.ThemeColor(mode.badgeColor);
    } else {
      statusBarItem.backgroundColor = undefined;
    }
    statusBarItem.tooltip = `${mode.fullName}
${mode.desc}
(클릭하여 모드 변경 / 단축키 Cmd+Alt+M)`;
  }

  // 2. Webview update
  if (currentWebviewView) {
    currentWebviewView.webview.postMessage({
      type: 'updateMode',
      mode: currentMode
    });
  }
}

function setMode(modeId, showNotification = true) {
  if (!MODES[modeId]) return;
  currentMode = modeId;
  if (extContext) {
    extContext.globalState.update('antigravity_active_mode', modeId);
  }
  syncRuleFile(modeId);
  updateUI();

  if (showNotification) {
    const mode = MODES[modeId];
    vscode.window.showInformationMessage(`Antigravity AI: ${mode.icon} ${mode.fullName}가 활성화되었습니다.`);
  }
}

function quickToggle() {
  if (currentMode === 'ask') {
    setMode('agent');
  } else {
    setMode('ask');
  }
}

function activate(context) {
  extContext = context;

  // Restore active mode from globalState or config files
  try {
    const saved = context.globalState.get('antigravity_active_mode');
    if (saved && MODES[saved]) {
      currentMode = saved;
    } else {
      const homeDir = os.homedir();
      const geminiPath = path.join(homeDir, '.gemini', 'config', 'GEMINI.md');
      if (fs.existsSync(geminiPath)) {
        const text = fs.readFileSync(geminiPath, 'utf-8');
        if (text.includes('Ask` 모드 적용') || text.includes('Ask 모드(읽기 전용)')) {
          currentMode = 'ask';
        } else if (text.includes('Plan` 모드 적용')) {
          currentMode = 'plan';
        } else if (text.includes('Goal` 모드 적용')) {
          currentMode = 'goal';
        } else {
          currentMode = 'ask';
        }
      } else {
        currentMode = 'ask';
      }
    }
  } catch (e) {
    currentMode = 'ask';
  }

  // Crucial: Always sync files on startup so AI engine is 100% matched with UI state
  syncRuleFile(currentMode);

  // Create Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999);
  statusBarItem.command = 'antigravity.selectMode';
  updateUI();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.selectMode', async () => {
      const items = [
        {
          label: `${currentMode === 'ask' ? '$(check) ' : ''}1. Ask 모드 (읽기 전용)`,
          description: '파일 수정/명령어 실행 절대 금지',
          detail: '오직 순수 질문 답변 및 코드 설명만 제공',
          id: 'ask'
        },
        {
          label: `${currentMode === 'plan' ? '$(check) ' : ''}2. Plan 모드 (계획 수립)`,
          description: '코드 작성 전 구현 계획 수립',
          detail: '기획서 작성 및 사용자 승인 후 코드 작업 진행',
          id: 'plan'
        },
        {
          label: `${currentMode === 'goal' ? '$(check) ' : ''}3. Goal 모드 (목표 완수)`,
          description: '100% 달성할 때까지 멈추지 않음',
          detail: '자가 디버깅 및 테스트를 거듭하며 목표 완료까지 자율 수행',
          id: 'goal'
        },
        {
          label: `${currentMode === 'agent' ? '$(check) ' : ''}4. Agent 모드 (전권 자율)`,
          description: '기본 모드 / 모든 권한 자율 활용',
          detail: '파일 생성, 수정, 삭제 및 터미널 명령어 실행 자율 완수',
          id: 'agent'
        }
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `현재 모드: [${MODES[currentMode].fullName}] - 전환할 AI 모드를 선택하세요`,
        title: 'Antigravity AI 모드 선택'
      });

      if (selected) {
        setMode(selected.id);
      }
    }),
    vscode.commands.registerCommand('antigravity.quickToggle', () => {
      quickToggle();
    }),
    vscode.commands.registerCommand('antigravity.setAskMode', () => setMode('ask')),
    vscode.commands.registerCommand('antigravity.setPlanMode', () => setMode('plan')),
    vscode.commands.registerCommand('antigravity.setGoalMode', () => setMode('goal')),
    vscode.commands.registerCommand('antigravity.setAgentMode', () => setMode('agent'))
  );

  // Register Webview View Provider for Sidebar
  const modeViewProvider = {
    resolveWebviewView(webviewView) {
      currentWebviewView = webviewView;
      webviewView.webview.options = {
        enableScripts: true
      };

      webviewView.webview.html = getSidebarHtml(currentMode);

      webviewView.webview.onDidReceiveMessage((message) => {
        if (message.command === 'setMode') {
          setMode(message.mode);
        } else if (message.command === 'quickToggle') {
          quickToggle();
        }
      });

      webviewView.onDidDispose(() => {
        currentWebviewView = null;
      });
    }
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('antigravity.modesView', modeViewProvider)
  );
}

function getSidebarHtml(activeModeId) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity AI Modes</title>
  <style>
    body {
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
    }
    .header {
      margin-bottom: 16px;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, rgba(255,255,255,0.1));
      padding-bottom: 12px;
    }
    .title {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin: 0;
      line-height: 1.4;
    }
    .active-card {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-focusBorder, #007acc);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .active-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }
    .active-mode-title {
      font-size: 16px;
      font-weight: bold;
      color: var(--vscode-textLink-foreground, #3794ff);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .active-desc {
      font-size: 12px;
      margin-top: 6px;
      color: var(--vscode-foreground);
      line-height: 1.4;
    }
    .modes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .mode-btn {
      background-color: var(--vscode-button-secondaryBackground, rgba(255,255,255,0.06));
      color: var(--vscode-button-secondaryForeground, inherit);
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 10px 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mode-btn:hover {
      background-color: var(--vscode-button-secondaryHoverBackground, rgba(255,255,255,0.12));
      border-color: var(--vscode-focusBorder, #007acc);
    }
    .mode-btn.selected {
      background-color: var(--vscode-button-background, #007acc);
      color: var(--vscode-button-foreground, #ffffff);
      border-color: var(--vscode-button-border, transparent);
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .mode-btn-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 13px;
    }
    .mode-btn-desc {
      font-size: 11px;
      opacity: 0.85;
      line-height: 1.3;
    }
    .toggle-section {
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--vscode-sideBarSectionHeader-border, rgba(255,255,255,0.1));
    }
    .quick-toggle-btn {
      width: 100%;
      background-color: var(--vscode-button-background, #007acc);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      border-radius: 6px;
      padding: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .quick-toggle-btn:hover {
      background-color: var(--vscode-button-hoverBackground, #0062a3);
    }
    .shortcut-hint {
      margin-top: 8px;
      font-size: 11px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">🪐 Antigravity AI Mode</div>
    <div class="subtitle">별도의 UI 패널에서 원클릭으로 AI 동작 모드를 즉시 전환합니다.</div>
  </div>

  <div class="active-card">
    <div class="active-label">CURRENT ACTIVE MODE</div>
    <div class="active-mode-title" id="activeModeName">
      ${MODES[activeModeId].icon} ${MODES[activeModeId].fullName}
    </div>
    <div class="active-desc" id="activeModeDesc">
      ${MODES[activeModeId].desc}
    </div>
  </div>

  <div class="modes-list">
    <button class="mode-btn ${activeModeId === 'ask' ? 'selected' : ''}" onclick="selectMode('ask')">
      <div class="mode-btn-header">
        <span>🛡️ 1. Ask 모드</span>
        <small>읽기 전용</small>
      </div>
      <div class="mode-btn-desc">파일 수정 및 터미널 실행 절대 금지, 안전한 질의응답</div>
    </button>

    <button class="mode-btn ${activeModeId === 'plan' ? 'selected' : ''}" onclick="selectMode('plan')">
      <div class="mode-btn-header">
        <span>📝 2. Plan 모드</span>
        <small>계획 수립</small>
      </div>
      <div class="mode-btn-desc">즉시 작성 금지, 상세 기획서 작성 후 승인받아 실행</div>
    </button>

    <button class="mode-btn ${activeModeId === 'goal' ? 'selected' : ''}" onclick="selectMode('goal')">
      <div class="mode-btn-header">
        <span>🎯 3. Goal 모드</span>
        <small>목표 완수</small>
      </div>
      <div class="mode-btn-desc">100% 달성할 때까지 자가 디버깅 및 테스트 완수</div>
    </button>

    <button class="mode-btn ${activeModeId === 'agent' ? 'selected' : ''}" onclick="selectMode('agent')">
      <div class="mode-btn-header">
        <span>⚡ 4. Agent 모드</span>
        <small>전권 자율</small>
      </div>
      <div class="mode-btn-desc">모든 파일 수정/생성 및 터미널 명령어 실행 자율 해결</div>
    </button>
  </div>

  <div class="toggle-section">
    <button class="quick-toggle-btn" onclick="toggleAskAgent()">
      🔄 Ask ↔ Agent 빠른 토글
    </button>
    <div class="shortcut-hint">단축키: <b>Cmd+Alt+A</b> (Mac) / <b>Ctrl+Alt+A</b> (Win)</div>
    <div class="shortcut-hint" style="margin-top:4px;">상단 툴바 / 하단 상태바 또는 <b>Cmd+Alt+M</b></div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const modes = ${JSON.stringify(MODES)};

    function selectMode(modeId) {
      vscode.postMessage({ command: 'setMode', mode: modeId });
    }

    function toggleAskAgent() {
      vscode.postMessage({ command: 'quickToggle' });
    }

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'updateMode') {
        const mode = modes[msg.mode];
        if (mode) {
          document.getElementById('activeModeName').innerHTML = mode.icon + ' ' + mode.fullName;
          document.getElementById('activeModeDesc').textContent = mode.desc;

          document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('selected');
          });
          const btn = document.querySelector(\`button[onclick="selectMode('\${msg.mode}')"]\`);
          if (btn) btn.classList.add('selected');
        }
      }
    });
  </script>
</body>
</html>`;
}

function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

module.exports = {
  activate,
  deactivate
};
