# Git 工作流

> 从 solo 开发到团队协作的版本控制最佳实践

## 三种工作区

工作区 → 暂存区 → 本地仓库 → 远程仓库

## 主流工作流

### GitFlow — 严谨规范

main（生产） + develop（开发） + feature/release/hotfix 分支，适合有计划发布节奏的项目。

### GitHub Flow — 简洁现代

从 main 开分支 → 提交 → PR → Code Review → 合并 → 删分支。

### Trunk-Based — 敏捷高效

所有人在主干高频提交，适合持续交付的敏捷团队。

## Commit 规范 (Conventional Commits)

```
feat: 新功能
fix: 修复 bug
docs: 文档
style: 格式调整
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

## Code Review 要点

- [ ] 逻辑正确、无 bug
- [ ] 符合代码风格
- [ ] 无硬编码敏感信息
- [ ] 公共 API 有文档
- [ ] 性能无明显退化

## 冲突解决

- 个人 feature 分支用 rebase 保持线性历史
- 公共分支用 merge 保留完整上下文
```bash
git rebase origin/main   # 个人分支
git push --force-with-lease  # 已推送过才需要
```
