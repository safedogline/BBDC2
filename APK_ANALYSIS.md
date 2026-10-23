# APK 运行原理与交互逻辑分析

## 1. 分析对象与方法

- 文件：`is_cool_lexis_5_11_7_1791969587289.apk`
- 该 APK 本身不能证明软件是开源项目：本地工作区没有上游源码仓库或许可证文件；主业务代码被加固且动态加载。此结论仅限当前材料，既不能据此认定整个产品不开源，也不能确认开源许可证允许复刻/分发。
- 声明版本：5.11.7，versionCode 由加固后的清单字符串可读为 `2762774`（仍建议用运行时 PackageManager 再确认）。
- 包名：`cn.com.langeasy.LangEasyLexis`。
- 静态分析工具：JADX 1.5.3、Apktool 2.11.1、Androguard 4.1.4、JDK jarsigner。
- JADX 能处理约 5,739 个类，其中 38 个方法/类反编译报错；生成源码共 3,679 个文件，但应用自有源码基本只剩 `MainActivity`、`NewLearnActivity` 和加固壳类。多数应用业务类被加密/延迟加载，JADX 输出不能代表完整业务源码。
- APK SHA-256：运行 `sha256sum is_cool_lexis_5_11_7_1791969587289.apk` 获取本地证据值。

## 2. 总体结论

这是“不背单词”英语词汇学习应用。产品主循环是：选择词书与学习计划 -> 按记忆调度呈现单词/辨识题 -> 用户反馈认识或不认识 -> 更新 Leitner 风格的词条状态与复习日期 -> 本地持久化 -> 登录用户将学习状态、笔记和统计同步到服务端。除此之外包含词典、例句/发音、拼写练习、听读、课堂视频、阅读练习、签到奖励、会员、主题壁纸、学习设备绑定及推送。

运行架构不是普通纯 Java APK：外层 `s.h.e.l.l.S` 是加固器 Application 壳，启动时按 ABI 解压/校验 `libexec.so` / `libexecmain.so`，调用 `com.ijm.dataencryption.DETool.loadDEso(...)` 装载加密模块，再通过壳反射委托 `cn.com.langeasy.LangEasyLexis.LexisApplication`。`assets/ijiami.ajm`、`assets/ijiami.dat`、`assets/IJMDal.Data` 与 `libijmDataEncryption*.so` 是该保护链的一部分。DEX 中可见的核心页面代码是保留下来的入口/关键覆盖实现；服务层、DAO、Application 和大多数 Activity 的细节仍在加密业务载荷中。

## 3. 启动流程

1. Android 启动 Manifest 指定的加固 Application 类 `s.h.e.l.l.S`。
2. `attachBaseContext` 调用父实现后，识别 CPU ABI，按 ABI 从 APK 的 `assets/ijm_lib/<abi>/` 解压原生执行库到应用私有 files 目录，并用 CRC32 避免重复提取。
3. 壳加载数据加密/执行库并把实际 Application 类替换/代理为 `LexisApplication`，然后转发 `onCreate`。
4. Launcher Activity 是 `SplashActivity`；清单中也声明 `MainActivity`。Splash 到主界面的完整判断逻辑属于未公开载荷，不能只凭静态资源确定所有分支。
5. `MainActivity.onCreate` 初始化用户主题、字体、壁纸、词书/学习引擎预加载、友盟统计推送、主界面、词典浮层；随后处理 Splash 广告或深链跳转，并异步拉取应用配置、成就配置和考试开关。
6. 没有选择词书时进入 `LibSelectActivity`；需要从旧版本迁移时执行本地迁移；其余情况加载词书组并启动同步链。

## 4. 首页交互与业务路由

