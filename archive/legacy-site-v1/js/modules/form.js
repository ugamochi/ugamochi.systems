const DEFAULT_WEBHOOK_URL = 'https://n8n-service-uwaf.onrender.com/webhook/lead-form';
const REQUEST_TIMEOUT_MS = 60000;
const CONTACT_EMAIL = 'ugamochi.pavel@gmail.com';
const FORM_DEBUG_STORAGE_KEY = 'ugamochi:form-debug';
const FORM_DEBUG_GLOBAL_KEY = '__UGA_FORM_DEBUG__';
const MAX_DEBUG_EVENTS = 200;

export function initForm() {
  const leadForm = document.getElementById('leadForm');
  if (!leadForm || leadForm.dataset.formInit === 'true') return;
  leadForm.dataset.formInit = 'true';

  const btn = leadForm.querySelector('.form-submit');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoading = btn?.querySelector('.btn-loading');
  const formStatus = leadForm.querySelector('.form-status');
  const emailInput = leadForm.querySelector('input[name="email"]');
  const honeypotInput = leadForm.querySelector('input[name="website"]');
  const formDebugger = createFormDebugger(leadForm);

  const setLoadingState = (isLoading) => {
    if (btn) btn.disabled = isLoading;
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = isLoading ? 'inline' : 'none';
  };

  installGlobalFormDebugApi({
    debugger: formDebugger,
    form: leadForm,
    getWebhookUrl: getConfiguredWebhookUrl,
    setLoadingState
  });

  const setStatus = (status, messageHtml) => {
    if (!formStatus) return;
    formStatus.className = `form-status ${status}`;
    formStatus.textContent = messageHtml;
    formStatus.style.display = 'block';
  };

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (honeypotInput?.value?.trim()) {
      formDebugger.log('warn', 'Honeypot field was filled. Submission blocked.');
      return;
    }

    if (formStatus) formStatus.style.display = 'none';
    setLoadingState(true);

    const rawFields = Object.fromEntries(new FormData(leadForm).entries());
    delete rawFields.website;

    const formData = {
      ...rawFields,
      name: (rawFields.name || '').trim(),
      email: (rawFields.email || '').trim(),
      company: (rawFields.company || '').trim(),
      intent: rawFields.intent || 'send_project_details',
      message: (rawFields.message || '').trim(),
      timestamp: new Date().toISOString(),
      source: window.location.pathname || 'ugamochi.systems',
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;
    const webhookUrl = getConfiguredWebhookUrl();
    const debugSubmission = formDebugger.startSubmission({
      formData,
      webhookUrl
    });

    try {
      if (!webhookUrl || webhookUrl.startsWith('YOUR_')) {
        throw new Error('n8n webhook not configured yet');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: controller?.signal,
        mode: 'cors'
      });

      const responsePreview = await response.clone().text().catch(() => '');
      formDebugger.captureResponse({
        submission: debugSubmission,
        response,
        bodyPreview: responsePreview
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Lead webhook temporarily unavailable');
        }
        throw new Error(`Lead webhook rejected the request (${response.status})`);
      }

      setStatus('success', 'Thanks! I will review your request and reach out within 24 hours.');

      const hiddenValues = new Map(
        Array.from(leadForm.querySelectorAll('input[type="hidden"][name]')).map((input) => [input.name, input.value])
      );
      leadForm.reset();
      hiddenValues.forEach((value, name) => {
        const hiddenInput = leadForm.querySelector(`input[type="hidden"][name="${name}"]`);
        if (hiddenInput) hiddenInput.value = value;
      });
      formDebugger.markSuccess(debugSubmission);

      if (typeof window.plausible === 'function') {
        window.plausible('Lead Submitted', { props: { company: formData.company || 'none' } });
      }
    } catch (error) {
      formDebugger.captureError(debugSubmission, error);
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus('error', `Request timed out. Please try again or email ${CONTACT_EMAIL}.`);
      } else if (error instanceof Error && error.message.includes('webhook not configured')) {
        setStatus('error', `Form backend is not configured yet. Please contact ${CONTACT_EMAIL}.`);
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setStatus('error', `Network error or CORS issue. Please email ${CONTACT_EMAIL}.`);
      } else if (error instanceof Error && error.message.includes('temporarily unavailable')) {
        setStatus('error', `The form service is temporarily unavailable. Please try again later or email ${CONTACT_EMAIL}.`);
      } else {
        setStatus('error', `Submission failed. Please try again or email ${CONTACT_EMAIL}.`);
      }
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      setLoadingState(false);
      formDebugger.finishSubmission(debugSubmission);
    }
  });

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value && !emailRegex.test(this.value)) {
        this.setCustomValidity('Please enter a valid email address');
        this.reportValidity();
      } else {
        this.setCustomValidity('');
      }
    });
  }
}

