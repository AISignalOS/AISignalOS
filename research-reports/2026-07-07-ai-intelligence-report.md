# AISolutionsOS AI Intelligence Report
**Window:** 2026-06-30 → 2026-07-07 (7 days) · **Compiled:** 2026-07-07

> **Note on time window:** The source brief for this report left the time window as a placeholder. No prior report exists in this repo to anchor a "since last report" cadence, so a 7-day trailing window was used. A small number of items just outside the window are included where they are still actively rolling out or being discussed, and are labeled `[PRE-WINDOW, ONGOING]`.

---

## 1. Executive Summary

The week's dominant story is **frontier-model access control**: both OpenAI (GPT-5.6 Sol/Terra/Luna) and Anthropic (Claude Fable 5/Mythos 5) shipped new top-tier models this window under explicit **government-linked access restrictions** — OpenAI limited GPT-5.6 to ~20 vetted partner orgs tied to a U.S. cyber Executive Order process, while Anthropic had Fable 5 briefly suspended for foreign nationals under an export-control directive before redeploying it globally on July 1 with new cyber safeguards. This is a genuinely new dynamic for AI-education content: model access is no longer just a pricing/tier question, it's now a policy question.

On the **builder-tooling side** — the area most directly actionable for AISolutionsOS — three things matter most:
1. **Anthropic shipped six Claude Code releases in seven days** (v2.1.197→202), including subagents running in the background by default, stacked skill invocations (up to 5 at once), and a permission-mode rename — all of which change how multi-agent workflows should be built starting now.
2. **Google pulled the plug on Gemini CLI for individual users** (effective June 18, still the top story being processed this week) and is pushing everyone to the closed-source Antigravity CLI — a hard migration deadline for anyone with Gemini-CLI-based content or automations.
3. **MCP is entering a major protocol revision** (2026-07-28 spec, stateless core, new Extensions framework) with beta SDKs already out, plus continued cross-vendor adoption (X's hosted MCP server, Google's 50+ managed MCP servers, Codex CLI and Claude Code both shipping MCP-specific fixes this week).

Model-pricing/economics also moved: Claude Sonnet 5 launched as the new free/Pro default at introductory pricing but with a ~30% larger tokenizer (quietly raising real cost for existing integrations), and OpenAI's Workspace Agents switched from free to credit-metered billing.

Net effect for AISolutionsOS: this window is *unusually rich* in "how to build agentic workflows right now" material (skills stacking, subagent patterns, MCP migration, CLI-shutdown migration guides) and in *timely, defensible* educational content about AI governance/model-access policy — both underused angles relative to generic "new model dropped" coverage.

---

## 2. Official Updates

Each entry: **Product/Tool** — What changed — *Date* — Source type — Why it matters — Link — **Confidence**

### 2.1 OpenAI

| Product | What Changed | Date | Source Type | Why It Matters | Confidence |
|---|---|---|---|---|---|
| ChatGPT | GPT-5.5 Instant Mini becomes new fallback model when rate limits are hit (replaces GPT-5.3 Instant Mini); better intent-tracking, fewer factual errors | 2026-07-06 | Official release notes | Better "downgrade" experience for free/Plus users who hit limits mid-workflow | High |
| ChatGPT | Personal finance tools (Plaid bank/brokerage connections, spending dashboards) expanded from Pro-only preview to Plus (web/iOS) and Pro/Plus (Android); 12,000+ institutions | ~06-25–06-30 | Official blog + TechCrunch, American Banker | Concrete mainstream feature to build tutorials/comparisons around; signals push into regulated fintech territory | High |
| ChatGPT | GPT-4.5 fully retired from ChatGPT incl. custom GPTs; auto-migrates to GPT-5.5 | 2026-06-26 | Official blog + gHacks | Anyone with a custom GPT/prompt tuned to GPT-4.5 should re-test — behavior now comes from GPT-5.5 | High |
| ChatGPT (Enterprise/Edu/Business) | Model picker renamed to plain-language tiers (Instant/Medium/High/Extra High/Pro Standard/Pro Extended); workspace-level plugin/app admin management added | 2026-06-26 | Official release notes (aggregator-sourced) | Simplifies "which model to pick" guidance for non-technical audiences; governance now a first-class admin concern for team/agency-facing products | Medium |
| ChatGPT Atlas (browser) | Agent Mode less "lazy" on repetitive tasks; improved Cmd+F fuzzy match; opt-in "browser memories" | Ongoing into early July | Official release notes + TechRadar | Directly affects reliability of Atlas-based research/data-entry automations | Medium |
| OpenAI API | `gpt-realtime-2.1` / `-mini` released: ~25% lower p95 latency, better alphanumeric/noise handling, configurable reasoning effort + tool use for voice agents | 2026-07-06 | Official API changelog | Meaningful jump for anyone building voice agents/IVR-style automations, not cosmetic | High |
| Codex | Codex Remote reaches General Availability on all paid plans; new authenticated QR-pairing relay architecture keeps dev machines off the public internet | 2026-06-25 (GA) | Official blog + TechCrunch, TechTimes | Lets solopreneurs kick off/monitor coding agents from a phone — lowers "must be at your desk" friction | High |
| Codex CLI | v0.142.2–0.142.5: MCP tool improvements, macOS system-proxy support, plugin dark mode, curated plugin rankings, trace-log privacy fix, better Bedrock credential errors | 2026-06-25–07-01 | Official changelog | Direct relevance to anyone maintaining an MCP integration with Codex | High |
| Codex | Feature wave: `/usage` credit redemption, reorganized `/plugins` browser, rollout token budgets, multi-agent delegation controls, indexed web search, new DigitalOcean plugin (self-provisions a remote workspace) | Late June, still current | Official changelog + third-party (Developers Digest) | Plugin ecosystem + cloud self-provisioning is directly relevant to workflow builders wanting Codex to manage its own infra | Medium-High |
| OpenAI Dev Tools | AgentKit's Agent Builder + Evals deprecation confirmed: unavailable after 2026-11-30 (Evals read-only from 10-31); ChatKit/Connector Registry unaffected | Announced 06-03; deadline 11-30 | Official deprecation notice | Any content/templates built on no-code Agent Builder need a migration note before Nov 30 | High |
| OpenAI Dev Tools | Assistants API full removal deadline: 2026-08-26 (~7 weeks out); push to Responses API | Deadline 08-26 (background, time-sensitive) | Official docs | Content/templates still referencing Assistants API need urgent updating | High |
| Model release | **GPT-5.6 family previewed (Sol/Terra/Luna)** — Sol is new coding/security/science flagship, Terra ~2x cheaper mid-tier, Luna fast/cheap; new "max" reasoning + subagent-based "ultra mode." **Access restricted to ~20 government-vetted partner orgs** (API/Codex only, not in ChatGPT), tied to a developing U.S. cyber Executive Order framework; OpenAI says it doesn't want this to become the norm | 2026-06-26 | Official blog + system card, corroborated by TechCrunch, CNBC, Axios, Forbes, HN | The most important and unusual OpenAI story this window — first frontier launch under explicit federal access controls; don't build tutorials assuming availability yet | High |
| Model release | Sora app/web fully discontinued (2026-04-26); API discontinuation scheduled 2026-09-24; refund window active through June; reported cause: ~$1M/day cost vs ~$2.1M total revenue, collapsed Disney deal | Ongoing wind-down, active this window | Official help center + extensive third-party coverage | Any content referencing Sora as "current" needs updating; API cutoff Sept 24 matters for programmatic users | Medium-High |
| Apps/Automations | Workspace Agents (ChatGPT Business/Enterprise/Edu) switched from free preview to credit-metered pricing (~5–25 credits/run for GPT-5.5) | 2026-07-06 | Official blog + rate card + third-party cost breakdowns | Budget planning starts now for anyone running workspace agents; good "what agent runs actually cost" content angle | High |