- “学习”与“复习”入口先调用 `LoginCheckUtils.processLoginCheck`；需要登录时中断当前动作。
- “学习”根据新旧学习样式，路由到 `NewLearnActivity` 或旧版 `LearnActivity`。若新词计划/总量已完成会提示；有待复习词时通常提示先复习，也允许继续学习或加量。
- 免费学习计划可先尝试自动选择推荐词书；切换成功后清理本地学习进度并重新统计。
- “复习”依据 `BBWordProcessDao` 统计的今日待复习数进入复习页；没有任务时展示今日完成、全部完成或明日任务状态。
- “不背课堂”进入 `StudyRoomActivity`；“我的内容”进入个人词条/内容管理；“仪表盘”进入学习计划看板；签到调用奖励服务；头像进入个人空间。
- `MainActivity.onStart` 在工作线程请求预构造 Leitner 引擎实例、刷新当天时间、检查站内消息。
- 启动或回到前台时，会在隐私协议同意且非游客情况下检查剪贴板中的特定兑换码/跳转码，调用 `TouchActionService` 后清空匹配文本。这是应重点动态验证的剪贴板读取行为。
- 启动广告由服务端下发配置及图片，倒计时后上报曝光/跳过；点击可打开 Web 页面或执行内部路由。

## 5. 学习状态机

可读的 `NewLearnActivity` 代码显示学习由内存中的 `BBCoreEngineInMemory` / `LeitnerCardInMemoryImp` 驱动，数据库状态负责持久化，`BBCoreEngineInMemoryHelper` 负责异步刷新实例。

1. Activity 创建后执行 `nextWord()`；引擎取下一条 `BBWordProcess`，更新统计上下文、测试模式、内容面板、发音与进度状态。
2. 测试模式从单词当前等级推导：常见配置下第 1 级是辨识/选择测试，中间等级是熟词确认流程，末级可进入拼写/高级辨识；最大等级可为 3 或 4，受配置/计划影响。
3. “认识”调用 `mCoreEngine.iReallyKnow()`，记录成功并提升/完成当前复习阶段。等级达到最大值时显示完成动画；否则根据测试模式和是否查看提示，可能展示释义/例句后等待继续，也可能直接换下一个词。
4. “不认识”或“查看答案”调用 `iDontKnow()`，标记失败、降低/保留阶段状态并安排后续复习。选择题错误先展示正确选项和解释；答题完成后恢复交互。
5. “记错了”先恢复当前词初始状态再执行 `iDontKnow()`，相当于撤销错误的“认识”判断。
6. 每个词可同步播放词音、句子音频、切换发音类型、展开词典/例句/助记/词根等辅助内容；拼写检查以独立 Fragment 呈现。
7. 页面暂停时保存引擎数据并触发进度同步；正常结束时保存、同步并调用 `UserLearnDataManager.uploadLearnData()`。关闭页面还会结束计时、上报日学习统计。

进一步对照明文实现与资源字符串：`displayWord()` 在词条 level 为 1 时设置 `testMode=1`；最大等级为 3 时其它等级为 `testMode=0`，最大等级不是 3 时 level 3 设为 `testMode=3`，其它等级为 `testMode=0`。`lookAnswer()` 在 testMode 1/3 分支先显示选择题正确答案，再记一次 `iDontKnow()` 并展示释义；普通分支直接调用失败处理。认识会调用 `iReallyKnow()`，部分模式先呈现释义并播放词音/句音，再由“继续”前进；不认识展示答案后也有独立继续动作。字符串资源确认还有“简洁模式/丰富模式”、复习“认识/模糊”提示、“助记顺序”“拆分助记”“混淆项辨析”“词根词缀”和“派生串记”等产品界面功能。静态材料无法还原这些辅助面板的真实数据接口、词条覆盖率或模糊档对应的算法状态迁移。

复习 Activity 本体在加密载荷中，不能从现有反编译源码精确断言它的队列排序、间隔公式、遗忘判分阈值和奖励规则。Leitner 命名与状态 API 支持“按掌握等级分箱/按到期日期取词”的判断，但确切算法需解密类或运行时观测，不应根据类名臆测。

## 6. 数据与同步

安装包携带以下加密资源库：

| 文件 | 大小 | 推断用途（需解密 schema 确认） |
|---|---:|---|
| `res/raw/bbdb.db` | 7.2 MB | 应用本地词典或词条辅助数据（内容/schema 未解密，不能确认包含可选词书目录） |
| `res/raw/simple.db` | 23.0 MB | 简明词典/释义或学习辅助内容 |
| `res/raw/wordroot.db` | 7.8 MB | 词根词缀数据 |
| `res/raw/xyjc.db` | 0.8 MB | 学习/教材辅助资源 |

