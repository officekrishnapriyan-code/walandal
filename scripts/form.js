export function initForm() {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('formSubmit');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.classList.add('loading');
    btn.disabled = true;
    status.className = 'form-status';
    status.style.display = 'none';

    // TODO: Replace REPLACE_WITH_FORM_ID with your Formspree form ID
    const endpoint = 'https://formspree.io/f/REPLACE_WITH_FORM_ID';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok) {
        btn.classList.remove('loading');
        btn.innerHTML = '<span class="btn-text">✓ Message sent — we\'ll be in touch.</span>';
        btn.style.background = 'rgba(20,224,213,0.15)';
        btn.style.color = 'var(--teal)';
        btn.style.border = '1px solid var(--teal)';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.classList.remove('loading');
      btn.disabled = false;
      status.textContent = 'Something went wrong. Please try again or email us directly.';
      status.className = 'form-status error';
    }
  });
}
