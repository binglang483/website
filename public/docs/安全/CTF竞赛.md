# CTF 竞赛

> Capture The Flag · 网络安全攻防竞赛

## CTF 是什么

CTF（Capture The Flag，夺旗赛）是一种网络安全竞赛形式，选手通过解决各种安全挑战，找到"Flag"（一般是 flag{...} 格式的字符串）来得分。

## 比赛类型

| 类型 | 说明 | 常见 Flag 形式 |
|------|------|----------------|
| 解题赛 Jeopardy | 类似答题，题目分方向，解开拿分 | 静态 Flag |
| 攻防赛 Attack-Defense | 每队防守自己的服务器，攻击对方 | 动态 Flag，定时更换 |
| 混合赛 | 攻防 + 解题 | 两种都有 |
| King of the Hill | 持续控制目标拿分 | 在线 Flag |

## 题目方向

### Web（网络安全）

```
常见考点:
├── SQL 注入（报错、联合、盲注、堆叠）
├── XSS（反射、存储、DOM、CSRF）
├── 文件上传（绕过、.htaccess、伪协议）
├── 文件包含（LFI、RFI、伪协议、Session）
├── SSRF（内网探测、云元数据）
├── 反序列化（PHP、Java、Python pickle）
├── SSTI（模板注入，Jinja2、Freemarker）
├── 逻辑漏洞（支付、越权、验证码）
├── Node.js（原型链污染）
└── 0day（最新 CVE）
```

**必备工具**：Burp Suite, SQLMap, Dirsearch/Gobuster

### Pwn（二进制利用）

```
学习路线:
Level 1: 基础
├── ret2win          → 控制 ret addr 到后门函数
├── ret2shellcode    → 栈上执行 shellcode
├── ret2libc         → 找 libc base → 调 system("/bin/sh")
└── canary 绕过      → 格式化字符串 / 偏移

Level 2: ROP
├── 32/64 ROP Chain  → 拼接 gadget
├── ret2csu          → glibc 初始化函数链
└── 栈迁移           → Stack Pivoting

Level 3: 堆利用
├── tcache poisoning
├── fastbin attack
├── house of force
├── house of spirit
└── unsafe_link / largebin

Level 4: Kernel Pwn
└── eBPF / Driver 漏洞
```

**必备工具**：pwntools, pwndbg, x64dbg, Ghidra

### Reverse（逆向工程）

```
题型:
├── 算法还原    → 找到加密算法，写解密脚本
├── Flag 检查   → 跟踪判断逻辑，算出正确输入
├── 反调试      → 绕过反调试，继续分析
├── 加壳脱壳    → 先脱壳再分析
├── VM 逆向     → 逆向自定义虚拟机
└── .NET / Java → dnSpy / jd-gui 反编译
```

### Crypto（密码学）

```
常见考点:
├── RSA 弱密钥 (e=1, p-q接近, 小e广播攻击)
├── AES / DES (ECB, CBC padding oracle)
├── 哈希碰撞 (MD5, SHA1)
├── Lattice Attack (LLL, NTRU)
├── 格密码 / 后量子
├── 已知明文 / 选择明文
└── 侧信道（时序、能量、声学）
```

### Misc（杂项）

```
包含但不限于:
├── 隐写术 (图片、音频、PDF)
├── 流量分析 (pcap 找数据、TCP 重组)
├── 编码解码 (base64, rot13, 维吉尼亚)
├── 压缩包爆破 (zip, rar 字典攻击)
├── 二维码 / 条形码
├── 图像处理 (LSB、位平面)
├── 日志分析
├── 社会工程
└── 密码爆破
```

## 解题环境搭建

### 推荐工具链

```
├── 操作系统: Ubuntu 22.04 LTS
├── Python 3.10+ (主力语言)
│   ├── pwntools (Pwn)
│   ├── requests + BeautifulSoup (Web)
│   ├── hashlib / pycryptodome (Crypto)
│   └── z3-solver (约束求解)
├── GDB + pwndbg + gef (动态调试)
├── IDA Pro 7.5 / Ghidra (静态分析)
├── Burp Suite Community (Web 抓包)
├── Volatility (内存取证)
└── Wireshark (流量分析)
```

### 基础 Python 模板

```python
from pwn import *

context.log_level = 'debug'
context.arch = 'amd64'

# 连接远程服务器
p = remote('challenge.ctf.com', 31337)

# 构造 Payload
payload = b'A' * 64 + p64(0x401186)  # ret2win

# 发送
p.sendline(payload)

# 接收 Flag
flag = p.recvall()
print(flag.decode())
p.close()
```

### Web 解题模板

```python
import requests

url = 'http://challenge.ctf.com/login'
session = requests.Session()

# 普通请求
resp = session.get(url)

# SQL 注入示例
data = {'username': "admin' OR '1'='1", 'password': 'anything'}
resp = session.post(url, data=data)

# 检查 Flag
if 'flag{' in resp.text:
    print(resp.text)
```

## 重要 CTF 赛事

| 赛事 | 性质 | 时间 | 说明 |
|------|------|------|------|
| CTFHub | 国内综合 | 全年 | 新手友好，有 Web Pwn Reverse |
| BUUCTF | 靶场 | 全年 | 大量题目，免费 |
| XCTF | 国内强队 | 每年 | 高校+企业 |
| 强网杯 | 国内 | 每年 | 公安部主办 |
| 0CTF | 国际 | 每年 | 华人强队 CTF |
| De1CTF | 国际 | 每年 | 难度较高 |
| 湖湘杯 | 国内 | 每年 | 高校赛 |
| ICPC Cyber | ACM 赛制 | 每年 | 类似 ICPC |

## 推荐训练平台

| 平台 | 类型 | 地址 |
|------|------|------|
| CTFHub | 在线靶场 | ctfhub.com |
| Buuoj | 在线靶场 | buuoj.cn |
| NSSCTF | 国内靶场 | ctf.nssctf.cn |
| Hack The Box | 国际靶场 | hackthebox.com |
| TryHackMe | 新手向 | tryhackme.com |
| CryptoHack | 密码学 | cryptohack.org |
| picoCTF | 入门 | picoctf.org |
| Codewars | 编程 | codewars.com |

## 学习路径

### 阶段一：入门（3-6 个月）

1. **学 C 语言**：指针、内存、函数
2. **学 Python**：脚本、requests、pwntools
3. **学汇编**：x86 → x64，会读会写
4. **做简单 Pwn**：ret2win / ret2shellcode
5. **做简单 Web**：SQLi / XSS / 文件上传

### 阶段二：进阶（6-12 个月）

1. **堆利用**：tcache / fastbin / unsorted bin
2. **ROP**：gadget 组合、ret2libc
3. **Web 进阶**：反序列化、SSTI、RCE
4. **逆向**：算法还原、.NET、加壳
5. **Crypto**：RSA 漏洞、LLL、AES 攻击

### 阶段三：专精

选 1-2 个方向深入：
- **Pwn 大佬**：Kernel Pwn、浏览器 UAF
- **Web 大佬**：0day、漏洞挖掘
- **Crypto 大佬**：后量子、格密码
- **Reverse 大佬**：VM、对抗分析