function createFormDebugger(form) {
  const events = [];
  const state = {
    lastSubmission: null,
    submissionCounter: 0
  };

  const addEvent = (level, message, data = {}) => {
    const event = {
      time: new Date().toISOString(),
      level,
      message,
      data
    };
    events.push(event);
    if (events.length > MAX_DEBUG_EVENTS) {
      events.shift();
    }
    if (!isFormDebugEnabled()) return;
    const method = level === 'error'
      ? 'error'
      : level === 'warn'
        ? 'warn'
        : 'log';
    console[method](`[form-debug] ${message}`, data);
  };

  const startSubmission = ({ formData, webhookUrl }) => {
    const submission = {
      id: ++state.submissionCounter,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'pending',
      webhookUrl,
      formData: sanitizeDebugPayload(formData),
      response: null,
      error: null
    };
    state.lastSubmission = submission;
    addEvent('log', `Submission #${submission.id} started`, {
      webhookUrl,
      formData: submission.formData
    });
    return submission;
  };

  const captureResponse = ({ submission, response, bodyPreview }) => {
    if (!submission) return;
    submission.response = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyPreview: truncateForDebug(bodyPreview, 1200)
    };
    addEvent('log', `Submission #${submission.id} response`, submission.response);
  };

  const markSuccess = (submission) => {
    if (!submission) return;
    submission.status = 'success';
    addEvent('log', `Submission #${submission.id} marked as success`);
  };

  const captureError = (submission, error) => {
    const errorDetails = serializeError(error);
    if (submission) {
      submission.status = 'error';
      submission.error = errorDetails;
    }
    addEvent('error', `Submission${submission ? ` #${submission.id}` : ''} failed`, errorDetails);
  };

  const finishSubmission = (submission) => {
    if (!submission) return;
    submission.completedAt = new Date().toISOString();
    if (submission.status === 'pending') {
      submission.status = submission.error ? 'error' : 'completed';
    }
    addEvent('log', `Submission #${submission.id} finished`, {
      status: submission.status,
      completedAt: submission.completedAt
    });
  };

  return {
    log: addEvent,
    startSubmission,
    captureResponse,
    markSuccess,
    captureError,
    finishSubmission,
    getEvents: () => events.map((event) => ({ ...event })),
    getLastSubmission: () => cloneData(state.lastSubmission),
    clearEvents: () => {
      events.length = 0;
      addEvent('log', 'Debug events cleared');
    },
    getForm: () => form
  };
}

