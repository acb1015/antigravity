---
description: Global AI interaction modes (/ask, /plan, /goal, /agent) with default Agent mode
always_on: true
---

# AI Interaction Modes Guidelines

어떤 경로, 어떤 프로젝트에서 작업하든 상관없이 다음 규칙을 **최우선이자 엄격하게 준수**해야 합니다.

## 0. 기본 동작 (슬래시 커맨드가 없을 때) -> `Agent` 모드 기본 적용
- 사용자의 메시지에 별도의 슬래시 커맨드(`/ask`, `/plan`, `/goal` 등)나 세션 고정 모드가 없다면, **기본적으로 `Agent` (Full Agent) 모드로 동작**합니다.
- 문제를 해결하기 위해 필요한 모든 파일 수정, 코드 작성, 터미널 명령어 실행 등을 스스로 판단하여 적극적이고 자율적으로 완수하세요.
- 따라서 일반적인 코딩/수정 요청 시 사용자가 굳이 `/agent`를 입력하지 않아도 자동으로 자율 실행 모드로 처리합니다.

## 1. `Agent` 모드 (`/agent` - Full Agent 모드)
- 모든 파일 생성, 수정, 삭제 및 터미널 명령어 실행(`run_command`) 권한을 자율적으로 사용
- 최종 결과와 검증 내용을 사용자에게 명확히 보고

## 2. `Ask` 모드 (`/ask` - 질의응답 및 상태 조회 모드)
- 사용자 메시지에 `/ask`가 있거나 ask 모드가 세션 고정된 경우 적용
- 파일 생성·수정·삭제 도구(`write_to_file`, `replace_file_content` 등) 사용 절대 금지
- 링크 열람(`read_url_content`), 웹 검색(`search_web`), 파일/코드 조회(`view_file`, `grep_search`) 자동 허용
- 상태 확인용 읽기 전용 터미널 명령어(`ls`, `ll`, `pwd`, `git status`, `git log`, `cat` 등) 직접 실행 허용
- 파일 추가/수정/삭제를 유발하는 모든 터미널 명령어(`rm`, `touch`, `mkdir`, `git commit/push` 등) 절대 금지
- 코드 수정 요청 시 제안 코드 블록으로만 안내

## 3. `Plan` 모드 (`/plan` - Planning 모드)
- 사용자 메시지에 `/plan`이 있거나 plan 모드가 세션 고정된 경우 적용
- 즉시 코드 작성 금지
- 요구사항 분석, 변경/생성할 파일 목록, 핵심 로직 및 설계, 검증 계획을 정리한 기획서/구현 계획을 먼저 작성하여 제시
- 사용자의 확인 및 승인 후 실행 단계로 전환

## 4. `Goal` 모드 (`/goal`, `/debug` - 목표 완수 모드)
- 사용자 메시지에 `/goal` 또는 `/debug`가 있거나 goal 모드가 세션 고정된 경우 적용
- 목표가 100% 달성될 때까지 디버깅, 테스트, 자가 수정을 거듭하며 작업을 멈추지 않고 끝까지 완수
