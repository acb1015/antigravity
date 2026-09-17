const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

const MODES = {
  ask: {
    id: "ask",
    name: "Ask",
    text: "$(comment-discussion) Ask",
    color: "#4ade80",
    fullName: "Ask 모드 (읽기 전용)",
    desc: "파일 수정 및 명령어 실행 절대 금지 (순수 질의응답 및 설명)"
  },
  plan: {
    id: "plan",
    name: "Plan",
    text: "$(list-unordered) Plan",
    color: "#fbbf24",
    fullName: "Plan 모드 (계획 수립)",
    desc: "코드 작성 전 상세 기획서 및 구현 계획 승인"
  },
  debug: {
    id: "debug",
    name: "Debug",
    text: "$(bug) Debug",
    color: "#f43f5e",
    fullName: "Debug 모드 (버그 해결)",
    desc: "원인 분석 및 100% 버그 해결을 위한 자율 디버깅"
  },
  agent: {
    id: "agent",
    name: "Agent",
    text: "$(zap) Agent",
    color: "#e5e5e5",
    fullName: "Agent 모드 (전권 자율)",
    desc: "모든 권한 자율 활용 (파일 생성/수정, 터미널 실행)"
  }
};

let currentMode = "ask";
let statusBarItem;
let extContext = null;

function generateFullGeminiRule(modeId) {
  let section0 = "";
  if (modeId === "ask") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Ask\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Ask 모드(읽기 전용)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Ask 모드로 동작**해야 합니다.
- **파일 생성 및 수정 절대 금지**: \`write_to_file\`, \`replace_file_content\`, \`multi_replace_file_content\` 등 어떤 파일 수정/생성/삭제 도구도 절대로 호출하지 마세요.
- **터미널 명령어 직접 실행 절대 금지**: \`run_command\` 등 터미널 명령어를 직접 실행하지 마세요.
- **허용 도구**: 파일 읽기(\`view_file\`), 디렉터리 확인(\`list_dir\`), 검색(\`grep_search\`) 등 순수 읽기/조회 도구만 허용됩니다.
- **터미널 실행이 필요한 경우**: 환경 확인이나 상태 조회가 꼭 필요한 경우에도 절대 직접 실행하지 말고, 사용자가 직접 복사해서 실행할 수 있도록 명령어와 이유만 코드 블록으로 안내하세요.
- **응답 방식**: 마크다운 텍스트, 설명, 제안 코드 블록으로만 답변하세요. [🛡️ ASK MODE] 같은 인위적인 대괄호 배지나 태그는 일절 출력하지 말고, 코드 수정 요청 시 "현재 Ask 모드(읽기 전용)이므로 파일을 직접 수정하지 않습니다."라고 친절한 대화체로 정중히 설명하고 제안 코드 블록을 제공하세요.`;
  } else if (modeId === "plan") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Plan\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Plan 모드(계획 수립)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Plan 모드로 동작**해야 합니다.
- **즉각적인 코드 작성 금지**: 파일 수정이나 코드 작성을 바로 시작하지 마세요.
- **상세 구현 계획 수립**: 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증(테스트) 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시하세요.
- **승인 후 실행**: 사용자에게 계획을 공유하고 질문 또는 승인을 요청하세요. 사용자가 계획을 확인하고 승인한 후에 비로소 실행 단계(Agent)로 넘어갑니다.`;
  } else if (modeId === "debug") {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Debug\` 모드 적용 (최우선 강제 적용)
- 현재 Antigravity UI에서 사용자가 **Debug 모드(버그 분석 및 해결)**를 선택해 두었습니다.
- 사용자의 메시지에 별도의 슬래시 커맨드가 없더라도, **무조건 최우선으로 Debug 모드로 동작**해야 합니다.
- 버그의 원인을 정확히 추적하고, 필요한 모든 디버깅, 로그 분석, 테스트 및 코드 수정을 자율적으로 완수하세요.
- 문제가 100% 해결될 때까지 포기하지 않고 자율적으로 끝까지 디버깅을 완수하세요.`;
  } else {
    section0 = `## 0. 기본 동작 (UI 설정) -> \`Agent\` 모드 적용 (기본 전권 자율)
- 현재 Antigravity UI에서 사용자가 **Agent 모드(전권 자율)**를 선택해 두었습니다.
- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.`;
  }

  return `# AI Interaction Modes Guidelines

어떤 경로, 어떤 프로젝트에서 작업하든 상관없이 다음 규칙을 **최우선이자 엄격하게 준수**해야 합니다.

---

\${section0}

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

## 3. \`Debug\` 모드 (\`/debug\`, \`/3-debug\`, \`/goal\` - 디버그 및 목표 완수)
버그 해결과 목표 완수를 위해 끝까지 포기하지 않고 자율 실행하는 모드입니다.

- 사용자가 설정한 목표 및 버그가 100% 달성/해결될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 수행합니다.
- 복잡하거나 원인 규명이 필요한 디버깅 작업에 적합합니다.

---

## 4. \`Agent\` 모드 (\`/agent\`, \`/4-agent\` - Full Agent 모드 명시 호출)
사용자 메시지에 \`/agent\` 또는 \`/4-agent\`가 포함되었거나, 아무 커맨드가 없는 기본 상태입니다.

- **모든 권한 허용**: 파일 생성, 수정, 삭제, 터미널 명령어 실행(\`run_command\`), 패키지 설치, 스크립트 실행 등을 주도적으로 판단하여 직접 수행하세요.
- 사용자의 요청을 해결하기 위해 필요한 모든 작업을 자율적으로 끝까지 완료하고, 최종 결과와 진행 내용을 명확하게 보고하세요.

---

## 5. 대화 세션 모드 고정 (Sticky Session Mode)
매번 프롬프트마다 커맨드를 치지 않아도 되도록 다음을 지원합니다:
- 사용자가 "지금부터 ask 모드로 해줘", "ask 모드 고정", "plan 모드로 전환", "debug 모드로 해줘" 등 모드 유지를 요청하면, 이후 프롬프트에 슬래시 커맨드가 없더라도 명시적으로 해제하기 전까지 해당 모드를 계속 유지합니다.
- 사용자가 "agent 모드로 돌아가줘", "모드 해제", "기본 모드로" 등을 요청하면 다시 기본 0번 상태(Full Agent)로 복귀합니다.
`;
}

