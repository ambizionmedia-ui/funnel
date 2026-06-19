/* ===========================================================
   Ambizion Media — Funnel Demo: "The Outbound Engine"
   Shared behavior. No build step, no dependencies, no storage —
   state travels page-to-page as URL query params only.
   =========================================================== */

(function () {
  'use strict';

  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function firstName(full) {
    if (!full) return '';
    return full.trim().split(/\s+/)[0];
  }

  // Fill every [data-fill] element with the matching query param,
  // falling back to its own data-fallback text if none is present.
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

  // Wires a form to validate name + email, then forward both
  // (plus any extra fields) as query params to the next page.
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

      (extraFieldIds || []).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && input.value) params.set(id, input.value.trim());
      });

      window.location.href = nextPage + '?' + params.toString();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    personalize();
    window.wireStepForm = wireStepForm; // exposed for per-page wiring
  });
})();
