const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 2x width padding using non-breaking spaces
const PAD = "\u00A0\u00A0\u00A0\u00A0\u00A0";

// Mode definitions in strict requested order: agent -> ask -> plan -> goal
const MODES = {
  agent: {
    id: "agent",
    name: "Agent",
    text: `${PAD}$(zap)\u00A0\u00A0Agent${PAD}`,
    color: "#f1f5f9",
    circle: "⚪",
    themeColor: "charts.foreground",
    iconFile: "agent.svg",
    fullName: "Agent 모드 (전권 자율)",
    summary: "기본 모드 / 모든 권한 자율 활용",
    desc: "파일 생성/수정/삭제, 터미널 실행 등 모든 작업을 자율적으로 끝까지 완료 (Cursor Agent 동일)"
  },
  ask: {
    id: "ask",
    name: "Ask",
    text: `${PAD}$(comment-discussion)\u00A0\u00A0Ask${PAD}`,
    color: "#4ade80",
    circle: "🟢",
    themeColor: "charts.green",
    iconFile: "ask.svg",
    fullName: "Ask 모드 (질의응답 및 조회)",
    summary: "파일 수정/삭제 금지, 안전한 읽기/상태 조회 허용",
    desc: "파일 수정/삭제 금지, URL/웹 검색 및 읽기 전용 명령어(ls 등) 조회 허용 (Cursor Ask 동일)"
  },
  plan: {
    id: "plan",
    name: "Plan",
    text: `${PAD}$(list-unordered)\u00A0\u00A0Plan${PAD}`,
    color: "#fbbf24",
    circle: "🟡",
    themeColor: "charts.yellow",
    iconFile: "plan.svg",
    fullName: "Plan 모드 (계획 수립)",
    summary: "코드 작성 전 상세 구현 계획 수립",
    desc: "기획서 작성 및 사용자 확인/승인 후 실행 (Cursor Plan 동일)"
  },
  goal: {
    id: "goal",
    name: "Goal",
    text: `${PAD}$(target)\u00A0\u00A0Goal${PAD}`,
    color: "#f43f5e",
    circle: "🔴",
    themeColor: "charts.red",
    iconFile: "goal.svg",
    fullName: "Goal 모드 (목표 완수)",
    summary: "100% 목표 완수를 위한 자율 디버깅/테스트",
    desc: "목표가 완전히 달성될 때까지 자가 디버깅, 수정, 검증을 포기하지 않고 끝까지 수행 (/goal)"
  }
};

let currentMode = "agent";
let statusBarItem;
let extContext = null;

