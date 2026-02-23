const DEFAULT_WEBHOOK_URL = 'https://n8n-service-uwaf.onrender.com/webhook/lead-form';
const REQUEST_TIMEOUT_MS = 60000;
const CONTACT_EMAIL = 'ugamochi.pavel@gmail.com';

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

  const setLoadingState = (isLoading) => {
    if (btn) btn.disabled = isLoading;
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = isLoading ? 'inline' : 'none';
  };

  const setStatus = (status, messageHtml) => {
    if (!formStatus) return;
    formStatus.className = `form-status ${status}`;
    formStatus.textContent = messageHtml;
    formStatus.style.display = 'block';
  };

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (honeypotInput?.value?.trim()) {
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

      if (typeof window.plausible === 'function') {
        window.plausible('Lead Submitted', { props: { company: formData.company || 'none' } });
      }
    } catch (error) {
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