**No meaningful update found this window on:** OpenAI Cookbook, Playground, Assistants/Agents SDK (last major evolution was mid-April, outside window), GPT Store/app-directory partner changes, non-Realtime API pricing changes.

### 2.2 Anthropic

| Product | What Changed | Date | Source Type | Why It Matters | Confidence |
|---|---|---|---|---|---|
| Claude (app) | **Claude Sonnet 5** launched as new default for Free/Pro plans, near-Opus performance on coding/agentic tasks; intro pricing $2/$10 per MTok through Aug 31 ($3/$15 standard after) | 2026-06-30 | Official blog + docs | Lowers the cost floor for AI-powered content/workflow tools; changes ROI math worth communicating to audience | High |
| Claude (app) | **Claude Tag** — persistent "always-on" AI teammate in a Slack channel, shared by the whole channel, can be assigned multi-hour/multi-day autonomous tasks; runs on Opus 4.8, beta for Enterprise/Team | 2026-06-23 | Official blog + TechCrunch, VentureBeat | Direct template for "always-on agent" products; relevant to solopreneurs running Slack-based communities | High |
| Claude (app) | **Claude Science** — research workbench integrating 60+ scientific databases, multi-agent (project manager + sub-assistants + fact-checker) architecture | 2026-06-30 | Official blog + TechCrunch, MIT Tech Review | Template for "vertical multi-agent workbench" pattern AI educators can reuse for niche products | High |
| Claude (Enterprise) | Admin console gets usage/cost dashboards by group/user, model entitlement controls, spend alerts at 75%/90% of budget | 2026-07-02 | Official blog | Good "AI cost governance" content angle for teams/small businesses | High |
| Claude in Chrome | Browser-agent extension reaches General Availability for all paid plans | 2026-07-01 | Official changelog | Broadly available browser automation — content angle on AI-assisted web research/workflows | High |
| Claude Fable 5 / Mythos 5 | Launched 06-09; suspended for foreign nationals 06-12 under a U.S. export-control directive; controls lifted 06-30; **redeployed globally 07-01** across Claude.ai/Platform/Code/Cowork with new cyber safeguards; Pro/Max/Team/select Enterprise get Fable 5 for up to 50% of weekly limits through 07-07 | 06-30–07-01 | Official blog + CNBC, Al Jazeera, The Hacker News, HN | Live case study in AI governance/export-control risk — good content for setting audience expectations about platform stability | High |
| Claude Fable 5 | Detailed new cyber safeguards (classifiers declining exploit requests); joint jailbreak-severity scoring framework with Amazon/Microsoft/Google/"Glasswing" partners; HackerOne bug bounty opened | 2026-07-02 | Official blog + CryptoBriefing, TechTimes | Legitimate security-adjacent automations may occasionally get blocked by new classifiers — worth flagging to builders | High |
| Claude Code | **v2.1.198** (07-01): subagents run in background by default; Claude in Chrome GA; new built-in `/dataviz` skill w/ runnable palette validator; background agents now auto-commit/push/open draft PR on finishing worktree work; Explore agent inherits main session's model (was Haiku); `/agents` wizard removed | 2026-07-01 | Official changelog + GitHub releases | Major workflow shift — "background-first" agent execution changes how multi-agent coding workflows should be structured now | High |
| Claude Code | **v2.1.199** (07-02): stacked slash-skill invocations now support up to 5 skills at once (previously only the first loaded) | 2026-07-02 | Official changelog | Direct capability upgrade for anyone authoring custom Claude Skills — enables composing multiple skills per command | High |
| Claude Code | **v2.1.200** (07-03): default permission mode renamed "default" → "Manual" across CLI/VS Code/JetBrains; fixed project-scoped plugins failing to load from git worktrees | 2026-07-03 | Official changelog | Affects anyone scripting Claude Code in CI/automations with permission-mode assumptions | High |
| Claude Code | **v2.1.202** (07-06): new "dynamic workflow size" config setting; OpenTelemetry `workflow.run_id`/`workflow.name` attributes; `/review <pr>` reverted to fast single-pass (use `/code-review` for multi-agent version); fixed duplicated skill-instruction context bloat | 2026-07-06 | Official changelog + GitHub releases | Fine-tunes cost/speed tradeoffs for large agentic workflows; `/review` vs `/code-review` split matters for anyone automating around the old behavior | High |
| Claude API | Sonnet 5: 1M-token context, 128K max output; **3 breaking changes** — adaptive thinking on by default, manual `thinking` param removed (now 400 error), non-default temperature/top_p/top_k now 400 error; **new tokenizer producing ~30% more tokens** for the same English text (~1.3–1.4x) | 2026-06-30 | Official docs + Simon Willison verification | Silently raises real cost/context usage for existing Sonnet integrations — critical migration note | High |
| Claude API | Model retirements: Sonnet 4 & Opus 4 retired 06-15; Opus 4.1 retiring 08-05; Claude Mythos Preview retired 06-30 | Ongoing; 08-05 upcoming | Official docs | Hardcoded model strings in production automations need migration before Aug 5 | High |
| MCP | **2026-07-28 spec (Release Candidate)**: stateless protocol core (removes `initialize` handshake/session ID — enables standard load balancing), formal Extensions framework, two official extensions (MCP Apps for sandboxed server-rendered UIs; redesigned stateless Tasks), OAuth 2.1/OIDC hardening, Roots/Sampling/Logging formally deprecated (functional through ≥May 2027); beta SDKs (Python/TS/Go/C#) released 06-29 with Multi Round-Trip Requests | RC frozen 05-21; SDKs 06-29; final spec 07-28 | Official MCP blog | **Single biggest MCP development right now** — anyone running an MCP server needs a migration plan before July 28 | High |
| MCP | X (Twitter) launched a hosted official MCP server (read-only, no autonomous posting) for Claude/Cursor/Grok Build and other MCP clients | 2026-06-30 | Third-party (TechCrunch) reporting an official vendor action | Confirms MCP as the default cross-vendor integration standard — good "MCP is winning" talking point | High |
| MCP | Enterprise-Managed Authorization: zero-touch OAuth flows for enterprise MCP server auth | 2026-06-18 | Official MCP blog | Reduces setup friction for MCP servers sold into managed/enterprise environments | High |
| Claude Agent SDK | Python SDK v0.2.111 (07-06), TypeScript v0.3.202: added `parent_agent_id` (depth-2+ agent trees), `blocked` field on workflow-agent progress events, masked-credential injection for sandboxed commands | 2026-07-02–07-06 | Official GitHub changelogs | Supports more sophisticated multi-agent tooling and secure sandboxed automations | High |

**No meaningful update found this window on:** new first-party skills beyond `/dataviz`, official plugin-marketplace schema/policy changes, new Haiku-tier model.

### 2.3 Google AI

| Product | What Changed | Date | Source Type | Why It Matters | Confidence |
|---|---|---|---|---|---|
| Gemini CLI | Nightly builds (v0.51.0-nightly) shipped almost daily with security fixes: sensitive-path blocklist, defensive path resolution, fixed symlink directory-escape vuln in memory import, read-only `~/.gitconfig` in macOS sandbox | Near-daily through window | Official GitHub releases | Confirms the OSS repo is still maintained even after the hosted backend was cut for individuals — notable for anyone running it against untrusted repos | High |
| Gemini CLI | **Individual/consumer access shut off 2026-06-18** (Google AI Pro/Ultra + free tier); Cloud/Enterprise unaffected. Migration path is the closed-source **Antigravity CLI** (`agy`), which keeps Skills/Hooks/Subagents/Extensions but lacks full parity at launch | Announced 05-19; effective 06-18 | Official blog + 9to5Google, HN | **Single most important CLI story this window.** Anyone with Gemini-CLI-based content/automations for individual use must migrate now; reputational angle (6,000+ community PRs accepted, then tool closed off) worth covering | High |
| Antigravity | v2.2.1 (06-25, latest confirmed stable): built-in "Guide" skill, audio file playback in sidebar, improved substring search, C++/Python/Protobuf diff highlighting | 2026-06-25 | Third-party aggregator (releasebot, official page didn't render for direct verification) | Antigravity is now Google's primary agentic dev surface — Guide skill lowers onboarding friction for tutorial content | Medium |
| Antigravity | 2.0 suite (desktop IDE + CLI + Python SDK + Managed Agents API tier) is the standing platform framing | 2026-05-19 | Official blog + TechCrunch | Defines "which Google surface to use" for anyone routing readers away from Gemini CLI | High |
| Gemini (model) | Gemini 3.1 Pro: 77.1% on ARC-AGI-2 (2x predecessor); available across API, AI Studio, CLI, Antigravity, Android Studio, Vertex, Gemini app, NotebookLM | Announced 02-19; rollout ongoing | Official blog | Current top reasoning model to recommend for complex-reasoning workflows | High |
| Gemini app | "Neural Expressive" redesign; **Gemini Spark** (24/7 proactive agent across Gmail/Docs/Slides w/ recurring tasks); Daily Brief digest agent; Gemini Omni (text/image/video-to-video + AI avatars) | 2026-05-19 | Official blog | Spark/Daily Brief are the two features most relevant to solopreneur automation + digest use cases | High |
| Gemini API | `gemini-omni-flash-preview` (fast video gen/editing, 3–10s @720p) released; `gemini-3.1-flash-lite-image` ("Nano Banana Lite") reached **GA** | 2026-06-30 | Official changelog | GA image model = production-ready, billable now — direct fit for content-automation thumbnail/social generation | High |
| Gemini API | Computer Use tool public preview for Gemini 3.5 Flash (GUI/browser-operating agent, simplified actions + safety guardrails) | 2026-06-24 | Official changelog | Major automation building block for browser automation/testing content | High |
| Gemini API | TTS streaming (`streamGenerateContent`) added for `gemini-3.1-flash-tts-preview` | 2026-06-17 | Official changelog | Useful for real-time voice apps/podcasting tools | High |
| Gemini API | Deprecations: Imagen 4 variants shut down 08-17; various Veo models shut down 06-30 | Notice 06-15 | Official changelog | Anyone with hardcoded model IDs in production needs to migrate before these dates | High |
| Gemini API | Gemini API Docs MCP server + "Agent Skills" (best-practice patterns) — 96.3% pass rate, 63% fewer tokens per correct answer vs. vanilla prompting | 2026-03-31 (standing) | Official blog + GitHub | Concrete "MCP support in Google tools" — usable by any coding agent to stay current on Gemini API instead of stale training data | High |
| AI Studio | Gemini 3.5 Flash set as default (06-08); new "Starter Tier" deploys AI Studio's coding agent directly to Cloud Run; Managed Agents API in public preview; "Design Variations" one-click UI alt-layouts | June 2026 | Mixed (I/O official + third-party analysis, not independently re-verified this pass) | Starter Tier + Managed Agents lowers friction from "idea to deployed prototype" — good solopreneur content angle | Medium |
| AI Studio | Native Android/Kotlin "vibe coding," Google Play Console publishing integration, Workspace API integration, dedicated mobile app | 2026-05-19 | Official blog | Strong "no-code-adjacent" story for shipping a real mobile app end-to-end | High |
| NotebookLM | Reported upgrade to run on Gemini 3.5 + Antigravity harness; per-notebook secure cloud sandbox for code execution; new PDF/spreadsheet/worksheet exports | Timing uncertain, surfaced as "July 2026" | Mixed — largely third-party synthesis of I/O material, not independently confirmed for this exact window | Code-execution + spreadsheet export makes NotebookLM materially more useful for research-to-deliverable workflows — verify before citing as "new this week" | Medium |
| Google Flow | Whisk + ImageFX merged into one workspace (02-25); Gemini Omni Flash added (I/O); "Flow Agent" (multi-step creative planning) + "Flow Tools" (natural-language custom workflows) launched | Feb–June 2026 | Official blog + eWeek, Android Headlines | Flow Agent/Tools is squarely "workflow builder" territory for video/creative work | High (core), Medium (exact June naming/dates) |
| Google Labs | "Gemini for Science": Literature Insights (NotebookLM-based), Hypothesis Generation (Co-Scientist multi-agent "idea tournament"), Computational Discovery (AlphaEvolve-based) | 2026-05 rollout | Official blog | Research-audience focused, but the "multi-source synthesis → structured deliverable" pattern is reusable for research-heavy content workflows | High |
| Workspace AI | Gemini in Sheets: natural-language spreadsheet building + "Fill with Gemini" auto data entry; promo usage limits expire 2026-07-15 | 2026-04 (promo expires in-window) | Official blog | Concrete workflow-automation story; promo expiry means normal quotas kick in right after — worth flagging now | High |
| Workspace AI | Gemini in Docs: "Match writing style," "Match document format," custom instructions; same promo expiry 07-15 | 2026-05 | Official blog | Directly useful for creators maintaining brand voice across documents | High |
| Workspace AI | Ask Gemini in Drive / Drive AI Overviews extending to Android/iOS (previously web-only) | ~07-06 | Official (aggregated) | Extends AI file search/summarization to mobile for on-the-go solopreneurs | Medium |
| Model release | Nano Banana Pro (Gemini 3 Pro Image) reached GA: legible multilingual in-image text, $0.134/image, 2–5s gen, SynthID watermark | June 2026 | Official blog | Go-to model for on-brand text-in-image assets (thumbnails, posters, social graphics) at low cost | High |
| Model release | Gemma 4 12B: encoder-free multimodal, native audio input, 256K context, Apache 2.0, runs on 16GB-VRAM laptop | 2026-06-03 | Official blog | Relevant for workflow builders wanting local/offline agentic tools without API costs | High |
| Dev tools | **Genkit Agents API** (preview, TS/Go): unified `chat()` interface, server/client-managed state, built-in human-approval/tool-interrupt workflows, session snapshots/branching, multi-agent delegation, new "Agent Runner" debug UI; companion **ADK 2.0** announcement | 2026-07-01 | Official blog | Major in-window finding for automation builders — reduces boilerplate for shipping production agentic apps; directly teachable ("build a human-in-the-loop agent with Genkit") | High (Genkit), Medium (ADK 2.0 details) |
| Dev tools/MCP | 50+ Google-managed MCP servers (GKE, Cloud Run, BigQuery, Workspace APIs, Maps, etc.) GA/preview, secured via Cloud IAM Deny + Model Armor; Cloud Run's MCP server specifically at GA | Announced 04-29; standing/current | Official blog + docs | Clearest, most extensive official MCP story from Google — any MCP client can now hit Google Cloud services directly | High |
| Pricing | Google AI subscriptions restructured: new $100/mo AI Ultra tier (5x Antigravity/Gemini app limits vs Pro) targeted at developers/creators; existing top Ultra cut $250→$200 (20x limits); AI Pro bundles YouTube Premium Lite | 2026-05-19/20 | Official blog + Engadget, gHacks | Directly actionable for advising readers on which paid plan to buy | High |

**No meaningful update found this window on:** new stable (non-nightly) Gemini CLI release, new Antigravity version strictly in-window, new standalone Google Labs experiment in-window, new Imagen/Veo model version (only deprecations fell in-window).

---

## 3. Third-Party Reporting and Community Discussion

*(Separated from official updates. Anything here is unconfirmed, partially confirmed, or explicitly opinion/community sentiment unless noted.)*

| Topic | Platform/Source | What People Are Saying | Confirmed? | Why It May/May Not Matter |
|---|---|---|---|---|
| GPT-5.6 possibly served silently to ordinary Codex users pre-launch | TechTimes, citing security-researcher discovery of a hidden system-prompt fingerprint | Some non-vetted Codex users may have received GPT-5.6-class output under a "GPT-5.5 max reasoning" label, before the official partner-only preview | **Unconfirmed** by OpenAI; underlying detail came from a search snippet only (direct fetch 403'd) | If true, explains unexplained Codex quality jumps some users may have noticed this week — worth a "have you noticed this?" community-engagement post, framed clearly as unconfirmed |
| OpenAI quietly adopting a "Skills" spec in ChatGPT and Codex CLI (`SKILL.md` + folder, progressive disclosure) | Simon Willison (credible independent technical writer/Substack) | OpenAI converging on the same portable-skill pattern used elsewhere in agent tooling; discovery credited to developer Elias Judin | **Partially confirmed** — the feature is real and shipped (verifiable via `~/.codex/skills`), but OpenAI has not made an official announcement/blog post about it | Directly actionable: reusable prompt/workflow packages are now portable between ChatGPT and Codex CLI — worth being early on this before OpenAI's own announcement (if any) lands |
| Claude Code subagents can now spawn their own subagents (recursive delegation) | XDA Developers, referencing Anthropic team guidance | Framed as enabling patterns like "a reviewer subagent dispatching a separate verifier subagent per finding" | **Partially confirmed** — capability is real (from ~v2.1.172) but exact version/framing not independently verified against the official changelog | Core pattern for sophisticated multi-agent workflows — strong tutorial material, but verify version specifics before publishing as fact |
| Claude plugin ecosystem size: 192 marketplaces / 2,529 plugins (one aggregator); a separate community index claims 425 plugins / 2,810 skills / 200 agents via a `ccpi` package manager | Community aggregator sites (claudemarketplaces.com, claudepluginhub.com, tonsofskills.com) | Plugin ecosystem is "large and growing fast" | **Unconfirmed/self-reported** — not corroborated by any Anthropic official count | Directional signal only; don't cite specific numbers as fact in published content — describe qualitatively ("a fast-growing community plugin ecosystem") instead |
| Simon Willison's Fable-5 cost-optimization technique: route implementation work to cheaper Sonnet/Haiku subagents, keep judgment/review in Fable 5 | Simon Willison's blog (first-hand account, used in his own sqlite-utils 4.0 work) | A practical way to stretch usage limits while still shipping fast | **Confirmed** as a real technique used and documented by a named, credible individual; not an official Anthropic recommendation | Directly publishable as a "how to stretch your Claude Code usage limits" tutorial — high confidence, high usefulness |
| Reaction to the Gemini CLI shutdown: Google accepted 6,000+ community PRs on the open-source tool, then cut off individual access | Hacker News (high-engagement threads) | Framed by commenters as a trust/reputation problem — contributing to an OSS tool that then gets its hosted backend pulled for non-enterprise users | Underlying facts (shutdown, PR count) are **High confidence/official**; the "this damages trust" framing is **community opinion** | Good angle for a "what happens when your AI tool's backend gets cut" cautionary piece — separate the confirmed facts from the sentiment when writing |
| NotebookLM's "July 2026" feature wave (cloud sandbox code execution, new export formats, Antigravity backend) | Aggregated from listicle/blog sources (Jeff Su's site, Medium, Geeky Gadgets) | Framed as a unified new release this week | **Partially confirmed** — the feature set is consistent with earlier official I/O announcements, but no single official post confirming "all shipped this week" was independently located | Don't publish as "NotebookLM just shipped X this week" without further verification — safer to frame as "NotebookLM's expanding I/O-era feature set" |

---

## 4. Coding Agent and CLI Updates

*(Dedicated section per the brief: Codex/Codex CLI, Claude Code/CLI, Gemini CLI, Antigravity, MCP, and repo-level changes.)*

### Codex / Codex CLI (OpenAI)
- **Codex Remote → GA** (all paid plans, phone-based control via secure QR-pairing relay). *Affects:* solopreneurs/automation builders who want to supervise long-running coding sessions away from their desk. *AISolutionsOS impact:* worth a short demo/tutorial ("run Codex from your phone") — genuinely new workflow capability, not incremental.
- **Codex CLI v0.142.2–0.142.5**: MCP tool improvements, plugin browser reorg, DigitalOcean self-provisioning plugin, multi-agent delegation controls, rollout token budgets. *Affects:* developers/CLI builders maintaining MCP integrations or plugins. *AISolutionsOS impact:* if we maintain or plan to publish a Codex-compatible MCP server or plugin, re-test against 0.142.x; the DigitalOcean plugin is a good "agent provisions its own infra" case study.
- **Skills support (`SKILL.md` + folder, progressive disclosure)** in both ChatGPT and Codex CLI. *Affects:* anyone building reusable prompt/workflow packages. *AISolutionsOS impact:* directly relevant to our "Skill Pack" / "Prompt-to-Product" product lines — a Skill built for Claude Code may now be portable (with adaptation) to Codex CLI too, widening addressable audience for skill-based products.

### Claude Code / Claude Code CLI (Anthropic)
- **v2.1.198–202** (six releases in seven days): background-by-default subagents + auto-PR on worktree completion, stacked skill invocations (up to 5), permission-mode rename to "Manual," new `/dataviz` skill, dynamic workflow sizing, OTel workflow attributes, `/review` vs `/code-review` split. *Affects:* every developer/workflow builder currently using Claude Code, especially anyone with scripted/CI usage (permission-mode name change) or multi-skill workflows. *AISolutionsOS impact:* this is the most consequential single week for Claude Code in our tracked history — our own internal Claude Code usage/tutorials/templates should be re-validated against v2.1.202 behavior (especially permission-mode flags and the `/review`/`/code-review` split), and the "stack up to 5 skills" capability is a strong new teaching angle for our Skill Builder Path.
- **Claude Agent SDK** (Python 0.2.111 / TS 0.3.202): `parent_agent_id` for deep agent trees, `blocked` field for safety-classifier visibility, masked-credential injection. *Affects:* developers building custom agents on the SDK (not just Claude Code users). *AISolutionsOS impact:* relevant to any "Agent Pack" or custom-agent product built on the SDK.

### Gemini CLI / Antigravity (Google)
- **Gemini CLI individual access shut off** (06-18), forcing migration to **Antigravity CLI** (`agy`). *Affects:* every creator/developer with Gemini-CLI-based tutorials, scripts, or automations for personal/paid-consumer use. *AISolutionsOS impact:* **highest-urgency item in this whole report for our content library** — any existing AISolutionsOS content referencing Gemini CLI for individual use is now stale and needs an update/migration note pointing to Antigravity CLI.
- **Antigravity 2.2.1**: Guide skill, audio playback, improved search. *Affects:* Antigravity users/tutorial audiences. *AISolutionsOS impact:* low-urgency content refresh once we've confirmed Antigravity is the CLI we standardize our Google-AI tutorials on.
- **ADK 2.0 + Genkit Agents API**: unified chat interface, HITL workflows, session branching, Agent Runner debug UI. *Affects:* developers building production agentic apps on Google's stack. *AISolutionsOS impact:* strong candidate for a "build a human-in-the-loop agent with Genkit" tutorial — fills a gap since we currently have no Genkit-specific content.

### MCP (cross-vendor)
- **2026-07-28 spec RC**: stateless core, Extensions framework (MCP Apps, redesigned Tasks), OAuth 2.1/OIDC hardening, beta SDKs already shipping. *Affects:* every MCP server author, including anyone building or planning an "MCP Server Generator/Spec Generator" product (we have both `MCP Spec Generator` and `MCP Server Setup Guide` in our existing library — both need a review against this spec change before July 28). *AISolutionsOS impact:* **highest-priority action item** — our MCP-related products/content are directly downstream of this spec revision.
- **X's hosted MCP server**, **Google's 50+ managed MCP servers**, **Codex CLI + Claude Code MCP fixes this week**: cumulative evidence MCP is now default cross-vendor integration infrastructure. *AISolutionsOS impact:* strengthens the case for our MCP-focused content/products being a durable, not niche, investment.

---

## 5. AISolutionsOS Relevance Map

Scored 1 (low) – 5 (high). Only the highest-impact updates are scored individually; lower-priority items are covered qualitatively above.

| Update | Best Asset Type(s) | Relevance | Urgency | Monetization | Audience Usefulness |
|---|---|---|---|---|---|
| MCP 2026-07-28 spec RC (stateless core, Extensions) | MCP/server idea, Template asset, Tutorial | 5 | 5 | 4 | 5 |
| Gemini CLI shutdown → Antigravity CLI migration | Content idea, Tutorial/demo, Newsletter item | 5 | 5 | 2 | 5 |
| Claude Code v2.1.198–202 (background subagents, stacked skills) | Skill/plugin idea, Workflow idea, Tutorial | 5 | 4 | 3 | 5 |
| GPT-5.6 government-restricted rollout | Content idea, Newsletter item, Social post | 4 | 3 | 1 | 4 |
| Claude Fable 5 export-control suspension/redeploy | Content idea, Newsletter item | 4 | 3 | 1 | 4 |
| Codex Remote GA (phone control) | Tutorial/demo, Content idea | 3 | 2 | 2 | 4 |
| Skills (SKILL.md) adoption in ChatGPT/Codex CLI | Skill/plugin idea, Template asset | 4 | 3 | 4 | 4 |
| Claude Sonnet 5 tokenizer change (+~30% tokens) | Content idea, Newsletter item, Checklist | 4 | 4 | 2 | 4 |
| Genkit Agents API + ADK 2.0 | Tutorial/demo, Workflow idea, SaaT idea | 3 | 2 | 3 | 3 |
| OpenAI Workspace Agents credit pricing | Content idea, Checklist | 3 | 3 | 2 | 3 |
| Simon Willison's Fable-5 subagent cost-routing technique | Tutorial, Prompt asset, Newsletter item | 4 | 3 | 3 | 5 |
| Nano Banana Lite GA + Omni Flash (Gemini image/video) | Tutorial/demo, Content idea | 3 | 2 | 3 | 4 |
| Google Cloud 50+ managed MCP servers | MCP/server idea, Tutorial | 3 | 2 | 2 | 3 |
| AgentKit Agent Builder/Evals deprecation (Nov 30) | Checklist, Newsletter item | 2 | 3 | 1 | 3 |
| Assistants API removal (Aug 26) | Checklist, Newsletter item | 2 | 4 | 1 | 3 |

---

## 6. AISolutionsOS Signal-to-Asset Opportunities

**1. Signal: MCP's stateless-core spec revision (RC now, final July 28)**
- *Why it matters now:* Every existing MCP server needs a migration review before final publication; our own MCP Spec Generator/Setup Guide content is directly affected.
- *Best content angle:* "What MCP's 2026-07-28 spec breaks (and how to migrate before it ships)."
- *Best asset:* Updated MCP Spec Generator tool + a migration checklist template.
- *Format:* Tutorial + checklist + short thread/carousel summarizing the 3 breaking changes.
- *Hook:* "If you built an MCP server before July, part of it is about to stop working the way you think it does."
- *CTA:* Download the migration checklist / try the updated MCP Spec Generator.
- *Product tie-in:* MCP Spec Generator, MCP Starter Kit, MCP Server Setup Guide.

**2. Signal: Gemini CLI shutdown for individuals**
- *Why it matters now:* Hard deadline already passed (June 18) — anyone still using or teaching Gemini CLI for personal use is on borrowed time.
- *Best content angle:* "Gemini CLI is dead for individuals — here's your Antigravity CLI migration path."
- *Best asset:* Migration guide/checklist + updated CLI Scaffold Studio template for Antigravity.
- *Format:* Tutorial + newsletter item + short explainer video/reel.
- *Hook:* "Google took away the free CLI 6,000 contributors helped build. Here's what to use instead."
- *CTA:* Grab the Antigravity migration checklist.
- *Product tie-in:* CLI Scaffold Studio, Repo Cleanup CLI (for cleaning out dead Gemini CLI config).

**3. Signal: Claude Code's "background subagents by default" + stacked skills (up to 5)**
- *Why it matters now:* Changes the default mental model for multi-agent workflows overnight; also unlocks compositional skill design.
- *Best content angle:* "Claude Code just changed how subagents run by default — and you can now stack 5 skills at once."
- *Best asset:* Updated Workflow-to-Skill Builder / Workflow-to-Skill Converter demo showing a 3-skill stack.
- *Format:* Tutorial + prompt pack + demo video.
- *Hook:* "Your Claude Code workflows are now running differently than you designed them for — on purpose, and it's a good thing."
- *CTA:* Try the updated Workflow-to-Skill Builder.
- *Product tie-in:* Workflow-to-Skill Builder, Claude Skill Pack, Skill Builder Path.

**4. Signal: Simon Willison's Fable-5 cost-routing technique (cheap subagents for implementation, top-tier model for judgment)**
- *Why it matters now:* Directly reduces usage-limit burn on the most expensive tier — immediately actionable, no waiting on vendor changes.
- *Best content angle:* "Stretch your Claude usage limits 3x with this one subagent-routing trick."
- *Best asset:* Prompt pack / reusable subagent-routing template.
- *Format:* Prompt pack + short tutorial + checklist.
- *Hook:* "You don't need to pay Opus/Fable prices for work a cheaper model can do just as well."
- *CTA:* Download the subagent-routing prompt pack.
- *Product tie-in:* Prompt Pack Pro, Agent Pack Generator.

**5. Signal: Frontier models launching under explicit government access restrictions (GPT-5.6, Claude Fable 5)**
- *Why it matters now:* A genuinely new category of AI-industry news — model access is now a policy story, not just a pricing/tier story.
- *Best content angle:* "Two AI labs, one week, one new reality: your next frontier model might need government clearance."
- *Best asset:* Explainer piece / timeline graphic.
- *Format:* Newsletter deep-dive + carousel timeline + social thread.
- *Hook:* "OpenAI and Anthropic both just shipped their best models under government-linked restrictions. That's not normal — yet."
- *CTA:* Subscribe to the newsletter for ongoing AI-policy tracking.
- *Product tie-in:* Newsletter, Changelog page (as a governance-tracking entry).

**6. Signal: Genkit Agents API + ADK 2.0 (Google)**
- *Why it matters now:* Fills a content gap — we have no current Genkit-specific tutorial, and this reduces real boilerplate (HITL, state, streaming).
- *Best content angle:* "Build a human-in-the-loop agent in an afternoon with Google's new Genkit Agents API."
- *Best asset:* Step-by-step tutorial + starter repo template.
- *Format:* Tutorial + demo video.
- *Hook:* "Google just shipped the agent framework that skips the boilerplate everyone hates writing."
- *CTA:* Clone the Genkit HITL starter template.
- *Product tie-in:* Agent Starter Kit, MCP Starter Kit (Genkit supports MCP tool calling).

**7. Signal: Skills (SKILL.md) quietly adopted by OpenAI across ChatGPT + Codex CLI**
- *Why it matters now:* Signals convergence on a portable skill format across vendors — early movers can package once, use across multiple agent runtimes.
- *Best content angle:* "OpenAI just adopted the same Skills format Claude Code uses — here's what that means for your prompt packs."
- *Best asset:* Cross-compatibility guide + updated Claude Skill Pack noting Codex CLI portability.
- *Format:* Tutorial + comparison table + thread.
- *Hook:* "Build the skill once. It might now work in both Claude Code and Codex CLI."
- *CTA:* Check out the updated Claude Skill Pack.
- *Product tie-in:* Claude Skill Pack, Skill Builder Path, Prompt-to-Product SOP.

---

## 7. What To Build or Publish Next (Top 5 Actions)

| # | Action | Reason | Output to Create | Complexity | Best Tool | Type |
|---|---|---|---|---|---|---|
| 1 | Audit and update the **MCP Spec Generator** and **MCP Server Setup Guide** against the 2026-07-28 RC spec | Highest urgency + highest relevance signal this window; directly protects existing product value | Updated tool + migration checklist + companion blog post | Medium | MCP Spec Generator (existing) | Product update + content |
| 2 | Publish a **Gemini CLI → Antigravity CLI migration guide** | Hard deadline already passed; stale content actively misleads readers right now | Tutorial/checklist + updated CLI Scaffold Studio template | Low-Medium | CLI Scaffold Studio (existing) | Content + workflow |
| 3 | Ship a **"stack 5 skills" Claude Code tutorial + prompt pack** demonstrating the new composability | Fresh capability with strong differentiation potential; feeds Skill Builder Path directly | Tutorial + demo video + prompt pack | Low | Workflow-to-Skill Builder (existing) | Content + product |
| 4 | Package **Simon Willison's subagent cost-routing technique** as a prompt pack/checklist | High audience usefulness, zero dependency on vendor timing, immediately monetizable | Prompt pack + short tutorial | Low | Prompt Pack Pro (existing) | Product + content |
| 5 | Write the **"AI models now need government clearance" newsletter deep-dive** | Strong, differentiated editorial angle competitors are less likely to cover well; ties two companies' news into one governance narrative | Newsletter issue + timeline graphic + social carousel | Medium | Newsletter + Changelog | Content |

---

## 8. Source Table

| Company | Product/Tool | Source Name | Source Type | Official/Third-Party | Date | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| OpenAI | ChatGPT | help.openai.com ChatGPT release notes | Official release notes | Official | 2026-07-06 | High | Direct fetch blocked (403); corroborated via Releasebot aggregator |
| OpenAI | ChatGPT (finance) | openai.com/index/personal-finance-chatgpt | Official blog | Official | ~06-25–06-30 | High | Also TechCrunch, American Banker, Dataconomy |
| OpenAI | ChatGPT | openai.com/index/retiring-gpt-4o-and-older-models | Official blog | Official | 2026-06-26 | High | |
| OpenAI | ChatGPT Atlas | help.openai.com/chatgpt-atlas-release-notes | Official release notes | Official | Ongoing | Medium | Also TechRadar |
| OpenAI | API (Realtime) | developers.openai.com/api/docs/changelog | Official changelog | Official | 2026-07-06 | High | |
| OpenAI | Codex | openai.com/index/codex-now-generally-available | Official blog | Official | 2026-06-25 | High | Also TechCrunch, TechTimes |
| OpenAI | Codex CLI | developers.openai.com/codex/changelog | Official changelog | Official | 2026-06-25–07-01 | High | |
| OpenAI | Codex | Developers Digest blog | Third-party | Third-party | Late June | Medium-High | Feature-wave synthesis |
| OpenAI | Codex | TechTimes (GPT-5.6 fingerprint claim) | Third-party news | Third-party | 2026-06-29 | Low-Medium | Unconfirmed by OpenAI; source fetch 403'd |
| OpenAI | ChatGPT/Codex CLI | Simon Willison's Substack (Skills adoption) | Third-party blog | Third-party | ~2025-12-12, ongoing | Medium | Credible independent technical source |
| OpenAI | Dev tools | community.openai.com deprecation notice (Agent Builder/Evals) | Official forum notice | Official | Announced 06-03 | High | |
| OpenAI | Dev tools | developers.openai.com/api/docs/deprecations (Assistants API) | Official docs | Official | Deadline 08-26 | High | |
| OpenAI | Model release | openai.com/index/previewing-gpt-5-6-sol | Official blog + system card | Official | 2026-06-26 | High | Corroborated: TechCrunch, CNBC, Axios, Forbes, HN |
| OpenAI | Model release (Sora) | help.openai.com/sora-discontinuation | Official help center | Official | Ongoing wind-down | Medium-High | Direct fetch 403'd; corroborated by TechXplore et al. |
| OpenAI | Apps/Automations | openai.com/index/introducing-workspace-agents-in-chatgpt | Official blog + rate card | Official | 2026-07-06 | High | Also Auteur, Nerova, TechTimes |
| OpenAI | MCP | developers.openai.com/api/docs/mcp | Official docs | Official | Standing/ongoing | Medium | No new headline event in-window |
| Anthropic | Claude | anthropic.com/news/claude-sonnet-5 | Official blog | Official | 2026-06-30 | High | |
| Anthropic | Claude Tag | anthropic.com/news/introducing-claude-tag | Official blog | Official | 2026-06-23 | High | Also TechCrunch, VentureBeat, Neowin |
| Anthropic | Claude Science | anthropic.com/news/claude-science-ai-workbench | Official blog | Official | 2026-06-30 | High | Also TechCrunch, MIT Tech Review |
| Anthropic | Claude Enterprise | claude.com/blog (admin visibility/spend) | Official blog | Official | 2026-07-02 | High | Also Tech Times |
| Anthropic | Claude in Chrome | code.claude.com/docs/en/changelog | Official changelog | Official | 2026-07-01 | High | |
| Anthropic | Fable 5/Mythos 5 | anthropic.com/news/redeploying-fable-5 | Official blog | Official | 2026-06-30/07-01 | High | Also CNBC, Al Jazeera, The Hacker News, HN |
| Anthropic | Fable 5 safeguards | anthropic.com/news/fable-safeguards-jailbreak-framework | Official blog | Official | 2026-07-02 | High | Also CryptoBriefing, TechTimes |
| Anthropic | Claude Code | code.claude.com/docs/en/changelog + github.com/anthropics/claude-code/releases | Official changelog/GitHub | Official | 2026-07-01–07-06 | High | v2.1.198–202 |
| Anthropic | Claude Code (subagent recursion) | XDA Developers | Third-party | Third-party | Referencing ~v2.1.172 | Medium | Version specifics not independently verified |
| Anthropic | Claude API | platform.claude.com/docs (Sonnet 5) | Official docs | Official | 2026-06-30 | High | Tokenizer analysis cross-verified by Simon Willison |
| Anthropic | Claude API | platform.claude.com/docs (model deprecations) | Official docs | Official | Ongoing/08-05 upcoming | High | |
| Anthropic | MCP | blog.modelcontextprotocol.io (RC + beta SDKs) | Official standards-body blog | Official | RC 05-21; SDKs 06-29 | High | |
| Anthropic | MCP (X server) | techcrunch.com (X MCP server) | Third-party news on official action | Third-party/Official mix | 2026-06-30 | High | |
| Anthropic | MCP (enterprise auth) | blog.modelcontextprotocol.io | Official blog | Official | 2026-06-18 | High | |
| Anthropic | Plugins | claudemarketplaces.com, tonsofskills.com | Community aggregators | Third-party | Snapshot 06-24 | Low-Medium | Self-reported counts, unverified |
| Anthropic | Agent SDK | github.com/anthropics/claude-agent-sdk-typescript CHANGELOG | Official GitHub | Official | 2026-07-02–07-06 | High | |
| Anthropic | Fable 5 (cost technique) | simonwillison.net | Third-party blog | Third-party | 2026-07-03/07-05 | Medium-High | First-hand, named, credible source |
| Anthropic | Business/adjacent | anthropic.com/news/anthropic-amazon-compute, claude-corps | Official blog | Official | April 2026 (reaffirmed) / June 2026 | High | Background context, not a product update |
| Google | Gemini CLI | github.com/google-gemini/gemini-cli/releases | Official GitHub | Official | Near-daily through window | High | |
| Google | Gemini CLI (shutdown) | developers.googleblog.com | Official blog | Official | Announced 05-19; effective 06-18 | High | Also 9to5Google, HN |
| Google | Antigravity | releasebot.io/updates/google/antigravity | Third-party aggregator | Third-party | 2026-06-25 | Medium | Official antigravity.google/changelog didn't render for direct verification |
| Google | Antigravity | developers.googleblog.com, cloud.google.com/blog | Official blog | Official | 2026-05-19 | High | Also TechCrunch |
| Google | Gemini (model) | blog.google/.../gemini-3-1-pro | Official blog | Official | Announced 02-19 | High | |
| Google | Gemini app | blog.google/.../next-evolution-gemini-app | Official blog | Official | 2026-05-19 | High | |
| Google | Gemini API | ai.google.dev/gemini-api/docs/changelog | Official docs/changelog | Official | 2026-06-17–06-30 | High | Omni Flash, Nano Banana Lite, Computer Use, TTS, deprecations |
| Google | Gemini API (MCP) | blog.google/.../gemini-api-docsmcp-agent-skills | Official blog + GitHub | Official | 2026-03-31 | High | |
| Google | AI Studio | Aggregated (SolidAITech, Kingy AI) referencing I/O coverage | Mixed | Mixed | June 2026 | Medium | Not independently re-fetched this pass |
| Google | AI Studio | blog.google/.../google-ai-studio-io-2026 | Official blog | Official | 2026-05-19 | High | |
| Google | NotebookLM | Jeff Su's site, Medium, Geeky Gadgets (aggregated) | Third-party | Third-party | Framed as "July 2026" | Medium | Not independently confirmed via official fetch |
| Google | Google Flow | blog.google/.../flow-updates-february-2026 | Official blog | Official | Feb–June 2026 | High (core) / Medium (June details) | Also eWeek, Android Headlines |
| Google | Google Labs | blog.google/.../gemini-for-science-io-2026 | Official blog | Official | 2026-05 | High | |
| Google | Google Labs | blog.google (Dreambeans), techbuzz.ai (ProducerAI) | Official + Third-party | Mixed | Unconfirmed exact date | Medium | |
| Google | Workspace AI | workspaceupdates.googleblog.com (Sheets, Docs) | Official blog | Official | 2026-04/05 | High | Promo expiry 07-15 in-window |
| Google | Model release | blog.google/technology/ai/nano-banana-pro, deepmind.google | Official blog | Official | June 2026 | High | |
| Google | Model release | blog.google/.../introducing-gemma-4-12b | Official blog | Official | 2026-06-03 | High | |
| Google | Dev tools | developers.googleblog.com (Genkit Agents API) | Official blog | Official | 2026-07-01 | High | ADK 2.0 companion post: Medium (link unconfirmed) |
| Google | Dev tools/MCP | cloud.google.com/blog (managed MCP servers), docs.cloud.google.com/mcp | Official blog + docs | Official | Announced 04-29; standing | High | |
| Google | Pricing | blog.google/products-and-platforms/products/google-one | Official blog | Official | 2026-05-19/20 | High | Also Engadget, gHacks |

---

*Compiled by the AISolutionsOS AI Intelligence Research Agent. All findings sourced via live web research during this session; confidence levels reflect source corroboration, not certainty of future accuracy. Items marked Low or Medium confidence should be independently re-verified before being published as confirmed fact.*
