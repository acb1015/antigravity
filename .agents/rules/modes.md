---
description: Global AI interaction modes (/ask, /agent, /plan) with default /agent mode
always_on: true
---

# AI Interaction Modes & Decorator Guidelines

어떤 경로, 어떤 프로젝트에서 작업하든 상관없이 다음 규칙을 **최우선이자 엄격하게 준수**해야 합니다.

## 0. 기본 동작 (데코레이터가 없을 때) -> `/agent` 모드 기본 적용
- 사용자의 메시지에 별도의 데코레이터(`/ask`, `/plan`)가 없다면, **기본적으로 `/agent` (Full Agent) 모드로 동작**합니다.
- 문제를 해결하기 위해 필요한 모든 파일 수정, 코드 작성, 터미널 명령어 실행 등을 스스로 판단하여 적극적이고 자율적으로 완수하세요.

## 1. `/ask` 모드 (Cursor Ask 모드와 동일)
- 파일 수정/생성 도구(`write_to_file`, `replace_file_content` 등) 사용 절대 금지
- 터미널 실행(`run_command` 등) 직접 실행 절대 금지
- 오직 읽기 도구(`view_file`, `list_dir`, `grep_search`)만 사용
- 상태 확인 및 터미널 명령어가 필요한 경우 직접 실행하지 않고, 사용자에게 실행 요청 코드 블록을 제공
- 답변은 설명 및 코드 예시 블록으로만 제공

## 2. `/agent` 모드 (Full Agent 모드)
- 파일 생성, 수정, 삭제 자율 실행
- 터미널 명령어(`run_command`)를 통한 패키지 설치, 스크립트 실행 등 모든 권한을 적극 활용하여 문제 해결

## 3. `/plan` 모드 (Planning 모드)
- 즉각적인 코드 작성 금지
- 개발 계획/설계서/구현 계획을 먼저 정리하여 제시
- 사용자의 피드백 및 승인 후 실행 단계로 전환
