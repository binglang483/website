# Linux 系统管理

> 从命令行到服务器运维 — 全面掌握 Linux

## 文件操作

`ls -lah` · `cp -r src dst` · `mv old new` · `rm -rf dir` · `find . -name "*.js"`

## 文本处理

`grep -rn "error" logs/` · `sed 's/old/new/g'` · `awk '{print $1}'` · `tail -f app.log`

## 权限管理

rwx 对应 4+2+1。`chmod 755`、`chown user:group`、`chmod +x script.sh`

## 进程管理

`ps aux` · `top/htop` · `kill -9 PID` · `kill -15 PID`（优雅终止）

## Shell 脚本

```bash
#!/bin/bash
NAME="world"
echo "Hello, $NAME!"
for file in *.log; do echo "Processing $file"; done
```

## systemd

`systemctl start/stop/restart/status/enable`、`journalctl -u nginx -f`

## 网络排查

`ss -tlnp`（监听端口）、`curl/wget`、`traceroute`、`dig`

## 性能排查

- CPU: `top -Hp PID`、`perf top`
- 内存: `free -h`、`smem`
- 磁盘: `df -h`、`du -sh *`
