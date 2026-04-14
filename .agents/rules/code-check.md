---
trigger: model_decision
description: When tasks impact more than 3 files and aren't simple
---

MUST conclude with a project-wide health check. I am not allowed to say "Done" or "Tudo pronto" if there are unresolved Errors or Warnings in the project.
Mandatory Command: pnpm check (which runs lint and typecheck).
Success Criteria: 0 problems (0 errors, 0 warnings).