# 🪐 Antigravity Custom Modes & Configurations

Google Antigravity(AGY) IDE 및 CLI에서 Cursor 스타일의 상호작용 모드(**`/agent`**, **`/ask`**, **`/plan`**)를 손쉽게 적용하고 관리하기 위한 설정 저장소입니다.

새로운 PC나 다른 환경에 Antigravity를 설치했을 때, 이 저장소의 설정 스크립트 한 줄로 동일한 작업 환경을 구성할 수 있습니다.

---

## 🌟 지원 모드 요약

| 모드 | 사용 방법 | 설명 | 권한 및 동작 |
| :--- | :--- | :--- | :--- |
| **Full Agent (기본)** | 별도 데코레이터 없음 또는 `/agent` | AI가 스스로 판단하여 문제를 끝까지 해결하는 완전 자율 모드 | 파일 생성/수정/삭제 허용, 터미널 명령어 실행 허용 |
| **Ask (읽기 전용)** | `/ask <질문>` | Cursor의 Ask 모드와 동일한 순수 질의응답 및 설명 모드 | **파일 수정 및 터미널 실행 절대 금지**, 오직 읽기/설명만 제공 |
| **Plan (계획 수립)** | `/plan <요청>` | 코드 작성 전 아키텍처 및 구현 계획을 먼저 승인받는 모드 | 즉시 코드 작성 금지, 기획서/구현 계획 제시 후 승인 시 실행 |

---

## 🚀 빠른 시작 (새로운 PC에서 설치)

### 1. macOS / Linux

터미널에서 아래 명령어를 실행하여 저장소를 복제하고 설치합니다:

```bash
git clone https://github.com/acb1015/antigravity.git
cd antigravity
chmod +x install.sh
./install.sh
```

### 2. Windows (PowerShell)

PowerShell을 열고 아래 명령어를 실행합니다:

```powershell
git clone https://github.com/acb1015/antigravity.git
cd antigravity
.\install.ps1
```

> **참고**: 스크립트는 전역 설정 경로인 `~/.gemini/config` (Windows의 경우 `%USERPROFILE%\.gemini\config`)에 파일들을 자동으로 배치합니다.

---

## 📁 저장소 구조

```text
antigravity/
├── README.md                 # 프로젝트 문서 및 설치 가이드
├── install.sh                # macOS/Linux 자동 설치 스크립트
├── install.ps1               # Windows PowerShell 자동 설치 스크립트
├── GEMINI.md                 # 루트 디렉토리 적용 규칙
├── AGENTS.md                 # Antigravity 기본 규칙 파일
├── config/                   # 전역 설정 (~/.gemini/config/) 템플릿
│   ├── GEMINI.md             # 전역 AI 행동 수칙 가이드라인
│   ├── AGENTS.md             # 전역 AGENTS 가이드라인
│   ├── rules/
│   │   └── modes.md          # 상시 적용(always_on) 모드 규칙
│   ├── workflows/            # 사용자 슬래시 커맨드 워크플로우 (/agent, /ask, /plan)
│   │   ├── agent.md
│   │   ├── ask.md
│   │   └── plan.md
│   ├── global_workflows/     # 전역 워크플로우 등록
│   │   ├── agent.md
│   │   ├── ask.md
│   │   └── plan.md
│   └── skills/               # 온디맨드 스킬 정의 (SKILL.md)
│       ├── agent/
│       │   └── SKILL.md
│       ├── ask/
│       │   └── SKILL.md
│       └── plan/
│           └── SKILL.md
└── .agents/                  # 개별 프로젝트 단위로 적용 시 복사할 템플릿
    ├── rules/
    │   └── modes.md
    └── skills/
        ├── agent/
        │   └── SKILL.md
        ├── ask/
        │   └── SKILL.md
        └── plan/
            └── SKILL.md
```

---

## 📌 개별 프로젝트 단위로 적용하고 싶을 때

전역(`~/.gemini/config`)이 아닌 **특정 Git 프로젝트 저장소**에만 이 규칙을 적용하고 팀원들과 공유하고 싶다면:

1. 해당 프로젝트의 루트에 이 저장소의 `.agents` 폴더를 복사합니다.
2. 필요에 따라 프로젝트 루트에 `GEMINI.md` 또는 `AGENTS.md`를 배치합니다.
3. 프로젝트를 Git에 커밋하면 팀원 모두가 동일한 `/agent`, `/ask`, `/plan` 모드를 사용할 수 있습니다.

---

## 📝 상세 동작 가이드

### 0. 기본 동작 (데코레이터가 없을 때)
- 기본적으로 `/agent` (Full Agent) 모드로 동작합니다.
- 문제를 해결하기 위해 필요한 모든 파일 수정, 코드 작성, 터미널 명령어 실행 등을 스스로 판단하여 적극적이고 자율적으로 완수합니다.

### 1. `/ask` 모드 (Cursor Ask 모드와 동일)
- 파일 생성 및 수정 도구 사용 절대 금지
- 터미널 명령어 직접 실행 절대 금지
- 허용 도구: 파일 읽기, 디렉터리 확인, 검색 등 순수 읽기 도구만 사용
- 상태 확인이 필요한 경우 사용자에게 실행할 명령어와 이유를 코드 블록으로 안내
- 응답 방식: 마크다운 설명 및 복사 가능한 코드 블록으로 제공

### 2. `/agent` 모드 (Full Agent 모드)
- 파일 생성, 수정, 삭제 자율 실행
- 터미널 명령어 실행을 통한 패키지 설치, 스크립트 실행, 테스트 등 모든 도구를 적극 활용하여 문제 해결

### 3. `/plan` 모드 (Planning 모드)
- 즉각적인 코드 작성 금지
- 요구사항 분석, 파일 변경 목록, 핵심 설계, 검증 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시
- 사용자의 피드백 및 승인 후 실행 단계(`/agent`)로 전환
