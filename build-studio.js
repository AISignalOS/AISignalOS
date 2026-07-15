/**
 * AISolutionsOS — build-studio.js
 * Local dashboard. Reads/writes browser localStorage only.
 *   aiso_saved_assets  → array of asset ids
 *   aiso_ideas         → array of idea strings
 *   aiso_submissions   → array of submission objects (read-only here)
 *   aiso_cart          → array of product ids (read-only here)
 */
(function () {
  'use strict';

  var AISO = window.AISO || {};
  var KEYS = {
    assets: 'aiso_saved_assets',
    ideas: 'aiso_ideas',
    submissions: 'aiso_submissions',
    cart: 'aiso_cart',
    workflows: 'aiso-workflows',
    checklist: 'aiso-build-checklist'
  };

  /* ─── Storage helpers ─────────────────────────────────── */
  function readArray(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeArray(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* ignore */ }
  }

  function readObject(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeObject(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── Stats ───────────────────────────────────────────── */
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(val);
  }

  function updateStats() {
    setText('stat-assets', readArray(KEYS.assets).length);
    setText('stat-ideas', readArray(KEYS.ideas).length);
    setText('stat-submissions', readArray(KEYS.submissions).length);
    setText('stat-cart', readArray(KEYS.cart).length);
  }

  /* ─── Saved Assets panel ──────────────────────────────── */
  function renderAssets() {
    var host = document.getElementById('assets-content');
    if (!host) return;

    var ids = readArray(KEYS.assets);
    var valid = ids
      .map(function (id) { return AISO.getAsset ? AISO.getAsset(id) : null; })
      .filter(Boolean);

    if (!valid.length) {
      host.innerHTML =
        '<div class="empty-state">' +
          '<h3>No saved assets yet</h3>' +
          '<p>Save prompts, skills, and templates from the library to find them here.</p>' +
          '<div class="section-cta" style="margin-top: var(--space-lg);">' +
            '<a href="library.html" class="btn-primary">Browse the Library →</a>' +
          '</div>' +
        '</div>';
      return;
    }

    var cards = valid.map(function (a) {
      var typeClass = 'badge-' + esc(a.type);
      var statusClass = a.status === 'tested' ? 'badge-tested' : 'badge-draft';
      var url = 'asset.html?id=' + encodeURIComponent(a.id);
      return '' +
        '<div class="library-card">' +
          '<span class="lib-type-badge ' + typeClass + '">' + esc(a.typeLabel) + '</span>' +
          '<a href="' + url + '" class="lib-title">' + esc(a.title) + '</a>' +
          '<p class="lib-desc">' + esc(a.desc) + '</p>' +
          '<div class="lib-footer">' +
            '<span class="lib-status ' + statusClass + '">' + esc(a.status) + '</span>' +
            '<button class="btn-sm save-btn saved" data-remove-asset="' + esc(a.id) + '">Remove</button>' +
          '</div>' +
        '</div>';
    }).join('');

    host.innerHTML = '<div class="library-grid cols-3">' + cards + '</div>';
  }

  function removeAsset(id) {
    var ids = readArray(KEYS.assets).filter(function (x) { return x !== id; });
    writeArray(KEYS.assets, ids);
    renderAssets();
    updateStats();
  }

  /* ─── Tool Ideas panel ────────────────────────────────── */
  function renderIdeas() {
    var host = document.getElementById('ideas-content');
    if (!host) return;

    var ideas = readArray(KEYS.ideas);

    if (!ideas.length) {
      host.innerHTML =
        '<div class="empty-state">' +
          '<h3>No ideas captured yet</h3>' +
          '<p>Jot down a tool you wish existed. Future you will thank you.</p>' +
        '</div>';
      return;
    }

    var items = ideas.map(function (idea, i) {
      return '' +
        '<div class="cart-item">' +
          '<div class="ci-title">' + esc(idea) + '</div>' +
          '<button class="ci-remove" data-remove-idea="' + i + '">Remove</button>' +
        '</div>';
    }).join('');

    host.innerHTML = '<div class="form-card" style="max-width: 680px;">' + items + '</div>';
  }

  function addIdea(text) {
    var clean = String(text || '').trim();
    if (!clean) return false;
    var ideas = readArray(KEYS.ideas);
    ideas.push(clean);
    writeArray(KEYS.ideas, ideas);
    renderIdeas();
    updateStats();
    return true;
  }

  function removeIdea(index) {
    var ideas = readArray(KEYS.ideas);
    if (index >= 0 && index < ideas.length) {
      ideas.splice(index, 1);
      writeArray(KEYS.ideas, ideas);
      renderIdeas();
      updateStats();
    }
  }

  /* ─── Workflows panel ─────────────────────────────────── */
  function renderWorkflows() {
    var host = document.getElementById('workflows-content');
    if (!host) return;

    var workflows = readArray(KEYS.workflows);

    if (!workflows.length) {
      host.innerHTML =
        '<div class="empty-state">' +
          '<h3>No workflows yet</h3>' +
          '<p>Capture one with the <a href="tool.html?id=workflow-to-skill" class="link">Workflow-to-Skill Builder</a>.</p>' +
        '</div>';
      return;
    }

    var items = workflows.map(function (workflow, i) {
      var dateStr = workflow.date ? new Date(workflow.date).toLocaleDateString() : '';
      return '' +
        '<div class="cart-item">' +
          '<div style="flex: 1;">' +
            '<div class="ci-title">' + esc(workflow.title) + '</div>' +
            '<div style="font-size: 0.85rem; color: var(--clr-text-secondary); margin-top: var(--space-xs);">' + esc(workflow.steps.substring(0, 80)) + (workflow.steps.length > 80 ? '...' : '') + '</div>' +
            (dateStr ? '<div style="font-size: 0.8rem; color: var(--clr-text-secondary); margin-top: var(--space-xs);">' + dateStr + '</div>' : '') +
          '</div>' +
          '<button class="ci-remove" data-remove-workflow="' + i + '">Remove</button>' +
        '</div>';
    }).join('');

    host.innerHTML = '<div class="form-card" style="max-width: 680px;">' + items + '</div>';
  }

  function addWorkflow(title, steps) {
    var cleanTitle = String(title || '').trim();
    var cleanSteps = String(steps || '').trim();
    if (!cleanTitle || !cleanSteps) return false;
    var workflows = readArray(KEYS.workflows);
    workflows.push({
      title: cleanTitle,
      steps: cleanSteps,
      date: new Date().toISOString()
    });
    writeArray(KEYS.workflows, workflows);
    renderWorkflows();
    updateStats();
    return true;
  }

  function removeWorkflow(index) {
    var workflows = readArray(KEYS.workflows);
    if (index >= 0 && index < workflows.length) {
      workflows.splice(index, 1);
      writeArray(KEYS.workflows, workflows);
      renderWorkflows();
      updateStats();
    }
  }

  /* ─── Build Checklist panel ───────────────────────────── */
  var CHECKLIST_ITEMS = [
    'Inputs validated',
    'Errors handled gracefully',
    'Output format documented',
    'Compatibility stated',
    'Tested end-to-end',
    'Setup instructions written',
    'Pricing / license decided',
    'Example output included'
  ];

  function renderChecklist() {
    var host = document.getElementById('checklist-content');
    if (!host) return;

    var state = readObject(KEYS.checklist);
    var completed = 0;
    var total = CHECKLIST_ITEMS.length;

    var items = CHECKLIST_ITEMS.map(function (label, i) {
      var id = 'check-' + i;
      var isChecked = state[id] === true;
      if (isChecked) completed++;
      return '' +
        '<div class="checklist-item' + (isChecked ? ' completed' : '') + '">' +
          '<input type="checkbox" class="checklist-checkbox" id="' + id + '" data-checklist-id="' + id + '"' + (isChecked ? ' checked' : '') + ' />' +
          '<label for="' + id + '" class="checklist-label">' + esc(label) + '</label>' +
        '</div>';
    }).join('');

    host.innerHTML = items;

    // Update progress
    var progressEl = document.getElementById('checklist-progress');
    if (progressEl) {
      progressEl.textContent = completed + ' of ' + total + ' complete';
    }
    var fillEl = document.getElementById('checklist-fill');
    if (fillEl) {
      fillEl.style.width = (completed / total * 100) + '%';
    }
  }

  function toggleChecklistItem(id) {
    var state = readObject(KEYS.checklist);
    state[id] = !state[id];
    writeObject(KEYS.checklist, state);
    renderChecklist();
  }

  /* ─── Tabs ────────────────────────────────────────────── */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.studio-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.studio-panel'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
        panels.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === name);
        });
      });
    });
  }

  /* ─── Init ────────────────────────────────────────────── */
  function init() {
    updateStats();
    renderAssets();
    renderIdeas();
    renderWorkflows();
    renderChecklist();
    initTabs();

    // Remove saved asset (delegation)
    var assetsHost = document.getElementById('assets-content');
    if (assetsHost) {
      assetsHost.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-asset]');
        if (btn) removeAsset(btn.getAttribute('data-remove-asset'));
      });
    }

    // Add idea
    var ideaForm = document.getElementById('idea-form');
    var ideaInput = document.getElementById('idea-input');
    if (ideaForm && ideaInput) {
      ideaForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (addIdea(ideaInput.value)) {
          ideaInput.value = '';
          ideaInput.focus();
        }
      });
    }

    // Remove idea (delegation)
    var ideasHost = document.getElementById('ideas-content');
    if (ideasHost) {
      ideasHost.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-idea]');
        if (btn) removeIdea(parseInt(btn.getAttribute('data-remove-idea'), 10));
      });
    }

    // Add workflow
    var workflowForm = document.getElementById('workflow-form');
    var workflowTitle = document.getElementById('workflow-title');
    var workflowSteps = document.getElementById('workflow-steps');
    if (workflowForm && workflowTitle && workflowSteps) {
      workflowForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (addWorkflow(workflowTitle.value, workflowSteps.value)) {
          workflowTitle.value = '';
          workflowSteps.value = '';
          workflowTitle.focus();
        }
      });
    }

    // Remove workflow (delegation)
    var workflowsHost = document.getElementById('workflows-content');
    if (workflowsHost) {
      workflowsHost.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-workflow]');
        if (btn) removeWorkflow(parseInt(btn.getAttribute('data-remove-workflow'), 10));
      });
    }

    // Checklist toggle (delegation)
    var checklistHost = document.getElementById('checklist-content');
    if (checklistHost) {
      checklistHost.addEventListener('change', function (e) {
        if (e.target.classList.contains('checklist-checkbox')) {
          toggleChecklistItem(e.target.getAttribute('data-checklist-id'));
        }
      });
    }

    // Keep stats fresh if another tab changes storage
    window.addEventListener('storage', function (e) {
      if (e.key && Object.keys(KEYS).map(function (k) { return KEYS[k]; }).indexOf(e.key) !== -1) {
        updateStats();
        if (e.key === KEYS.assets) renderAssets();
        if (e.key === KEYS.ideas) renderIdeas();
        if (e.key === KEYS.workflows) renderWorkflows();
        if (e.key === KEYS.checklist) renderChecklist();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
