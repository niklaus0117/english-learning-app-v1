# 英语学习 App 后端开发设计方案 (Backend Design Document)

## 1. 架构概述 (Architecture Overview)

本后端系统旨在为英语学习App提供稳定、高性能的API服务。基于现有的前端功能需求，后端建议采用**模块化单体架构 (Modular Monolith)** 或 **微服务架构 (Microservices)**（视初期团队规模和预估并发量而定，初期推荐基于 Node.js/NestJS 或 Java/Spring Boot 的单体架构以快速迭代）。

- **编程语言/框架**：Node.js (NestJS / Express) 或 Java (Spring Boot) 或 Go。
- **关系型数据库**：PostgreSQL 或 MySQL（存储用户、课程、订单、笔记等结构化数据）。
- **缓存与临时存储**：Redis（用于存储热点字典数据、用户会话/JWT黑名单、高频访问的字幕和首页推荐列表、以及短信验证码）。
- **对象存储 (OSS)**：AWS S3 或 阿里云 OSS（存储音视频媒体文件、文章封面图、用户头像等）。
- **AI/外部接口服务**：对接大模型 API（如 Google Gemini 或 OpenAI）进行句子解析、AI语伴对话，对接云词典服务（获取标准化音标和释义）。

---

## 2. 核心数据模型 (Data Models)

基于当前 `types.ts` 和前端业务逻辑，设计以下核心数据库表结构 (Schema)：

### 2.1 用户与鉴权体系 (User & Auth)
**`users` 表**
- `id` (UUID, Primary Key)
- `phone_number` (String, Unique) - 手机号登录为主
- `nickname` (String)
- `avatar_url` (String)
- `is_vip` (Boolean) - 会员标识
- `vip_expire_at` (Timestamp) - 会员过期时间
- `created_at`, `updated_at` (Timestamp)

### 2.2 内容管理体系 (Content & Course)
**`courses` 表** (课程/教材/剧集)
- `id` (UUID, Primary Key)
- `title` (String)
- `subtitle` (String)
- `description` (Text)
- `category` (String) - 分类，如 Science, TED, Bookshelf
- `author` (String)
- `price` (Decimal)
- `image_url` (String)
- `play_count` (Integer)
- `vocabulary_count` (Integer)
- `is_vip` (Boolean) - 是否为VIP专属

**`lessons` 表** (具体课时/单集视频)
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key)
- `title` (String)
- `duration` (String/Integer) - 时长
- `media_type` (Enum: 'video', 'audio')
- `media_url` (String) - 媒体文件OSS地址
- `cover_url` (String)
- `sort_order` (Integer) - 课程内排序

**`lesson_sentences` 表** (字幕/原文轨道)
- `id` (UUID, Primary Key)
- `lesson_id` (UUID, Foreign Key)
- `eng_text` (Text) - 英文原文
- `zh_text` (Text) - 中文翻译
- `start_time` (Float) - 句子开始时间(秒)
- `duration` (Float) - 句子持续时间(秒)

### 2.3 学习互动与进度管理体系 (Learning & Interaction)
**`user_lesson_progress` 表** (学习进度)
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `lesson_id` (UUID, FK)
- `progress_seconds` (Float) - 播放进度
- `is_learned` (Boolean) - 是否已学完
- `last_played_at` (Timestamp)

**`user_notes` 表** (用户笔记)
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `lesson_id` (UUID, FK)
- `video_timestamp` (String/Float) - 视频时间标记
- `content` (Text) - 笔记草稿/正文
- `created_at` (Timestamp)

**`user_collections` 表** (收藏/书架)
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `lesson_id` (UUID, FK)
- `created_at` (Timestamp)

**`user_vocabularies` 表** (生词本)
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `word` (String) - 单词
- `added_at` (Timestamp)
- `review_count` (Integer) - 复习次数 (支持后续艾宾浩斯记忆法扩展)

---

## 3. 核心 API 接口定义 (RESTful APIs)