function syncRuleFile(modeId) {
  try {
    const homeDir = os.homedir();
    const fullContent = generateFullGeminiRule(modeId);

    // 1. Write ~/.gemini/config/GEMINI.md and AGENTS.md
    const geminiConfigDir = path.join(homeDir, ".gemini", "config");
    if (!fs.existsSync(geminiConfigDir)) {
      fs.mkdirSync(geminiConfigDir, { recursive: true });
    }
    fs.writeFileSync(path.join(geminiConfigDir, "GEMINI.md"), fullContent, "utf-8");
    fs.writeFileSync(path.join(geminiConfigDir, "AGENTS.md"), fullContent, "utf-8");

    // 2. Write rules/current_mode.md
    const ruleDir = path.join(geminiConfigDir, "rules");
    if (!fs.existsSync(ruleDir)) {
      fs.mkdirSync(ruleDir, { recursive: true });
    }
    fs.writeFileSync(path.join(ruleDir, "current_mode.md"), `mode: ${modeId}`, "utf-8");

    // 3. Write to /Users/acb/antigravity repo if exists
    const repoPath = path.join(homeDir, "antigravity");
    if (fs.existsSync(repoPath)) {
      fs.writeFileSync(path.join(repoPath, "GEMINI.md"), fullContent, "utf-8");
      fs.writeFileSync(path.join(repoPath, "AGENTS.md"), fullContent, "utf-8");
    }
  } catch (err) {
    console.error("Failed to sync rule files:", err);
  }
}

function updateUI() {
  const mode = MODES[currentMode] || MODES.ask;
  if (statusBarItem) {
    statusBarItem.text = mode.text;
    statusBarItem.color = mode.color;
    statusBarItem.tooltip = `${mode.fullName}\n${mode.desc}\n(클릭하여 AI 모드 변경)`;
  }
}

function setMode(modeId, showNotification = true) {
  if (!MODES[modeId]) return;
  currentMode = modeId;
  if (extContext) {
    extContext.globalState.update("antigravity_active_mode", modeId);
  }
  syncRuleFile(modeId);
  updateUI();

  if (showNotification) {
    const mode = MODES[modeId];
    vscode.window.showInformationMessage(`Antigravity AI: ${mode.fullName}가 활성화되었습니다.`);
  }
}

function quickToggle() {
  if (currentMode === "ask") {
    setMode("agent", true);
  } else {
    setMode("ask", true);
  }
}

function activate(context) {
  extContext = context;

  // Restore active mode
  try {
    const saved = context.globalState.get("antigravity_active_mode");
    if (saved && MODES[saved]) {
      currentMode = saved;
    } else {
      currentMode = "ask";
    }
  } catch (e) {
    currentMode = "ask";
  }

  // Sync files on activation immediately
  syncRuleFile(currentMode);

  // Create Status Bar Item placed immediately to the left of Antigravity - Settings (priority 1, Right)
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
  statusBarItem.command = "antigravity.selectMode";
  updateUI();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("antigravity.selectMode", async () => {
      const items = [
        {
          label: `${currentMode === "ask" ? "$(check) " : ""}Ask 모드 (읽기 전용)`,
          description: "파일 수정/명령어 실행 절대 금지",
          detail: "순수 질문 답변 및 코드 설명 (Cursor Ask 동일)",
          id: "ask"
        },
        {
          label: `${currentMode === "plan" ? "$(check) " : ""}Plan 모드 (계획 수립)`,
          description: "코드 작성 전 구현 계획 수립",
          detail: "기획서 작성 및 승인 후 실행 (Cursor Plan 동일)",
          id: "plan"
        },
        {
          label: `${currentMode === "debug" ? "$(check) " : ""}Debug 모드 (버그 해결)`,
          description: "100% 버그 해결을 위한 자율 디버깅",
          detail: "자가 디버깅 및 테스트를 거듭하며 버그 완료까지 자율 수행",
          id: "debug"
        },
        {
          label: `${currentMode === "agent" ? "$(check) " : ""}Agent 모드 (전권 자율)`,
          description: "기본 모드 / 모든 권한 자율 활용",
          detail: "파일 생성, 수정, 삭제 및 터미널 실행 자율 완수 (Cursor Agent 동일)",
          id: "agent"
        }
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `현재 모드: [${MODES[currentMode].fullName}] - 전환할 AI 모드를 선택하세요`,
        title: "Antigravity AI 모드 선택"
      });

      if (selected) {
        setMode(selected.id, true);
      }
    }),
    vscode.commands.registerCommand("antigravity.quickToggle", () => {
      quickToggle();
    }),
    vscode.commands.registerCommand("antigravity.setAskMode", () => setMode("ask", true)),
    vscode.commands.registerCommand("antigravity.setPlanMode", () => setMode("plan", true)),
    vscode.commands.registerCommand("antigravity.setDebugMode", () => setMode("debug", true)),
    vscode.commands.registerCommand("antigravity.setAgentMode", () => setMode("agent", true))
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
