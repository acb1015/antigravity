# 🪐 Antigravity Custom Modes & Complete IDE Environment

Google Antigravity(AGY) IDE 및 CLI에서 **별도의 독립 모드 선택 UI (상태표시줄 & 사이드바 패널)**, **Cursor 스타일의 상호작용 모드(`/ask`, `/plan`, `/goal`, `/agent`)**, 그리고 **Tab 키 기반의 쾌속 코드 자동완성 환경**을 어디서나 동일하게 세팅할 수 있는 통합 설정 저장소입니다.

새로운 PC나 다른 환경에 Antigravity를 설치했을 때, 이 저장소의 스크립트 한 줄로 AI 모드, 전용 UI 패널, 에디터 키바인딩/설정을 완전히 동일하게 복원할 수 있습니다.

---

## 🌟 주요 기능 및 UI 요약

### 1. 별도의 독립 모드 선택 UI (채팅창 외부에 직접 추가)

채팅창 내부 인풋박스에 의존하지 않고, IDE 전체에서 상시 확인하고 조작할 수 있는 **전용 UI 확장 프로그램**이 내장되어 있습니다:

* **① 하단 상태표시줄 (Status Bar) 모드 위젯**:
  * 에디터 우측 하단에 **`[🛡️ AI: ASK]`**, **`[⚡ AI: AGENT]`**, **`[📝 AI: PLAN]`**, **`[🎯 AI: GOAL]`** 배지가 항시 표시됩니다.
  * 마우스로 클릭하면 모드 선택 메뉴(QuickPick)가 열려 원하는 모드로 1초 만에 즉시 전환됩니다.
  * 단축키: **`Cmd + Alt + M`** (Windows: **`Ctrl + Alt + M`**)
* **② 좌측 액티비티 바 (Activity Bar) 전용 컨트롤 패널**:
  * 좌측 사이드바에 행성 모양의 전용 아이콘이 추가됩니다.
  * 클릭 시 현재 활성 모드 배지와 함께 4개 모드 카드 버튼이 있어 원클릭으로 모드를 바꿀 수 있습니다.
* **③ 원클릭 빠른 토글 (Quick Toggle)**:
  * 단축키 **`Cmd + Alt + A`** (Windows: **`Ctrl + Alt + A`**)를 누르면 **Ask(읽기 전용) ↔ Agent(자율 실행)** 모드가 즉시 토글 전환되며 우측 하단에 알림이 뜹니다.
* **④ AI와의 실시간 완벽 연동**:
  * UI에서 모드를 바꾸면 AI 시스템 규칙에 실시간 반영되어, 채팅창에 슬래시 커맨드를 치지 않고 일반 대화를 나눠도 UI에서 선택된 모드에 맞춰 동작하고 답변 상단에 모드 배지가 출력됩니다.

---

### 2. 슬래시 커맨드 (`/`) 최우선 정렬 모드

채팅창에서 **`/`** 를 입력했을 때도 가장 자주 사용하는 순서대로 최상단에 깔끔하게 표시됩니다:

| 순서 | 슬래시 커맨드 | 모드 명칭 | 설명 및 동작 권한 |
| :---: | :--- | :--- | :--- |
| **1위 (최상단)** | **`/1-ask`** (또는 `/ask`) | **Ask 모드** | **파일 수정 및 터미널 실행 절대 금지**, 오직 순수 질의응답 및 코드 설명만 제공 |
| **2위** | **`/2-plan`** (또는 `/plan`) | **Plan 모드** | 즉시 코드 작성 금지, 상세 기획서/구현 계획을 먼저 제시하고 사용자 승인 후 실행 |
| **3위** | **`/3-goal`** (또는 `/goal`) | **Goal 모드** | 목표가 100% 달성될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 멈추지 않고 완수 |
| **4위** | **`/4-agent`** (또는 `/agent`) | **Agent 모드** | 파일 생성/수정, 터미널 실행 등 모든 권한을 자율적으로 활용하는 완전 자율 모드 |

---

### 3. 에디터 자동완성 최적화 (Tab Autocomplete)

* **`Tab` 키 즉시 자동완성**: 추천 팝업 목록이 떠 있을 때 `Enter`를 칠 필요 없이 `Tab` 키로 바로 변수 및 코드가 완성됩니다.
* **지연 없는 추천(Zero Delay)**: 타이핑 즉시(0ms 지연) 추천 팝업이 뜨도록 설정되어 답답함 없이 타이핑할 수 있습니다.
* **Tab Completion 활성화**: 앞 글자만 치고 `Tab`을 눌러 빠르게 단어를 완성할 수 있습니다.

---

## 🚀 빠른 시작 (새로운 PC에서 설치)

### 1. macOS / Linux

터미널을 열고 다음 명령어를 실행합니다:

```bash
git clone https://github.com/acb1015/antigravity.git
cd antigravity
chmod +x install.sh
./install.sh
```

설치 후 Antigravity IDE에서 **`Cmd + Shift + P`** -> **`Developer: Reload Window`** 를 실행하면 상태표시줄 버튼과 사이드바 UI가 즉시 나타납니다.

---

### 2. Windows (PowerShell)

PowerShell을 열고 다음 명령어를 실행합니다:

```powershell
git clone https://github.com/acb1015/antigravity.git
cd antigravity
.\install.ps1
```

설치 후 Antigravity IDE에서 **`Ctrl + Shift + P`** -> **`Developer: Reload Window`** 를 실행하면 즉시 적용됩니다.
