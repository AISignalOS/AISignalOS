/**
 * AISolutionsOS — submit.js
 * Validates the workflow submission form, stores successful submissions
 * in localStorage (key: aiso_submissions, an array of objects), and
 * replaces the form with a success message.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'aiso_submissions';

  function readSubmissions() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeSubmissions(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearError(field) {
    if (!field) return;
    field.style.borderColor = '';
    field.style.boxShadow = '';
    var existing = field.parentElement
      ? field.parentElement.querySelector('.field-error')
      : null;
    if (existing) existing.remove();
  }

  function showError(field, message) {
    if (!field) return;
    field.style.borderColor = '#f87171';
    var wrap = field.parentElement;
    if (!wrap) return;
    var err = wrap.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error hint';
      err.style.color = '#f87171';
      wrap.appendChild(err);
    }
    err.textContent = message;
  }

  function init() {
    var form = document.getElementById('submit-form');
    var wrap = document.getElementById('submit-wrap');
    if (!form || !wrap) return;

    // Clear error styling as the user fixes a field.
    form.addEventListener('input', function (e) {
      if (e.target && (e.target.classList.contains('input') || e.target.classList.contains('textarea'))) {
        clearError(e.target);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = {
        task: form.querySelector('#task'),
        tools: form.querySelector('#tools'),
        output: form.querySelector('#output'),
        pain: form.querySelector('#pain'),
        process: form.querySelector('#process'),
        email: form.querySelector('#email')
      };

      var valid = true;
      var firstInvalid = null;

      function require(field, message) {
        if (!field) return;
        if (!field.value.trim()) {
          showError(field, message);
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearError(field);
        }
      }

      require(fields.task, 'Please describe your repeated task.');
      require(fields.output, 'Please describe the output you want.');

      if (fields.email) {
        var emailVal = fields.email.value.trim();
        if (!emailVal) {
          showError(fields.email, 'Please enter your email.');
          valid = false;
          if (!firstInvalid) firstInvalid = fields.email;
        } else if (!isValidEmail(emailVal)) {
          showError(fields.email, 'Please enter a valid email address.');
          valid = false;
          if (!firstInvalid) firstInvalid = fields.email;
        } else {
          clearError(fields.email);
        }
      }

      if (!valid) {
        if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return;
      }

      var submission = {
        task: fields.task ? fields.task.value.trim() : '',
        tools: fields.tools ? fields.tools.value.trim() : '',
        output: fields.output ? fields.output.value.trim() : '',
        pain: fields.pain ? fields.pain.value.trim() : '',
        process: fields.process ? fields.process.value.trim() : '',
        email: fields.email ? fields.email.value.trim() : '',
        submittedAt: new Date().toISOString()
      };

      var list = readSubmissions();
      list.push(submission);
      writeSubmissions(list);

      wrap.innerHTML =
        '<div class="form-card">' +
          '<div class="form-success">' +
            '<h3>Thanks — your workflow is in the queue.</h3>' +
            '<p>We read every submission. If yours becomes a build log, template, or tool, ' +
            'we\'ll reach out at the email you gave us. In the meantime, browse the library for ideas.</p>' +
          '</div>' +
          '<div class="section-cta" style="margin-top: var(--space-xl);">' +
            '<a href="library.html" class="btn-primary">Browse the Library →</a>' +
          '</div>' +
        '</div>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