四个文件头均为高熵数据，不以 SQLite 标准 magic `SQLite format 3` 开始；APK 同时包含 `libsqlcipher.so`，说明数据库为 SQLCipher 或同类加密格式。未发现可直接读取的 schema。加密口令/派生过程预计位于受保护业务代码或原生库，尚未从现有明文源码取得。

可确认的同步动作：启动后登录用户调用 `SyncChainService.call2`；未完成过首次同步会展示同步提示；另调用 `NoteSyncService.syncNotes()`。学习流程结束/暂停时持久化词卡状态并触发同步；首页离线检查发现有待同步词卡时显示网络提示；切换词书会清理学习状态并上传词书/计划配置。应用配置、考试功能开关、成就配置、启动广告、签到、消息、推送 token 和点击统计均会走服务层请求。

静态可见的 URL 只有帮助中心与酷币指南 `learnywhere.cn` 页面；API 主机、路径、请求签名、认证头和 TLS pinning 位于加密业务层，当前无法从 JADX 明文结果可靠枚举。

## 7. Web 与媒体实现

APK 带有本地 WebView 页面与 JS：`exam.html`、`interpret_sentence.html`、`test.html`、`collins.html`、`media.html`，及 Zepto、模板、播放、考试交互脚本。这说明考试、Collins 词典、例句解析和媒体展示至少部分用本地 HTML/JS 与原生 WebView 桥混合实现。`media.html` 约 51 KB，`assets/js/media.js` 约 29 KB。课堂内容还声明 iframe Activity、视频/图片 Activity，并打包 ExoPlayer 资源。

## 7.1 内容来源证据

- `assets/test.html` 明确写明《柯林斯英汉双解大词典》由哈珀·柯林斯出版社授权，并称 6 万条真实例句来源于 Bank of English；同页宣称词典约 20 万词条。`assets/collins.html` 词条页带有 `© HarperCollins Publishers 2023`。这确认 Collins 词典与所述例句存在第三方授权/版权来源，不应从 APK 提取后直接用于另一产品。
- 用户指出词书选择中有“雅思词汇真经”等具体书目。APK 的明文资源与 DEX 字符串中没有找到该书名或一份完整可选书目；选择流程调用 `MyLibManager.loadBookGroupIfNotExist()`，学习流程可按 `bookCode` 调用 `LexisBooks.getBookByBookCode()`。对应服务实现处于加固载荷，因此这些线索支持“书目分组/词书内容由应用服务层加载”的判断，但目前没有接口响应、书籍元数据或版权字段，不能据此确认该书与其他考试词书的实际来源、改编关系或授权状态。
- `res/values/strings.xml` 提供“自制词书”“上传词书”“需要联网下载词书”等文案，表明产品支持用户创建/上传词书且词书可在线下载；它没有说明服务器上的每本词书授权状态。
- 本地 `assets/js/media.js` 可见 `apiHost: https://langeasy.com.cn` 与 `imgCdn: https://img.beingfine.cn`。这是媒体 WebView 的配置证据，不足以断定所有原生 API 都使用同一 host；词书服务的具体路径仍在加密业务层。
- 四个随包加密数据库（`bbdb.db`、`simple.db`、`wordroot.db`、`xyjc.db`）可表明应用内置词典/词根等数据，但其内容来源、许可文本和逐条归属没有从当前可读内容中识别出来。数据库加密不等于内容属于开放许可。

**复刻判断**：学习流程、状态机、计划和“单词+语句+语音”交互可以独立实现；已有明确来源的 Collins 定义和 Bank of English 例句需要另行取得授权，不能把 APK 中的数据包当作可复用语料。对“雅思词汇真经”等具体书目，目前既未确认其在 APK 中的储存形式，也未确认原书版权方是否授权应用方收录、改编或数字化。要回答该书的来源，需取得应用实际展示的词书详情/版权说明、服务端返回的书目元数据，或由版权方/应用运营方确认；不能仅凭书名或可下载性推断授权。复刻时应逐本核验来源与许可；若授权不明，使用开放许可词典/语料或自行编写内容，并保留来源、版本、许可与署名元数据。

## 8. 权限与三方组件