function installGlobalFormDebugApi({ debugger: formDebugger, form, getWebhookUrl, setLoadingState }) {
  const globalScope = window;
  if (globalScope.ugamochiFormDebug) return;

  globalScope.ugamochiFormDebug = {
    enable() {
      try {
        localStorage.setItem(FORM_DEBUG_STORAGE_KEY, '1');
      } catch (error) {
        console.warn('[form-debug] Could not persist debug flag in localStorage', error);
      }
      globalScope[FORM_DEBUG_GLOBAL_KEY] = true;
      console.info('[form-debug] Enabled. Refresh is optional.');
      return this.status();
    },
    disable() {
      try {
        localStorage.removeItem(FORM_DEBUG_STORAGE_KEY);
      } catch (error) {
        console.warn('[form-debug] Could not clear debug flag from localStorage', error);
      }
      globalScope[FORM_DEBUG_GLOBAL_KEY] = false;
      console.info('[form-debug] Disabled.');
      return this.status();
    },
    status() {
      return {
        enabled: isFormDebugEnabled(),
        webhookUrl: getWebhookUrl(),
        formId: form.id || null,
        lastSubmission: formDebugger.getLastSubmission(),
        recentEvents: formDebugger.getEvents().slice(-10)
      };
    },
    getLastSubmission() {
      return formDebugger.getLastSubmission();
    },
    getEvents() {
      return formDebugger.getEvents();
    },
    clearEvents() {
      formDebugger.clearEvents();
      return this.getEvents();
    },
    async submitTest(overrides = {}) {
      const payload = {
        name: 'Debug Test',
        email: 'debug-test@example.com',
        company: 'Debug',
        intent: 'book_discovery_call',
        message: 'Manual debug test submission',
        service_requested: 'Debug service',
        timestamp: new Date().toISOString(),
        source: window.location.pathname || 'ugamochi.systems',
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        ...overrides
      };
      const webhookUrl = getWebhookUrl();
      const submission = formDebugger.startSubmission({ formData: payload, webhookUrl });
      setLoadingState(true);
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          mode: 'cors'
        });
        const bodyPreview = await response.clone().text().catch(() => '');
        formDebugger.captureResponse({ submission, response, bodyPreview });
        if (!response.ok) {
          throw new Error(`Lead webhook rejected the request (${response.status})`);
        }
        formDebugger.markSuccess(submission);
        return submission;
      } catch (error) {
        formDebugger.captureError(submission, error);
        throw error;
      } finally {
        setLoadingState(false);
        formDebugger.finishSubmission(submission);
      }
    }
  };

  if (isFormDebugEnabled()) {
    console.info('[form-debug] Debug API ready: window.ugamochiFormDebug');
  }
}

function getConfiguredWebhookUrl() {
  const metaUrl = document
    .querySelector('meta[name="lead-webhook-url"]')
    ?.getAttribute('content')
    ?.trim();

  const windowConfig = window.__UGA_CONFIG__;
  const globalUrl = windowConfig && typeof windowConfig === 'object'
    ? String(windowConfig.leadWebhookUrl || '').trim()
    : '';

  return metaUrl || globalUrl || DEFAULT_WEBHOOK_URL;
}

function isFormDebugEnabled() {
  const queryFlag = new URLSearchParams(window.location.search).get('debugForm');
  const globalFlag = window[FORM_DEBUG_GLOBAL_KEY];
  let localStorageFlag = null;
  try {
    localStorageFlag = localStorage.getItem(FORM_DEBUG_STORAGE_KEY);
  } catch (error) {
    localStorageFlag = null;
  }
  return (
    isTruthyDebugValue(queryFlag) ||
    isTruthyDebugValue(globalFlag) ||
    isTruthyDebugValue(localStorageFlag)
  );
}

function isTruthyDebugValue(value) {
  if (typeof value === 'boolean') return value;
  if (value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function sanitizeDebugPayload(payload) {
  const clone = { ...payload };
  if (typeof clone.userAgent === 'string') {
    clone.userAgent = truncateForDebug(clone.userAgent, 180);
  }
  if (typeof clone.message === 'string') {
    clone.message = truncateForDebug(clone.message, 500);
  }
  return clone;
}

function truncateForDebug(value, maxLength) {
  if (typeof value !== 'string') return value;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: truncateForDebug(error.stack || '', 1200)
    };
  }
  return { message: String(error) };
}

function cloneData(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}
