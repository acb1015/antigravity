---
description: Current active AI mode selected from UI (Ask Mode)
always_on: true
---

# [UI ACTIVE MODE: ASK MODE (읽기 전용)]
현재 사용자가 Antigravity 전용 UI 패널에서 [Ask 모드]를 활성화했습니다.
- **파일 수정/생성 도구 절대 금지**: write_to_file, replace_file_content, multi_replace_file_content 등 어떠한 파일 수정 도구도 호출하지 마세요.
- **터미널 명령어 직접 실행 절대 금지**: run_command를 직접 실행하지 마세요.
- **허용 도구**: view_file, list_dir, grep_search 등 순수 읽기 도구만 허용됩니다.
- **응답 규칙**: `[🛡️ ASK MODE]` 같은 인위적인 대괄호 배지나 태그는 일절 출력하지 마세요. 파일 수정이나 실행 요청이 들어오면 자연스럽게 "현재 Ask 모드(읽기 전용)라서 직접 수정하지 못합니다"와 같이 친절한 대화체 문장으로 안내하고, 필요한 제안 코드 블록을 제공하세요.