清单可见权限包括网络/网络状态、Wi-Fi、摄像头、录音、精确位置、日历读写、蓝牙/扫描/连接、外部存储、唤醒锁、前台媒体播放、通知、安装包请求、查询所有包及 DUMP。声明不等于所有权限都会在运行时申请或持续使用；需通过系统授权记录及动态调用确认实际启用场景。

可见组件/SDK 包括：友盟统计/推送/崩溃监控、阿里 Agoo/ACCS、阿里一键登录/运营商认证、支付宝、微信支付/分享、QQ、微博、相机扫码 ZXing、腾讯登录、SQLCipher、ExoPlayer、视频/音频相关原生库。`libskegn.so` 等语音库提示有语音能力，但是否在此版本的普通学习流程中启用须动态验证。

## 9. 安全观察

- `res/xml/network_security_config.xml` 配置 `<base-config cleartextTrafficPermitted="true"/>`，即 Android 网络层允许明文 HTTP；不代表所有 API 都使用 HTTP，但任何明文端点上的凭据/学习数据都存在被同网段观察或篡改风险。需要从解密服务层或代理流量验证实际请求。
- `jarsigner -verify` 显示归档签名结构验证通过。签名者证书为自签名 `CN=iscool, OU=iscool, L=BeiJing, C=ZH`，RSA 1024 位、SHA1withRSA，弱于当前推荐的签名强度；证书链不受系统 CA 信任。安装包 SHA-256 需要与可信发行渠道提供的哈希比对，单独的签名校验通过不等于来源可信。
- APK 请求 `QUERY_ALL_PACKAGES`、`REQUEST_INSTALL_PACKAGES`、`ACCESS_FINE_LOCATION`、`RECORD_AUDIO`、日历和蓝牙等高影响权限；每项要以功能需要、实际触发点和用户授权记录核实。
- 加固代码检查 `/proc/self/maps`、识别 ABI/动态 linker 并延迟加载原生库，增加静态审计和插桩难度；这本身不证明恶意行为。
- 剪贴板兑换码处理、动态路由、WebView 桥、推送通知深链及可导出组件的完整权限/校验条件仍需 Manifest 规范解析或设备实测。

## 10. 运行时分析状态与未完成项

已下载 JADX、Apktool、Android Platform Tools；`adb devices -l` 当前无设备。工作主机没有 `/dev/kvm`，没有 Android Emulator/SDK system image；账号没有免密 sudo。Docker daemon 可用，但本地仅有无关镜像，没有 Android 容器镜像。因此尚未安装/运行目标 APK，不能声称已经观察真实界面、网络流量、权限弹窗或数据库解密结果。

要达到行为级透彻验证，下一步需要以下任一条件：

1. USB 连接 Android 测试机并开启 USB debugging，确认 RSA 授权后提供 `adb devices -l` 可见设备；或
2. 提供可用 Android 模拟器/云真机，并允许从此工作环境通过 ADB 连接。

动态计划：安装并记录首次启动/隐私同意/游客登录/账号登录；逐项操作选词书、计划、学习正确/错误/查看答案/拼写、复习、同步、笔记、签到、课堂、扫码/蓝牙设备；用 logcat、UI hierarchy、屏幕录制、代理抓包和应用私有目录数据库副本记录调用链。网络测试只使用授权测试账号和隔离代理，不对真实业务账号做修改性/支付性操作。

## 11. 证据源码位置

- 加固 Application 解包、加载、委托：`/tmp/opencode/jadx-out/sources/s/h/e/l/l/S.java`
- 首页启动、登录门控、学习/复习路由、同步调用：`/tmp/opencode/jadx-out/sources/cn/com/langeasy/LangEasyLexis/activity/MainActivity.java`
- 学习答题、记忆状态变更、保存和上传：`/tmp/opencode/jadx-out/sources/cn/com/langeasy/LangEasyLexis/activity/NewLearnActivity.java`
- 解出的 Android Manifest 字符串与组件：`/tmp/opencode/jadx-out/resources/AndroidManifest.xml`（仍是二进制 XML，JADX 原样提取；标准 Apktool/Androguard 解析均失败）
- 网络安全配置：`/tmp/opencode/jadx-out/resources/res/xml/network_security_config.xml`