function generateFullGeminiRule(modeId) {
  let section0 = "";
  if (modeId === "agent") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Agent\` 모드 적용 (기본 전권 자율)
- 현재 Antigravity UI 하단 상태표시줄에서 사용자가 **Agent 모드(전권 자율)**를 선택해 두었습니다.
- 프롬프트에 별도의 1회성 슬래시 커맨드가 없는 한, **항상 Agent 모드로 기본 동작**합니다.
- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.`;
  } else if (modeId === "ask") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Ask\` 모드 적용 (질의응답 및 상태 조회)
- 현재 Antigravity UI 하단 상태표시줄에서 사용자가 **Ask 모드(질의응답 및 상태 조회)**를 선택해 두었습니다.
- 프롬프트에 별도의 1회성 슬래시 커맨드가 없는 한, **항상 Ask 모드로 기본 동작**합니다.
- **파일 생성·수정·삭제 절대 금지**: \`write_to_file\`, \`replace_file_content\`, \`multi_replace_file_content\` 등 어떤 파일 수정/생성/삭제 도구도 절대로 호출하지 마세요.
- **링크 조회 및 웹 검색 자동 허용**: URL 내용 확인(\`read_url_content\`), 웹 검색(\`search_web\`), 파일 열람(\`view_file\`), 디렉터리 확인(\`list_dir\`), 검색(\`grep_search\`) 등 순수 정보 조회는 별도의 권한 요청이나 확인 없이 즉시 실행하세요.
- **읽기 전용 터미널 명령어 허용**: 파일 목록이나 환경 상태를 확인하는 무해한 읽기 전용 명령어(\`ls\`, \`ll\`, \`pwd\`, \`git status\`, \`git log\`, \`cat\`, \`find\` 등)는 \`run_command\`로 직접 실행해도 됩니다.
- **상태 변경 명령어 절대 금지**: 터미널 실행으로 인해 파일이 추가·삭제·수정되거나 패키지 설치, 설정 변경이 발생하는 모든 명령어(\`rm\`, \`mv\`, \`cp\`, \`touch\`, \`mkdir\`, \`git commit/push\`, \`npm/pip install\` 등)는 절대로 실행하지 마세요.
- **응답 방식**: 마크다운 텍스트, 설명, 제안 코드 블록으로만 답변하세요. [🛡️ ASK MODE] 같은 인위적인 대괄호 배지나 태그는 일절 출력하지 말고, 코드 수정 요청 시 "현재 Ask 모드(읽기 전용)이므로 파일을 직접 수정하지 않습니다."라고 친절한 대화체로 정중히 설명하고 제안 코드 블록을 제공하세요.`;
  } else if (modeId === "plan") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Plan\` 모드 적용 (계획 수립)
- 현재 Antigravity UI 하단 상태표시줄에서 사용자가 **Plan 모드(계획 수립)**를 선택해 두었습니다.
- 프롬프트에 별도의 1회성 슬래시 커맨드가 없는 한, **항상 Plan 모드로 기본 동작**합니다.
- **즉각적인 코드 작성 금지**: 파일 수정이나 코드 작성을 바로 시작하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증(테스트) 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시하세요.
- **승인 후 실행**: 사용자에게 계획을 공유하고 질문 또는 승인을 요청하세요. 사용자가 계획을 확인하고 승인한 후에 비로소 실행 단계(Agent)로 넘어갑니다.`;
  } else {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Goal\` 모드 적용 (목표 완수)
- 현재 Antigravity UI 하단 상태표시줄에서 사용자가 **Goal 모드(목표 완수)**를 선택해 두었습니다.
- 프롬프트에 별도의 1회성 슬래시 커맨드가 없는 한, **항상 Goal 모드로 기본 동작**합니다.
- **목표 완수 집념**: 목표가 100% 달성될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 완수하세요.`;
  }

  return `# AI Interaction Modes Guidelines

어떤 경로, 어떤 프로젝트에서 작업하든 상관없이 다음 규칙을 **최우선이자 엄격하게 준수**해야 합니다.

---

${section0}

---

## [핵심 원칙 1] 자연어 질문/조회/확인 요청 시 모드 오판 절대 금지 (최우선 수칙)
- **자연어 요청으로 인한 모드 변경 절대 금지**: 사용자가 단순히 **"확인해줘", "확인만 해줘", "체크해줘", "조회해줘", "코드 봐줘", "설명해줘", "이거 왜 이래?", "지금 무슨 모드야?" 등 자연어로 질문하거나 조회를 요청하더라도, 절대로 모드가 \`Ask\` 모드로 변경되거나 자신을 \`Ask\` 모드라고 답변/착각해서는 안 됩니다.**
- 현재 UI 기본 모드가 \`Agent\` 모드라면, 단순 질문이나 확인 요청을 받더라도 **여전히 \`Agent\` 모드**인 상태에서 확인과 조회를 수행하는 것입니다. (필요 시 파일 생성·수정 및 명령어 실행 권한을 온전히 유지합니다.)
- 사용자가 프롬프트에 명시적으로 \`/ask\` 슬래시 커맨드를 입력하거나, "지금부터 ask 모드로 전환해줘"라고 모드 변경을 명시적으로 지시하지 않는 한, **어떠한 자연어 질문/대화도 세션 모드를 Ask 모드로 바꾸지 못합니다.**

---

## [핵심 원칙 2] 슬래시 커맨드(\`/\`)의 단발성(One-Shot) 원칙 (최우선 수칙)
- **오직 해당 턴에만 1회성 적용**: 프롬프트 맨 앞 또는 본문에 입력된 슬래시 커맨드(\`/ask\`, \`/plan\`, \`/goal\`, \`/agent\`)는 **오직 해당 프롬프트(해당 1회 턴)에서만 일시적으로 적용**됩니다.
- **다음 턴 즉시 자동 복귀**: 하단 UI 상태표시줄의 모드가 바뀌지 않았다면, 슬래시 커맨드 요청에 대한 응답이 끝난 후 **다음 프롬프트에서는 무조건 원래의 UI 기본 모드(0번 설정 모드)로 즉시 자동 복귀**해야 합니다.
- **대화 기록에 의한 모드 오염 금지**: 이전 턴의 대화 기록에 \`/ask\` 등이 남아있더라도, 현재 턴의 프롬프트에 슬래시 커맨드가 없다면 **무조건 현재 UI 기본 모드(0번 설정 모드)**로 동작해야 합니다. 이전 대화의 슬래시 커맨드가 전체 세션을 Ask 모드로 오염시키거나 고정시킬 수 없습니다.

---

## [핵심 원칙 3] 대화 세션 모드 고정 (Sticky Session Mode) 조건
세션 모드가 이후 턴까지 지속적으로 변경/고정되는 경우는 오직 다음 둘 중 하나뿐입니다:
1. **하단 UI 변경**: 사용자가 Antigravity 하단 상태표시줄에서 직접 모드를 클릭하여 변경한 경우
2. **명시적 고정 명령**: 사용자가 프롬프트에서 "지금부터 계속 ask 모드로 해줘", "ask 모드 고정", "plan 모드로 전환해줘" 같이 **지속적인 모드 변경/고정을 명시적으로 지시한 경우**
- 단순 1회 슬래시 커맨드(\`/ask ...\`)나 단순 자연어 질문("확인만 해줘")은 세션 모드를 고정시키지 않습니다.
- 고정된 세션 모드를 해제하려면 사용자가 "agent 모드로 돌아가줘", "모드 해제", "기본 모드로" 등을 지시하면 다시 하단 UI의 기본 모드로 복귀합니다.

---

## 1. \`Agent\` 모드 (\`/agent\` - Full Agent 모드)
사용자 메시지에 \`/agent\`가 입력되었거나, 현재 UI 기본 모드가 agent인 경우:
- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- **자연어 질문 시에도 유지**: 사용자가 "확인해줘", "코드 봐줘", "질문 있어" 등을 요청해도 Agent 모드를 온전히 유지하며 자율적으로 확인/해결합니다.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.

---

## 2. \`Ask\` 모드 (\`/ask\` - 질의응답 및 상태 조회)
사용자 메시지에 \`/ask\`가 입력되었거나, 현재 UI 기본 모드가 ask인 경우에만 적용:
- **단발성 적용**: 프롬프트에 \`/ask\`를 붙여 호출한 경우 **오직 해당 턴에서만 읽기 전용으로 동작**하며, 다음 턴에서는 원래 UI 기본 모드로 자동 복귀합니다.
- **파일 생성·수정·삭제 절대 금지**: \`write_to_file\`, \`replace_file_content\`, \`multi_replace_file_content\` 등 어떤 파일 수정/생성/삭제 도구도 절대로 호출하지 마세요.
- **링크 조회 및 웹 검색 자동 허용**: URL 내용 확인(\`read_url_content\`), 웹 검색(\`search_web\`), 파일 열람(\`view_file\`), 디렉터리 확인(\`list_dir\`), 검색(\`grep_search\`) 등 순수 정보 조회는 별도의 권한 요청이나 확인 없이 즉시 실행하세요.
- **읽기 전용 터미널 명령어 허용**: 파일 목록이나 시스템 상태를 확인하는 무해한 읽기 전용 명령어(\`ls\`, \`ll\`, \`pwd\`, \`git status\`, \`git log\`, \`cat\`, \`head\`, \`find\` 등)는 \`run_command\`로 직접 실행해도 됩니다.
- **상태 변경 명령어 절대 금지**: 터미널 실행으로 인해 파일/디렉터리가 추가·수정·삭제되거나 패키지 설치, 빌드, 설정 변경이 발생하는 모든 명령어(\`rm\`, \`mv\`, \`cp\`, \`touch\`, \`mkdir\`, \`git commit/push\`, \`npm/pip install\` 등)는 절대로 실행하지 마세요.
- **응답 방식**: 마크다운 텍스트, 설명, 제안 코드 블록으로만 답변하세요.

---

## 3. \`Plan\` 모드 (\`/plan\` - Planning 모드)
사용자 메시지에 \`/plan\`이 입력되었거나, 현재 UI 기본 모드가 plan인 경우에만 적용:
- **단발성 적용**: 프롬프트에 \`/plan\`을 붙여 호출한 경우 **오직 해당 턴에서만 계획 수립으로 동작**하며, 다음 턴에서는 원래 UI 기본 모드로 자동 복귀합니다.
- **즉각적인 코드 작성 금지**: 파일 수정이나 코드 작성을 바로 시작하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증(테스트) 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시하세요.
- **승인 후 실행**: 사용자에게 계획을 공유하고 질문 또는 승인을 요청하세요. 사용자가 계획을 확인하고 승인한 후에 비로소 실행 단계(Agent)로 넘어갑니다.

---

## 4. \`Goal\` 모드 (\`/goal\`, \`/debug\` - 목표 완수)
사용자 메시지에 \`/goal\`이 입력되었거나, 현재 UI 기본 모드가 goal인 경우에만 적용:
- **단발성 적용**: 프롬프트에 \`/goal\`을 붙여 호출한 경우 **오직 해당 턴에서만 목표 완수 모드로 동작**하며, 다음 턴에서는 원래 UI 기본 모드로 자동 복귀합니다.
- 사용자가 설정한 목표 및 버그가 100% 달성/해결될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 수행합니다.
- 복잡하거나 원인 규명이 필요한 디버깅 및 고난도 목표 완수 작업에 적합합니다.
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
    fs.writeFileSync(path.join(ruleDir, 'current_mode.md'), `mode: ${modeId}`, 'utf-8');

    // 3. Write to ~/antigravity repo if exists
    const repoPath = path.join(homeDir, 'antigravity');
    if (fs.existsSync(repoPath)) {
      fs.writeFileSync(path.join(repoPath, 'GEMINI.md'), fullContent, 'utf-8');
      fs.writeFileSync(path.join(repoPath, 'AGENTS.md'), fullContent, 'utf-8');
      const repoConfigDir = path.join(repoPath, 'config');
      if (fs.existsSync(repoConfigDir)) {
        fs.writeFileSync(path.join(repoConfigDir, 'GEMINI.md'), fullContent, 'utf-8');
        fs.writeFileSync(path.join(repoConfigDir, 'AGENTS.md'), fullContent, 'utf-8');
      }
    }

    // 4. [Clean Workspace] 개별 프로젝트 폴더를 오염시키지 않고 전역(~/.gemini/config)으로만 동작하도록 보장
    // 프로젝트 폴더 내 기존 자동 생성된 GEMINI.md, AGENTS.md가 있다면 자동 정리하여 워크스페이스를 깨끗하게 유지
    if (vscode.workspace && vscode.workspace.workspaceFolders) {
      for (const folder of vscode.workspace.workspaceFolders) {
        const folderPath = folder.uri.fsPath;
        if (folderPath && fs.existsSync(folderPath) && folderPath !== repoPath) {
          for (const fileName of ['GEMINI.md', 'AGENTS.md']) {
            const targetFile = path.join(folderPath, fileName);
            if (fs.existsSync(targetFile)) {
              try {
                const header = fs.readFileSync(targetFile, 'utf-8').slice(0, 100);
                if (header.includes('AI Interaction Modes Guidelines')) {
                  fs.unlinkSync(targetFile);
                }
              } catch (cleanErr) {
                // ignore clean errors
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync rule files:', err);
  }
}

function updateUI() {
  const mode = MODES[currentMode] || MODES.agent;
  if (statusBarItem) {
    statusBarItem.text = mode.text;
    statusBarItem.color = mode.color;
    statusBarItem.tooltip = `${mode.circle} ${mode.fullName}\n${mode.desc}\n(클릭하여 AI 모드 변경 / 2배 영역)`;
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
    vscode.window.showInformationMessage(`Antigravity AI: ${mode.circle} ${mode.fullName}가 활성화되었습니다.`);
  }
}

function quickToggle() {
  if (currentMode === 'ask') {
    setMode('agent', true);
  } else {
    setMode('ask', true);
  }
}

function activate(context) {
  extContext = context;

  // Restore active mode
  try {
    const saved = context.globalState.get('antigravity_active_mode');
    if (saved && MODES[saved]) {
      currentMode = saved;
    } else {
      currentMode = 'agent';
    }
  } catch (e) {
    currentMode = 'agent';
  }

  // Sync files on activation immediately
  syncRuleFile(currentMode);

  // Status bar item priority 0 with acb.mode-selector-ui identifier
  // Places it immediately to the left of Antigravity - Settings
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
  statusBarItem.command = 'antigravity.selectMode';
  updateUI();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Auto-sync when a new workspace or project folder is opened
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      syncRuleFile(currentMode);
    })
  );

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.selectMode', async () => {
      // Ordered strictly: agent, ask, plan, goal
      const orderedKeys = ['agent', 'ask', 'plan', 'goal'];
      const items = orderedKeys.map((key) => {
        const m = MODES[key];
        const isSelected = currentMode === key;
        const iconPath = extContext ? vscode.Uri.file(path.join(extContext.extensionPath, 'media', m.iconFile)) : undefined;
        return {
          label: `${isSelected ? "✓ " : "\u00A0\u00A0"}${m.circle}\u00A0\u00A0${m.name} 모드`,
          description: isSelected ? `[현재 활성] ${m.summary}` : m.summary,
          detail: m.desc,
          iconPath: iconPath || new vscode.ThemeIcon(m.iconFile.replace('.svg', ''), new vscode.ThemeColor(m.themeColor)),
          id: m.id
        };
      });

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `현재 활성: ${MODES[currentMode].circle} [${MODES[currentMode].fullName}] - 전환할 AI 모드를 선택하세요`,
        title: "Antigravity AI 모드 선택"
      });

      if (selected) {
        setMode(selected.id, true);
      }
    }),
    vscode.commands.registerCommand('antigravity.quickToggle', () => {
      quickToggle();
    }),
    vscode.commands.registerCommand('antigravity.setAgentMode', () => setMode('agent', true)),
    vscode.commands.registerCommand('antigravity.setAskMode', () => setMode('ask', true)),
    vscode.commands.registerCommand('antigravity.setPlanMode', () => setMode('plan', true)),
    vscode.commands.registerCommand('antigravity.setGoalMode', () => setMode('goal', true))
  );
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
