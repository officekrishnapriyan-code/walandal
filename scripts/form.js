// TODO: replace with your real Formspree form ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_FORM_ID';

export function initForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  const btn = document.getElementById('contact-submit');
  if (!form || !btn) return;

  const setLabel = (text) => {
    const lab = btn.querySelector('.btn__label');
    if (lab) lab.textContent = text;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form._gotcha && form._gotcha.value) return; // honeypot
    if (status) { status.textContent = ''; status.className = 'contact__status mono'; }

    btn.classList.remove('is-success');
    btn.classList.add('is-loading');
    btn.disabled = true;

    const data = new FormData(form);

    try {
      if (FORMSPREE_ENDPOINT.includes('REPLACE_WITH_FORM_ID')) {
        // Demo behaviour until the user sets their real Formspree endpoint.
        await new Promise((r) => setTimeout(r, 900));
        throw new Error('Formspree endpoint not configured. Edit FORMSPREE_ENDPOINT in scripts/form.js to enable submissions.');
      }

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Submission failed. Please try again.');

      btn.classList.remove('is-loading');
      btn.classList.add('is-success');
      setLabel("Message sent — we'll be in touch.");
      if (status) {
        status.textContent = 'Thanks — your note has been received.';
        status.classList.add('is-success');
      }
      form.reset();
    } catch (err) {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      if (status) {
        status.textContent = err.message || 'Something went wrong. Please try again.';
        status.classList.add('is-error');
      }
    }
  });
}
