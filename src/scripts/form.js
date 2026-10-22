// Contact form: posts to Formspree (same endpoint as the current live site).
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdkqjezv';

export function initForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('[data-label]');

  const markInvalid = () => {
    let first = null;
    form.querySelectorAll('[required]').forEach((input) => {
      const bad = !input.checkValidity();
      input.closest('.field')?.classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', String(bad));
      if (bad && !first) first = input;
    });
    return first;
  };

  form.addEventListener('input', (event) => {
    const field = event.target.closest('.field');
    if (field?.classList.contains('is-invalid') && event.target.checkValidity()) {
      field.classList.remove('is-invalid');
      event.target.setAttribute('aria-invalid', 'false');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.elements._gotcha?.value) return;

    const firstInvalid = markInvalid();
    if (firstInvalid) {
      status.textContent = 'Please add your name, a valid email and a short message.';
      firstInvalid.focus();
      return;
    }

    button.disabled = true;
    label.textContent = 'Sending…';
    status.textContent = '';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Submission failed');
      form.reset();
      label.textContent = 'Message sent';
      status.textContent = 'Thank you. We’ll be in touch soon.';
    } catch {
      label.textContent = 'Send message';
      status.textContent = 'Something went wrong. Please try again in a moment.';
    } finally {
      button.disabled = false;
    }
  });
}
