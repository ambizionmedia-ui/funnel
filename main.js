/* ===========================================================
   Ambizion Media — Funnel Demo
   Shared behaviour + Getform data capture
   =========================================================== */

(function () {
  'use strict';

  /* ---- PASTE YOUR GETFORM ENDPOINT HERE ---- */
  var GETFORM_URL = 'https://getform.io/f/abc123xyz';';
  /* ----------------------------------------- */

  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function firstName(full) {
    if (!full) return '';
    return full.trim().split(/\s+/)[0];
  }

  /* Fill every [data-fill] element with the matching query param */
  function personalize() {
    document.querySelectorAll('[data-fill]').forEach(function (el) {
      var key = el.getAttribute('data-fill');
      var raw = getParam(key);
      var value = key === 'name' ? firstName(raw) : raw;
      if (value) {
        el.textContent = value;
      } else if (el.hasAttribute('data-fallback')) {
        el.textContent = el.getAttribute('data-fallback');
      }
    });
  }

  function showFieldError(field, message) {
    field.classList.add('field--error');
    var msg = field.querySelector('.field__msg');
    if (msg) msg.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove('field--error');
    var msg = field.querySelector('.field__msg');
    if (msg) msg.textContent = '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* Send lead data silently to Getform (logs to Google Sheets) */
  function captureToSheet(data) {
    if (!GETFORM_URL || GETFORM_URL.indexOf('YOUR_ENDPOINT') !== -1) return;
    var payload = new FormData();
    Object.keys(data).forEach(function (key) {
      payload.append(key, data[key]);
    });
    /* Fire and forget — don't block the page redirect */
    fetch(GETFORM_URL, {
      method: 'POST',
      body: payload,
      headers: { 'Accept': 'application/json' }
    }).catch(function () {
      /* Silently fail — never break the funnel for the user */
    });
  }

  /* Wires a form: validate → capture → redirect to next page */
  function wireStepForm(formId, nextPage, extraFieldIds) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      var nameField = form.querySelector('[data-field="name"]');
      var emailField = form.querySelector('[data-field="email"]');
      var nameInput = nameField.querySelector('input');
      var emailInput = emailField.querySelector('input');

      clearFieldError(nameField);
      clearFieldError(emailField);

      if (!nameInput.value.trim()) {
        showFieldError(nameField, 'Tell us what to call you.');
        ok = false;
      }
      if (!isValidEmail(emailInput.value.trim())) {
        showFieldError(emailField, 'Enter a valid email.');
        ok = false;
      }
      if (!ok) return;

      var params = new URLSearchParams();
      params.set('name', nameInput.value.trim());
      params.set('email', emailInput.value.trim());

      /* Build the data object to capture */
      var captureData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        page: formId,
        timestamp: new Date().toISOString()
      };

      (extraFieldIds || []).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && input.value) {
          params.set(id, input.value.trim());
          captureData[id] = input.value.trim();
        }
      });

      /* Capture to Getform/Google Sheets */
      captureToSheet(captureData);

      /* Redirect to next page */
      window.location.href = nextPage + '?' + params.toString();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    personalize();
    window.wireStepForm = wireStepForm;
  });
})();
