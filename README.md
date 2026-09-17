# 🪐 Antigravity Custom Modes & Complete IDE Environment

Google Antigravity(AGY) IDE 및 CLI에서 **Cursor 스타일의 상호작용 모드(`/agent`, `/ask`, `/plan`)**와 **Tab 키 기반의 쾌속 코드 자동완성 환경**을 어디서나 동일하게 세팅할 수 있는 통합 설정 저장소입니다.

새로운 PC나 다른 환경에 Antigravity를 설치했을 때, 이 저장소의 스크립트 한 줄로 AI 모드와 에디터 키바인딩/설정을 완전히 동일하게 복원할 수 있습니다.

---

## 🌟 주요 기능 및 환경 요약

### 1. AI 상호작용 모드

| 모드 | 사용 방법 | 설명 | 권한 및 동작 |
| :--- | :--- | :--- | :--- |
| **Full Agent (기본)** | 별도 데코레이터 없음 또는 `/agent` | AI가 스스로 판단하여 문제를 끝까지 해결하는 완전 자율 모드 | 파일 생성/수정/삭제 허용, 터미널 명령어 실행 허용 |
| **Ask (읽기 전용)** | `/ask <질문>` | Cursor의 Ask 모드와 동일한 순수 질의응답 및 설명 모드 | **파일 수정 및 터미널 실행 절대 금지**, 오직 읽기/설명만 제공 |
| **Plan (계획 수립)** | `/plan <요청>` | 코드 작성 전 아키텍처 및 구현 계획을 먼저 승인받는 모드 | 즉시 코드 작성 금지, 기획서/구현 계획 제시 후 승인 시 실행 |

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

### 2. Windows (PowerShell)

PowerShell을 열고 다음 명령어를 실행합니다:

```powershell
git clone https://github.com/acb1015/antigravity.git
cd antigravity
.\install.ps1
```

> **설치 후 적용 방법**:
> 에디터에서 **`Cmd + Shift + P`** (Windows는 `Ctrl + Shift + P`) 누른 후 **`Developer: Reload Window`** (창 다시 로드)를 한 번 실행해 주시면 모든 설정이 즉시 활성화됩니다.

---

## 📁 저장소 구조

```text
antigravity/
├── README.md                 # 프로젝트 문서 및 설치 가이드
├── install.sh                # macOS/Linux 통합 자동 설치 스크립트
├── install.ps1               # Windows PowerShell 통합 자동 설치 스크립트
├── GEMINI.md                 # 루트 디렉토리 최우선 규칙
├── AGENTS.md                 # Antigravity 표준 AGENTS 가이드
├── ide/                      # 에디터 UI 및 단축키 설정
│   ├── settings.json         # Tab 자동완성, Zero-delay 등 에디터 설정
│   └── keybindings.json      # 추천 팝업 시 Tab 키 우선 수락 단축키
├── config/                   # 전역 설정 (~/.gemini/config/) 템플릿
│   ├── GEMINI.md             # 전역 AI 행동 수칙 가이드라인
│   ├── AGENTS.md             # 전역 AGENTS 가이드라인
│   ├── rules/
│   │   └── modes.md          # 상시 적용(always_on) 모드 규칙
│   ├── workflows/            # 사용자 슬래시 커맨드 워크플로우 (/agent, /ask, /plan)
│   ├── global_workflows/     # 전역 슬래시 커맨드 등록
│   └── skills/               # 온디맨드 스킬 정의 (SKILL.md)
└── .agents/                  # 특정 프로젝트에만 적용할 때 쓸 템플릿
```

---

## 📌 개별 프로젝트 단위로 적용하고 싶을 때

전역 설정이 아닌 특정 Git 프로젝트에만 이 AI 모드들을 적용하고 싶다면:
1. 해당 프로젝트 루트에 이 저장소의 `.agents` 폴더를 복사합니다.
2. 프로젝트 루트에 `GEMINI.md` 또는 `AGENTS.md`를 배치합니다.
