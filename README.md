# 🪐 Antigravity Custom Modes & Complete IDE Environment

Google Antigravity(AGY) IDE 및 CLI에서 **Cursor 스타일의 상호작용 모드(`/ask`, `/plan`, `/goal`, `/agent`)**와 **Tab 키 기반의 쾌속 코드 자동완성 환경**을 어디서나 동일하게 세팅할 수 있는 통합 설정 저장소입니다.

새로운 PC나 다른 환경에 Antigravity를 설치했을 때, 이 저장소의 스크립트 한 줄로 AI 모드와 에디터 키바인딩/설정을 완전히 동일하게 복원할 수 있습니다.

---

## 🌟 주요 기능 및 모드 요약

### 1. 슬래시 커맨드 (`/`) 최우선 정렬 모드

채팅창에서 **`/`** 를 입력하면 가장 자주 사용하는 순서대로 최상단에 깔끔하게 표시됩니다:

1. **`/1-ask`** (또는 `/ask`): **Ask (읽기 전용 모드)** - Cursor의 Ask 모드와 동일. **파일 수정 및 터미널 실행 절대 금지**, 오직 순수 질문 답변 및 코드 설명만 제공
2. **`/2-plan`** (또는 `/plan`): **Plan (계획 수립 모드)** - 즉시 코드 작성 금지, 상세 구현 계획/기획서를 먼저 작성하여 사용자 승인을 받음
3. **`/3-goal`** (또는 `/goal`): **Goal (목표 완수 모드)** - 설정한 목표가 100% 달성될 때까지 포기하지 않고 자가 수정 및 디버깅을 거듭하며 끝까지 완수
4. **`/4-agent`** (또는 `/agent`): **Agent (전권 자율 모드)** - 모든 권한을 자율적으로 사용하여 파일 생성/수정, 터미널 명령어 실행까지 주도적으로 해결

| 모드 | 슬래시 커맨드 | 설명 | 권한 및 동작 |
| :--- | :--- | :--- | :--- |
| **Ask (1순위)** | `/1-ask` 또는 `/ask` | 읽기 전용 질의응답 및 설명 모드 | **파일 수정 및 터미널 실행 절대 금지** |
| **Plan (2순위)** | `/2-plan` 또는 `/plan` | 구현 계획 수립 및 사용자 승인 모드 | 즉시 코드 작성 금지, 승인 후 실행 |
| **Goal (3순위)** | `/3-goal` 또는 `/goal` | 목표가 100% 달성될 때까지 완수하는 모드 | 자가 치유(Self-Healing), 최종 검증 필수 |
| **Full Agent (기본/4순위)** | 별도 커맨드 없음 또는 `/4-agent` | AI가 문제를 끝까지 해결하는 완전 자율 모드 | 모든 파일 수정/생성 및 터미널 실행 허용 |

> **💡 빠른 입력 팁**:
> * 채팅창에 **`/`** 를 누르고 숫자 `1`, `2`, `3`, `4`만 누르면 해당 모드가 바로 선택됩니다.
> * 기존처럼 **`/ask`**, **`/plan`**, **`/goal`**, **`/agent`** 로 직접 타이핑하셔도 동일하게 완벽 인식됩니다.
> * 복잡한 `@` 멘션 및 `#` 기능은 모두 제거되어 오직 깔끔한 `/` 커맨드로만 동작합니다.

> **대화 세션 모드 고정 (Sticky Mode)**:
> 프롬프트마다 매번 `/ask`를 치지 않고 연속해서 질의응답만 나누고 싶다면 **`"지금부터 ask 모드로 해줘"`**라고 말씀하시면 해당 대화 동안 모드가 고정됩니다. 다시 코딩을 시키실 때는 **`"agent 모드로 해줘"`**라고 말씀하시면 됩니다.

---

### 2. 에디터 자동완성 최적화 (Tab Autocomplete)

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

설치 후 Antigravity IDE에서 `Cmd + Shift + P` -> `Developer: Reload Window`를 실행하면 즉시 적용됩니다.

---

### 2. Windows (PowerShell)

PowerShell을 열고 다음 명령어를 실행합니다:

```powershell
git clone https://github.com/acb1015/antigravity.git
cd antigravity
.\install.ps1
```

설치 후 Antigravity IDE에서 `Ctrl + Shift + P` -> `Developer: Reload Window`를 실행하면 즉시 적용됩니다.