为保证前端使用 `types.ts` 中的 `ApiResponse<T>`，所有接口返回标准格式：
```json
{
  "code": 200, 
  "message": "success",
  "data": { ... }
}
```

### 3.1 认证模块 (`/api/auth`)
- `POST /auth/send-code`：发送手机验证码 (基于第三方SMS服务)。
- `POST /auth/login`：手机号+验证码登录，成功返回 JWT Token 和用户信息。
- `GET /auth/me`：通过Header的授权Token获取当前登录用户详情。

### 3.2 内容展示模块 (`/api/courses` & `/api/lessons`)
- `GET /courses`：获取首页课程列表，支持多条件筛选 (`?category=TED&isVip=true&limit=10`)。
- `GET /courses/:id`：获取课程详情（包含包含哪些lessons）。
- `GET /lessons/:id/transcripts`：**高频接口**。获取单集视频的完整双语字幕列表（数组）。建议接入Redis缓存或直接输出为 CDN JSON 静态文件。

### 3.3 学习互动作业模块 (`/api/user`)
- `POST /user/progress`：定期上报播放进度。
- `GET /user/notes`：获取当前登录用户在某节课的所有笔记 (`?lessonId=xxx`)。
- `POST /user/notes`：提交或更新笔记。
- `POST /user/vocabulary`：双击单词本添加生词。
- `GET /user/collections`：获取书架收藏列表。

### 3.4 AI 辅助解析模块 (`/api/ai` & `/api/dict`)
- `GET /dict/word?q={word}`：查词接口。聚合发音(英/美)、音标、多词性释义、例句。
- `POST /ai/analyze-sentence`：
  - 功能：点击 ✨ 按钮触发。
  - 请求载荷：`{ "sentence": "I am looking forward to..." }`。
  - 处理：透传给大模型(Prompt注入: 角色是一名专业英语老师，解析语法结构和核心词汇)。
- `POST /ai/chat`：处理AI助教页面的多路并发聊天历史，可采用 SSE (Server-Sent Events) 支持流式输出，提高前端响应体验。

---

## 4. 重点业务处理逻辑与挑战 (Key Challenges)

1. **防盗链与媒体传输安全**：
   `media_url` 不应暴露 OSS 的真实公共链接。应该在请求 `GET /lessons/:id` 时，由后端签名生成一个**短期有效的防盗链 URL (Presigned URL)** 下发给前端，防止视频资源被恶意搬运。

2. **AI 解析接口防刷与限流策略 (Rate Limiting)**：
   由于 LLM 大模型接口调用成本高，需在网关层或业务层对 `/api/ai/*` 相关接口做好并发控制和限流。非 VIP 用户每天限制调用解析服务 20 次，VIP 用户不限量或提高阈值。

3. **字幕加载性能保障**：
   一节10分钟的视频，字幕可能有 100-200 句。不应该每次查询都扫库。
   - **方案A**：将 `lesson_id` 作为 Key 缓存在 Redis。
   - **方案B**：审核打包视频时，直接在 OSS 生成一份对应的 `transcript_{lessonId}.json`，前端通过 URL 直拉 CDN，彻底解放后端数据库。目前前端依靠时间轴驱动，方案B具有显著的成本优势和速度优势。

4. **实时保存 (Debounce / Synchronization)**：
   前端在提交笔记和上报播放进度时(TimeUpdate)，触发频率极高。后端需使用批量入库或要求前端执行节流 (Throttle/Debounce)。推荐每 5-10 秒进行一次 Progress 心跳同步，大幅降低写库开销。

## 5. 开发建议与迭代路线
- **Phase 1 (MVP)**：跑通 Auth（可以先做账密模拟，后上短信）、课程和视频内容的 CRUD 管理、完成字典Mock数据的真实API接替。
- **Phase 2**：集成 AI 大语言模型打通 "句子解析" 与 "AI对话" 动态能力；实现 OSS 对象存储防盗链。
- **Phase 3**：引入订阅支付系统(Stripe/Wechat Pay)，解锁 VIP 系统权限，引入用户积分时长排行榜。
