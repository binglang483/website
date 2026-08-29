# 个人知识网站

全领域知识平台，涵盖安全、开发、设计、理工、外语、经济、管理、医学、职业技能等12大领域。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | Nuxt 4 (Vue 3) | 4.x |
| UI | TailwindCSS | 3.x |
| 状态管理 | Pinia | 4.x |
| 后端 | Spring Boot | 3.2.0 |
| 数据库 | SQLite | - |
| ORM | MyBatis-Plus | 3.5.5 |
| 内容存储 | Markdown 文件 | - |
| 认证 | JWT | - |
| 包管理 | pnpm | 11.x |

## 快速开始

### 一键启动

```bash
cd ~/Desktop/website
./start.sh
```

### 手动启动

**后端（终端1）：**
```bash
cd ~/Desktop/website/backend
mvn spring-boot:run
```

**前端（终端2）：**
```bash
source ~/.nvm/nvm.sh && nvm use 22
cd ~/Desktop/website/frontend
pnpm dev
```

### 停止服务

```bash
./stop.sh
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端首页 | http://localhost:3000 |
| 管理后台 | http://localhost:3000/admin |
| 后端 API | http://localhost:8080 |

## 默认管理员

- 用户名：`maohai`
- 密码：`root`

## 功能说明

### 前台功能
- **首页**：12大知识领域展示
- **博客**：Markdown 编辑器，支持粘贴图片，文章权限控制
- **知识库**：左侧树形导航，子分类笔记管理
- **用户系统**：注册、登录、评论

### 管理后台
- **仪表盘**：数据统计概览
- **用户管理**：用户列表、编辑、禁用、角色分配、重置密码
- **知识库管理**：领域和子分类的增删改
- **博客管理**：文章审核、下架、删除
- **评论管理**：评论审核、屏蔽、删除
- **系统设置**：网站名称、描述、注册开关、评论审核开关

## 12大知识领域

| 领域 | 细分方向 |
|------|----------|
| **安全** | 逆向工程、漏洞分析、漏洞利用、病毒分析、加壳脱壳、CTF竞赛、渗透测试、安全工具开发 |
| **开发** | 前端开发、后端开发、移动端开发、游戏开发、嵌入式/物联网、桌面应用、数据库管理、云原生与DevOps |
| **设计** | 平面设计、UI/UX设计、3D设计与建模、视频与动效、游戏美术、工业设计 |
| **理学** | 数学、物理学、化学、天文学、地理科学、大气/海洋科学、地球地质学、生物科学、统计学、心理学 |
| **工学** | 计算机与电子信息、机械与能源动力、土木建筑水利、材料化工、航空航天兵器、地质矿业安全、交通运输、轻工纺织食品、环境与生物工程、核工程 |
| **医学** | 基础医学、临床医学、口腔医学、预防医学、药学、生物医学工程、医学检验、医学影像、公共卫生 |
| **交叉新兴** | 大数据/AI/区块链、新能源/储能、半导体/芯片、生物医学/合成生物、遥感/空间信息、智能制造/机器人、量子信息/计算 |
| **外语** | 英语、日语、韩语、俄语、翻译学、小语种 |
| **经济学** | 理论经济、金融学、国际贸易、财政学、税收、保险、数字经济 |
| **管理学** | 工商管理、公共管理、管理科学与工程 |
| **职业技能** | 产品/策划、运营/市场、工业制造、研发管理、人力资源、财务/会计、采购/供应链、销售 |
| **通识** | 学习方法、工具效率、资源分享 |

## 项目结构

```
website/
├── frontend/              # Nuxt 4 前端
│   ├── pages/             # 页面
│   │   ├── admin/         # 管理后台
│   │   ├── blog/          # 博客
│   │   └── knowledge/     # 知识库
│   ├── components/        # 组件
│   ├── stores/            # Pinia 状态管理
│   ├── layouts/           # 布局
│   └── server/api/        # API 路由（笔记）
│
├── backend/               # Spring Boot 后端
│   └── src/main/java/com/knowledge/
│       ├── controller/    # 控制器
│       ├── entity/        # 实体类
│       ├── mapper/        # MyBatis Mapper
│       ├── service/       # 服务层
│       ├── config/        # 配置类
│       └── util/          # 工具类
│
├── content/               # Markdown 内容存储
│   ├── blog/              # 博客文章
│   └── {领域}/{子分类}/   # 知识库笔记
│
├── start.sh               # 一键启动脚本
├── stop.sh                # 停止脚本
└── docs/                  # 项目文档
```

## 数据存储

| 类型 | 存储方式 | 路径 |
|------|---------|------|
| 用户数据 | SQLite | backend/data/app.db |
| 文章数据 | SQLite | backend/data/app.db |
| 评论数据 | SQLite | backend/data/app.db |
| 分类数据 | SQLite | backend/data/app.db |
| 系统设置 | SQLite | backend/data/app.db |
| 知识库笔记 | Markdown | content/{领域}/{子分类}/ |

## 开发命令

```bash
# 前端
cd frontend
pnpm dev       # 开发模式
pnpm build     # 构建
pnpm generate  # 静态生成

# 后端
cd backend
mvn spring-boot:run          # 开发模式
mvn clean package            # 打包
java -jar target/*.jar       # 运行
```

## 文档

- [项目方案文档](docs/项目方案文档.md)
- [网站板块分类体系](docs/网站板块分类体系.md)
