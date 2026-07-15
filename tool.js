/**
 * AISolutionsOS — tool.js
 * Shared by tools.html (the gallery + filter) and tool.html (the interactive builders).
 * Every DOM lookup is guarded so the same script runs safely on both pages.
 * Vanilla JS only — no frameworks, no external deps. Matches shared.js style.
 */
(function () {
  'use strict';

  var AISO = window.AISO || {};
  var ICONS = AISO.icons || {};

  /* ============================================================
     SMALL HELPERS
     ============================================================ */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      // Fallback for very old engines.
      var m = window.location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  }

  // Wire any .copy-btn inside a root to copy text from a source element / string.
  function wireCopyButton(btn, getText) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = typeof getText === 'function' ? getText() : getText;
      function done() {
        var original = btn.getAttribute('data-label') || 'Copy';
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.textContent = original;
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* no-op */ }
    if (done) done();
  }

  /* ============================================================
     PART A — TOOLS GALLERY (tools.html)
     ============================================================ */
  function initToolsGallery() {
    var grid = document.getElementById('tools-grid');
    var tabs = document.getElementById('tool-cat-tabs');
    if (!grid) return; // not on tools.html

    var tools = AISO.tools || [];

    // Build unique categories preserving a sensible, intended order.
    var preferred = ['Productize', 'Build', 'Plan', 'Audit', 'Content'];
    var present = {};
    tools.forEach(function (t) { present[t.category] = true; });
    var cats = ['All'].concat(preferred.filter(function (c) { return present[c]; }));
    // Append any categories not in the preferred list (defensive).
    Object.keys(present).forEach(function (c) {
      if (cats.indexOf(c) === -1) cats.push(c);
    });

    // Render category pills.
    if (tabs) {
      tabs.innerHTML = cats.map(function (c, i) {
        return '<button class="filter-pill' + (i === 0 ? ' active' : '') +
          '" data-cat="' + escapeHtml(c) + '" type="button">' + escapeHtml(c) + '</button>';
      }).join('');
    }

    // Render tool cards.
    grid.innerHTML = tools.map(function (t) {
      var icon = ICONS[t.icon] || ICONS.grid || '';
      var isLive = t.status === 'live';
      var badge = isLive
        ? '<span class="badge-live"><span class="badge-dot"></span>Live</span>'
        : '<span class="badge-coming">Coming Soon</span>';
      var foot = isLive
        ? '<a class="tool-open-link" href="tool.html?id=' + encodeURIComponent(t.id) + '">Open Tool →</a>'
        : '<span style="font-size:0.875rem;color:var(--clr-subtle);font-weight:600;">Coming Soon</span>';

      var inner =
        '<div class="tool-card-inner">' +
          '<div class="tool-icon">' + icon + '</div>' +
          badge +
          '<h3 class="tool-title">' + escapeHtml(t.title) + '</h3>' +
          '<p class="tool-desc">' + escapeHtml(t.desc) + '</p>' +
          '<div class="tool-card-foot">' + foot + '</div>' +
        '</div>' +
        '<div class="tool-glow"></div>';

      // Whole live card links to the tool; soon cards are static.
      if (isLive) {
        return '<a class="tool-card is-link reveal-card" data-category="' + escapeHtml(t.category) +
          '" href="tool.html?id=' + encodeURIComponent(t.id) + '" style="text-decoration:none;color:inherit;display:block;">' +
          inner + '</a>';
      }
      return '<div class="tool-card reveal-card" data-category="' + escapeHtml(t.category) + '">' + inner + '</div>';
    }).join('');

    // Filtering behavior.
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.filter-pill') : null;
        if (!btn) return;
        var cat = btn.getAttribute('data-cat');

        Array.prototype.forEach.call(tabs.querySelectorAll('.filter-pill'), function (p) {
          p.classList.toggle('active', p === btn);
        });

        Array.prototype.forEach.call(grid.querySelectorAll('.tool-card'), function (card) {
          var match = cat === 'All' || card.getAttribute('data-category') === cat;
          card.style.display = match ? '' : 'none';
        });
      });
    }

    // Re-scan for the newly injected reveal cards.
    if (typeof AISO.observeReveals === 'function') AISO.observeReveals();
  }

  /* ============================================================
     PART B — INTERACTIVE TOOL PAGE (tool.html)
     ============================================================ */
  function initToolPage() {
    var root = document.getElementById('tool-root');
    if (!root) return; // not on tool.html

    var id = getQueryParam('id');
    var tool = id && AISO.getTool ? AISO.getTool(id) : null;

    // Header elements (best-effort; guarded).
    var titleEl = document.getElementById('tool-title');
    var leadEl = document.getElementById('tool-lead');
    var eyebrowEl = document.getElementById('tool-eyebrow');
    var crumbEl = document.getElementById('tool-breadcrumb');

    if (!id || !tool) {
      // Friendly fallback for missing/unknown id.
      if (titleEl) titleEl.textContent = 'Tool not found';
      if (eyebrowEl) eyebrowEl.textContent = 'Build Studio';
      if (leadEl) leadEl.textContent = 'We could not find that builder. It may have moved or is not live yet.';
      document.title = 'Tool not found — AISolutionsOS';
      root.innerHTML =
        '<div class="tool-panel" style="text-align:center;">' +
          '<h2 style="justify-content:center;">Nothing to build here yet</h2>' +
          '<p style="color:var(--clr-muted);margin-bottom:var(--space-lg);">Head back to the Build Studio to pick an interactive builder.</p>' +
          '<div class="hero-ctas" style="justify-content:center;">' +
            '<a href="tools.html" class="btn-primary btn-lg">Browse all tools →</a>' +
          '</div>' +
        '</div>';
      return;
    }

    // Populate header from the matched tool.
    document.title = tool.title + ' — AISolutionsOS';
    if (eyebrowEl) eyebrowEl.textContent = tool.category + ' · Interactive Builder';
    if (titleEl) titleEl.textContent = tool.title;
    if (leadEl) leadEl.textContent = tool.tagline || tool.desc;
    if (crumbEl) {
      crumbEl.innerHTML =
        '<a href="index.html">Home</a><span class="sep">/</span>' +
        '<a href="tools.html">Tools</a><span class="sep">/</span>' +
        '<span class="current">' + escapeHtml(tool.title) + '</span>';
    }

    // Route to the right interactive builder.
    switch (tool.id) {
      case 'prompt-to-product':
        renderPromptToProduct(root);
        break;
      case 'mcp-spec-generator':
        renderMcpSpecGenerator(root);
        break;
      case 'build-audit-checker':
        renderBuildAuditChecker(root);
        break;
      case 'workflow-to-skill':
        renderWorkflowToSkill(root);
        break;
      default:
        renderComingSoon(root, tool);
    }

    if (typeof AISO.observeReveals === 'function') AISO.observeReveals();
  }

  /* ─── Builder 1: Prompt-to-Product Packager ──────────────── */
  function renderPromptToProduct(root) {
    root.innerHTML =
      '<div class="tool-app">' +
        '<div class="tool-panel">' +
          '<h2>Your raw prompt</h2>' +
          '<div class="form-field">' +
            '<label for="p2p-prompt">The prompt <span class="req">*</span></label>' +
            '<textarea class="textarea" id="p2p-prompt" placeholder="Paste the prompt you already use and trust…"></textarea>' +
            '<span class="hint">What does it actually do for you today?</span>' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="p2p-buyer">Target buyer</label>' +
            '<input class="input" id="p2p-buyer" type="text" placeholder="e.g. solo founders drowning in meeting notes" />' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="p2p-price">Pricing tier</label>' +
            '<select class="select" id="p2p-price">' +
              '<option value="Free / lead magnet">Free / lead magnet ($0)</option>' +
              '<option value="Starter" selected>Starter ($19)</option>' +
              '<option value="Pro">Pro ($47)</option>' +
              '<option value="Premium">Premium ($97)</option>' +
            '</select>' +
          '</div>' +
          '<button class="btn-primary btn-full" id="p2p-generate" type="button">Generate product outline →</button>' +
        '</div>' +
        '<div class="tool-panel" style="position:relative;">' +
          '<h2>Product page outline</h2>' +
          '<button class="copy-btn" id="p2p-copy" data-label="Copy" type="button">Copy</button>' +
          '<div class="tool-output placeholder" id="p2p-output">Fill in the prompt on the left and hit Generate to see a structured, sellable product outline here.</div>' +
        '</div>' +
      '</div>';

    var promptEl = document.getElementById('p2p-prompt');
    var buyerEl = document.getElementById('p2p-buyer');
    var priceEl = document.getElementById('p2p-price');
    var out = document.getElementById('p2p-output');
    var genBtn = document.getElementById('p2p-generate');
    var copyBtn = document.getElementById('p2p-copy');

    var PRICE_MAP = {
      'Free / lead magnet': { amount: '$0', delivery: 'Instant download in exchange for an email.' },
      'Starter': { amount: '$19', delivery: 'Instant digital delivery — one prompt, one outcome.' },
      'Pro': { amount: '$47', delivery: 'Digital download + a short setup guide and example run.' },
      'Premium': { amount: '$97', delivery: 'Full kit: prompt, variations, setup guide, and a walkthrough video.' }
    };

    function firstClause(text) {
      var t = String(text || '').replace(/\s+/g, ' ').trim();
      if (!t) return '';
      var m = t.split(/[.\n]/)[0];
      return m.trim();
    }

    function titleCase(str) {
      return String(str || '').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function build() {
      var prompt = (promptEl && promptEl.value || '').trim();
      var buyer = (buyerEl && buyerEl.value || '').trim() || 'busy builders who need this done fast';
      var tier = priceEl ? priceEl.value : 'Starter';
      var price = PRICE_MAP[tier] || PRICE_MAP.Starter;

      if (!prompt) {
        out.classList.add('placeholder');
        out.textContent = 'Add your prompt first — that is the raw material the product is built from.';
        return;
      }

      var outcome = firstClause(prompt);
      var shortOutcome = outcome.length > 60 ? outcome.slice(0, 57) + '…' : outcome;
      var productName = titleCase(shortOutcome).replace(/[^A-Za-z0-9 ]/g, '').trim() || 'Your Prompt';

      var lines = [];
      lines.push('PRODUCT NAME');
      lines.push('  ' + productName + ' — done in one prompt');
      lines.push('');
      lines.push('THE OUTCOME (not the mechanism)');
      lines.push('  ' + (shortOutcome ? capitalize(shortOutcome) : 'A repeatable result your buyer wants') + '.');
      lines.push('');
      lines.push('WHO IT IS FOR');
      lines.push('  ' + capitalize(buyer) + '.');
      lines.push('');
      lines.push('THE PROMISE');
      lines.push('  Skip the trial-and-error. Paste your inputs, run the prompt,');
      lines.push('  and get ' + lowerFirst(shortOutcome || 'the result') + ' — every time.');
      lines.push('');
      lines.push('WHAT IS INCLUDED');
      lines.push('  • The full, copy-paste prompt (' + countWords(prompt) + ' words)');
      lines.push('  • A 60-second setup guide');
      lines.push('  • One worked example so you see it in action');
      if (tier === 'Pro' || tier === 'Premium') lines.push('  • Tested variations for edge cases');
      if (tier === 'Premium') lines.push('  • A short video walkthrough');
      lines.push('');
      lines.push('PRICING TIER');
      lines.push('  ' + tier + ' — ' + price.amount);
      lines.push('');
      lines.push('DELIVERY COPY');
      lines.push('  ' + price.delivery);
      lines.push('  Buy → check your inbox → paste → ship. No subscription.');

      out.classList.remove('placeholder');
      out.textContent = lines.join('\n');
    }

    function capitalize(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
    function lowerFirst(s) { s = String(s || ''); return s.charAt(0).toLowerCase() + s.slice(1); }
    function countWords(s) { var m = String(s || '').trim().match(/\S+/g); return m ? m.length : 0; }

    if (genBtn) genBtn.addEventListener('click', build);
    wireCopyButton(copyBtn, function () { return out ? out.textContent : ''; });
  }

  /* ─── Builder 2: MCP Spec Generator ──────────────────────── */
  function renderMcpSpecGenerator(root) {
    root.innerHTML =
      '<div class="tool-app">' +
        '<div class="tool-panel">' +
          '<h2>Describe your server</h2>' +
          '<div class="form-field">' +
            '<label for="mcp-name">Server name <span class="req">*</span></label>' +
            '<input class="input" id="mcp-name" type="text" placeholder="e.g. github-helper" />' +
            '<span class="hint">Lowercase, hyphenated. Used as the config key.</span>' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="mcp-desc">What should it do? <span class="req">*</span></label>' +
            '<textarea class="textarea" id="mcp-desc" placeholder="e.g. List pull requests, create issues, read file contents, search code"></textarea>' +
            '<span class="hint">List the capabilities — separate them with commas or new lines. Each becomes a tool.</span>' +
          '</div>' +
          '<div class="form-field">' +
            '<label>Capabilities to expose</label>' +
            '<div class="checklist">' +
              '<label class="checklist-item"><input type="checkbox" id="mcp-cap-tools" checked /><span class="ci-text">Tools<small>Callable functions the model can invoke.</small></span></label>' +
              '<label class="checklist-item"><input type="checkbox" id="mcp-cap-resources" /><span class="ci-text">Resources<small>Readable data the model can pull in.</small></span></label>' +
              '<label class="checklist-item"><input type="checkbox" id="mcp-cap-prompts" /><span class="ci-text">Prompts<small>Reusable prompt templates exposed by the server.</small></span></label>' +
            '</div>' +
          '</div>' +
          '<button class="btn-primary btn-full" id="mcp-generate" type="button">Generate MCP spec →</button>' +
        '</div>' +
        '<div class="tool-panel" style="position:relative;">' +
          '<h2>Generated spec</h2>' +
          '<button class="copy-btn" id="mcp-copy" data-label="Copy" type="button">Copy</button>' +
          '<div class="tool-output placeholder" id="mcp-output">Describe your server on the left, pick capabilities, and hit Generate to get a ready-to-adapt MCP spec.</div>' +
        '</div>' +
      '</div>';

    var nameEl = document.getElementById('mcp-name');
    var descEl = document.getElementById('mcp-desc');
    var capTools = document.getElementById('mcp-cap-tools');
    var capRes = document.getElementById('mcp-cap-resources');
    var capPrompts = document.getElementById('mcp-cap-prompts');
    var out = document.getElementById('mcp-output');
    var genBtn = document.getElementById('mcp-generate');
    var copyBtn = document.getElementById('mcp-copy');

    function deriveTools(desc) {
      // Split description into candidate tool names on commas, "and", newlines, semicolons.
      var parts = String(desc || '')
        .split(/[,;\n]|\band\b/i)
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });

      return parts.map(function (phrase) {
        var words = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
        var snake = words.slice(0, 4).join('_') || 'do_thing';
        return {
          name: snake,
          description: capitalizeFirst(phrase)
        };
      });
    }

    function capitalizeFirst(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

    function build() {
      var name = (nameEl && nameEl.value || '').trim() || 'my-mcp-server';
      var safeName = slugify(name) || 'my-mcp-server';
      var desc = (descEl && descEl.value || '').trim();

      if (!desc) {
        out.classList.add('placeholder');
        out.textContent = 'Describe what the server should do first — each capability becomes a tool.';
        return;
      }

      var tools = deriveTools(desc);
      var caps = [];
      if (capTools && capTools.checked) caps.push('tools');
      if (capRes && capRes.checked) caps.push('resources');
      if (capPrompts && capPrompts.checked) caps.push('prompts');
      if (caps.length === 0) caps.push('tools');

      var indent = '  ';
      var lines = [];
      lines.push('// MCP server spec — ' + safeName);
      lines.push('// Drop into your client MCP config, then implement the tools below.');
      lines.push('');
      lines.push('{');
      lines.push(indent + '"mcpServers": {');
      lines.push(indent + indent + '"' + safeName + '": {');
      lines.push(indent + indent + indent + '"command": "npx",');
      lines.push(indent + indent + indent + '"args": ["-y", "@your-scope/' + safeName + '"],');
      lines.push(indent + indent + indent + '"env": { "API_KEY": "<your-key>" }');
      lines.push(indent + indent + '}');
      lines.push(indent + '}');
      lines.push('}');
      lines.push('');
      lines.push('CAPABILITIES: ' + caps.join(', '));
      lines.push('');
      lines.push('TOOLS (' + tools.length + ')');

      tools.forEach(function (t, i) {
        lines.push('');
        lines.push((i + 1) + '. ' + t.name);
        lines.push(indent + '"description": "' + t.description.replace(/"/g, '\\"') + '"');
        lines.push(indent + '"inputSchema": {');
        lines.push(indent + indent + '"type": "object",');
        lines.push(indent + indent + '"properties": {');
        lines.push(indent + indent + indent + '"input": { "type": "string", "description": "Primary input" }');
        lines.push(indent + indent + '},');
        lines.push(indent + indent + '"required": ["input"]');
        lines.push(indent + '}');
      });

      if (capRes && capRes.checked) {
        lines.push('');
        lines.push('RESOURCES');
        lines.push(indent + safeName + '://status   →   server health and config');
      }
      if (capPrompts && capPrompts.checked) {
        lines.push('');
        lines.push('PROMPTS');
        lines.push(indent + safeName + '_default   →   a reusable prompt template');
      }

      out.classList.remove('placeholder');
      out.textContent = lines.join('\n');
    }

    if (genBtn) genBtn.addEventListener('click', build);
    wireCopyButton(copyBtn, function () { return out ? out.textContent : ''; });
  }

  /* ─── Builder 3: Build Audit Checker ─────────────────────── */
  function renderBuildAuditChecker(root) {
    var items = [
      { label: 'Inputs validated', hint: 'Bad or empty inputs are caught before anything runs.' },
      { label: 'Errors handled gracefully', hint: 'Failures show a clear message, not a stack trace.' },
      { label: 'Output format documented', hint: 'Users know exactly what they get back.' },
      { label: 'Compatibility stated', hint: 'Which tools/models/versions it works with.' },
      { label: 'Tested end-to-end', hint: 'You ran the full happy path and at least one edge case.' },
      { label: 'Pricing / use-case noted', hint: 'Who it is for and what it is worth.' },
      { label: 'Docs written', hint: 'A README or setup guide a stranger could follow.' },
      { label: 'Versioned', hint: 'It has a version number and a changelog entry.' }
    ];

    root.innerHTML =
      '<div class="tool-app">' +
        '<div class="tool-panel">' +
          '<h2>Audit checklist</h2>' +
          '<div class="checklist" id="audit-list">' +
            items.map(function (it, i) {
              return '<label class="checklist-item">' +
                '<input type="checkbox" data-audit="1" id="audit-' + i + '" />' +
                '<span class="ci-text">' + escapeHtml(it.label) +
                  '<small>' + escapeHtml(it.hint) + '</small></span>' +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="tool-panel">' +
          '<h2>Build score</h2>' +
          '<div class="score-num" id="audit-score">0%</div>' +
          '<div class="score-bar"><div class="score-fill" id="audit-fill"></div></div>' +
          '<p id="audit-verdict" style="color:var(--clr-muted);font-weight:600;">Check items as you confirm them.</p>' +
          '<p id="audit-detail" style="color:var(--clr-subtle);font-size:0.875rem;margin-top:var(--space-sm);">0 of ' + items.length + ' passed.</p>' +
        '</div>' +
      '</div>';

    var list = document.getElementById('audit-list');
    var scoreEl = document.getElementById('audit-score');
    var fillEl = document.getElementById('audit-fill');
    var verdictEl = document.getElementById('audit-verdict');
    var detailEl = document.getElementById('audit-detail');
    if (!list) return;

    var boxes = list.querySelectorAll('input[type="checkbox"][data-audit]');
    var total = boxes.length;

    function update() {
      var checked = 0;
      Array.prototype.forEach.call(boxes, function (b) { if (b.checked) checked++; });
      var pct = total ? Math.round((checked / total) * 100) : 0;

      if (scoreEl) scoreEl.textContent = pct + '%';
      if (fillEl) fillEl.style.width = pct + '%';
      if (detailEl) detailEl.textContent = checked + ' of ' + total + ' passed.';

      if (verdictEl) {
        var verdict;
        if (pct === 0) verdict = 'Check items as you confirm them.';
        else if (pct < 50) verdict = 'Needs work — major gaps remain.';
        else if (pct < 85) verdict = 'Solid — close the last gaps before shipping.';
        else if (pct < 100) verdict = 'Almost there — one or two items left.';
        else verdict = 'Ship it. Every box is checked.';
        verdictEl.textContent = verdict;
      }
    }

    Array.prototype.forEach.call(boxes, function (b) {
      b.addEventListener('change', update);
    });
    update();
  }

  /* ─── Builder 4: Workflow-to-Skill Builder ───────────────── */
  function renderWorkflowToSkill(root) {
    root.innerHTML =
      '<div class="tool-app">' +
        '<div class="tool-panel">' +
          '<h2>Describe your workflow</h2>' +
          '<div class="form-field">' +
            '<label for="w2s-name">Skill name <span class="req">*</span></label>' +
            '<input class="input" id="w2s-name" type="text" placeholder="e.g. Deploy Preview Checker" />' +
            '<span class="hint">Auto kebab-cased, e.g. deploy-preview-checker.</span>' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="w2s-desc">One-line description <span class="req">*</span></label>' +
            '<input class="input" id="w2s-desc" type="text" placeholder="e.g. Checks a deploy preview against the acceptance checklist before merge" />' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="w2s-steps">Workflow steps <span class="req">*</span></label>' +
            '<textarea class="textarea" id="w2s-steps" placeholder="One step per line, e.g.&#10;Open the preview URL&#10;Run through the checklist&#10;Report any failing items"></textarea>' +
            '<span class="hint">One step per line. At least 2 steps.</span>' +
          '</div>' +
          '<div class="form-field">' +
            '<label for="w2s-triggers">When should the agent use this? (optional)</label>' +
            '<input class="input" id="w2s-triggers" type="text" placeholder="e.g. before merging a PR, when asked to check a preview deploy" />' +
            '<span class="hint">Trigger phrases — folded into the frontmatter description.</span>' +
          '</div>' +
          '<button class="btn-primary btn-full" id="w2s-generate" type="button">Generate SKILL.md →</button>' +
          '<p id="w2s-error" style="color:#f87171;font-size:0.8125rem;margin-top:var(--space-sm);display:none;">Give the skill a name and at least 2 workflow steps first.</p>' +
        '</div>' +
        '<div class="tool-panel" style="position:relative;">' +
          '<h2>SKILL.md</h2>' +
          '<button class="copy-btn" id="w2s-copy" data-label="Copy" type="button">Copy</button>' +
          '<div class="tool-output placeholder" id="w2s-output">Describe the workflow on the left and hit Generate to get a complete SKILL.md file.</div>' +
          '<p class="hint" id="w2s-hint" style="display:none;">Save as .claude/skills/<span id="w2s-hint-name">your-skill</span>/SKILL.md</p>' +
        '</div>' +
      '</div>';

    var nameEl = document.getElementById('w2s-name');
    var descEl = document.getElementById('w2s-desc');
    var stepsEl = document.getElementById('w2s-steps');
    var triggersEl = document.getElementById('w2s-triggers');
    var out = document.getElementById('w2s-output');
    var genBtn = document.getElementById('w2s-generate');
    var copyBtn = document.getElementById('w2s-copy');
    var errEl = document.getElementById('w2s-error');
    var hintEl = document.getElementById('w2s-hint');
    var hintNameEl = document.getElementById('w2s-hint-name');

    // Auto-kebab-case the skill name as the user types.
    if (nameEl) {
      nameEl.addEventListener('blur', function () {
        nameEl.value = slugify(nameEl.value);
      });
    }

    function titleCase(str) {
      return String(str || '')
        .split('-')
        .filter(Boolean)
        .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
        .join(' ');
    }

    function build() {
      var rawName = (nameEl && nameEl.value || '').trim();
      var name = slugify(rawName);
      var desc = (descEl && descEl.value || '').trim();
      var triggers = (triggersEl && triggersEl.value || '').trim();
      var steps = (stepsEl && stepsEl.value || '')
        .split('\n')
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });

      if (errEl) errEl.style.display = 'none';

      if (!name || steps.length < 2) {
        if (errEl) errEl.style.display = 'block';
        out.classList.add('placeholder');
        out.textContent = 'Give the skill a name and at least 2 workflow steps first.';
        if (hintEl) hintEl.style.display = 'none';
        return;
      }

      var title = titleCase(name);
      var frontDesc = desc || 'Run the ' + title + ' workflow.';
      if (triggers) frontDesc += ' Use when: ' + triggers + '.';
      // YAML-safe: keep it on one line, escape any embedded double quotes.
      var yamlDesc = frontDesc.replace(/"/g, '\\"');

      var lines = [];
      lines.push('---');
      lines.push('name: ' + name);
      lines.push('description: "' + yamlDesc + '"');
      lines.push('---');
      lines.push('');
      lines.push('# ' + title);
      lines.push('');
      lines.push(desc ? desc : 'This skill walks through the ' + title + ' workflow, step by step.');
      lines.push('');
      lines.push('## Steps');
      lines.push('');
      steps.forEach(function (step, i) {
        lines.push((i + 1) + '. ' + step);
      });
      lines.push('');
      lines.push('## Output');
      lines.push('');
      lines.push('Describe exactly what this skill produces when it finishes (a file, a summary, a decision) so the agent knows when it is done.');
      lines.push('');
      lines.push('## Notes');
      lines.push('');
      lines.push('- Test this skill end-to-end before relying on it in a real workflow.');
      lines.push('- Keep the steps in sync if the underlying workflow changes.');

      out.classList.remove('placeholder');
      out.textContent = lines.join('\n');

      if (hintEl && hintNameEl) {
        hintNameEl.textContent = name;
        hintEl.style.display = 'block';
      }
    }

    if (genBtn) genBtn.addEventListener('click', build);
    if (nameEl) {
      nameEl.addEventListener('keydown', function (e) {
        if (errEl) errEl.style.display = 'none';
      });
    }
    wireCopyButton(copyBtn, function () { return out ? out.textContent : ''; });
  }

  /* ─── Coming-soon state for not-yet-live tools ───────────── */
  function renderComingSoon(root, tool) {
    root.innerHTML =
      '<div class="tool-app">' +
        '<div class="tool-panel">' +
          '<span class="badge-coming">Coming Soon</span>' +
          '<h2 style="margin-top:var(--space-md);">' + escapeHtml(tool.title) + '</h2>' +
          '<p style="color:var(--clr-muted);line-height:1.6;">' + escapeHtml(tool.desc) + '</p>' +
          '<p style="color:var(--clr-subtle);font-size:0.875rem;margin-top:var(--space-md);">This builder is in the works. Drop your email and we will tell you the moment it goes live.</p>' +
        '</div>' +
        '<div class="tool-panel">' +
          '<div id="cs-form">' +
            '<div class="form-field">' +
              '<label for="cs-email">Email address</label>' +
              '<input class="input" id="cs-email" type="email" placeholder="you@example.com" />' +
              '<span class="hint">No spam — just a one-line heads-up at launch.</span>' +
            '</div>' +
            '<button class="btn-primary btn-full" id="cs-notify" type="button">Notify me →</button>' +
            '<p id="cs-error" style="color:#f87171;font-size:0.8125rem;margin-top:var(--space-sm);display:none;">Please enter a valid email address.</p>' +
          '</div>' +
          '<div class="form-success" id="cs-success" style="display:none;">' +
            '<h3>You are on the list!</h3>' +
            '<p style="color:var(--clr-muted);">We will email you when ' + escapeHtml(tool.title) + ' is live.</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    var emailEl = document.getElementById('cs-email');
    var notifyBtn = document.getElementById('cs-notify');
    var errEl = document.getElementById('cs-error');
    var formWrap = document.getElementById('cs-form');
    var successWrap = document.getElementById('cs-success');

    function isValidEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
    }

    function submit() {
      var val = emailEl ? emailEl.value : '';
      if (!isValidEmail(val)) {
        if (errEl) errEl.style.display = 'block';
        return;
      }
      if (errEl) errEl.style.display = 'none';
      // No backend — pure UI feedback.
      if (formWrap) formWrap.style.display = 'none';
      if (successWrap) successWrap.style.display = 'block';
    }

    if (notifyBtn) notifyBtn.addEventListener('click', submit);
    if (emailEl) {
      emailEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
        if (errEl) errEl.style.display = 'none';
      });
    }
  }

  /* ============================================================
     BOOT — run whichever page applies (both are guarded)
     ============================================================ */
  function boot() {
    initToolsGallery();
    initToolPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
