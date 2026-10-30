// ============ Mobile nav toggle ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ============ FAQ accordion ============
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach((openItem) => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ============ Contact pop-up ============
// Submissions are emailed to Bailey via FormSubmit (formsubmit.co).
// The first submission sends Bailey an activation email he must confirm.
const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/bailey@bradas.com.au';
const INSTAGRAM_URL = 'https://instagram.com/baileycollins.1';

const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const contactFormView = document.getElementById('contactFormView');
const contactSuccessView = document.getElementById('contactSuccessView');
const contactError = document.getElementById('contactError');
const contactSubmit = document.getElementById('contactSubmit');

function openContact() {
  contactForm.reset();
  contactForm.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  contactError.hidden = true;
  contactFormView.hidden = false;
  contactSuccessView.hidden = true;
  contactModal.showModal();
}

function showContactError(html) {
  contactError.innerHTML = html;
  contactError.hidden = false;
}

document.querySelectorAll('[data-open-contact]').forEach((btn) => {
  btn.addEventListener('click', openContact);
});

document.querySelectorAll('[data-close-contact]').forEach((btn) => {
  btn.addEventListener('click', () => contactModal.close());
});

// Close when clicking the dark area outside the pop-up
contactModal.addEventListener('click', (e) => {
  if (e.target === contactModal) contactModal.close();
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactError.hidden = true;

  const fields = contactForm.querySelectorAll('input[required]');
  let firstInvalid = null;
  fields.forEach((input) => {
    const ok = input.value.trim() !== '' && input.checkValidity();
    input.classList.toggle('invalid', !ok);
    if (!ok && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    showContactError('Please fill in all fields, including a valid phone number and email.');
    firstInvalid.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(contactForm).entries());
  if (data._honey) return; // bot

  const fullName = data['Full name'].trim().replace(/\s+/g, ' ');
  const gymName = data['Gym name'].trim();
  const payload = {
    'Full name': fullName,
    'Gym name': gymName,
    Phone: data.Phone.trim(),
    Email: data.Email.trim(),
    _replyto: data.Email.trim(),
    _subject: `New gym enquiry: ${fullName} from ${gymName} (BC Performance website)`,
    _template: 'table',
    _captcha: 'false',
  };

  contactSubmit.disabled = true;
  contactSubmit.textContent = 'Sending…';

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || String(result.success) !== 'true') throw new Error(result.message || 'Send failed');

    document.getElementById('contactSuccessName').textContent = fullName.split(' ')[0];
    contactFormView.hidden = true;
    contactSuccessView.hidden = false;
  } catch (err) {
    showContactError(
      `Sorry, something went wrong sending your details. Please try again, or message me on <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener">Instagram</a>.`
    );
  } finally {
    contactSubmit.disabled = false;
    contactSubmit.textContent = 'Send My Details';
  }
});

// ============ Revenue Calculator ============
const fmt = (n) => '$' + Math.round(n).toLocaleString('en-AU');

const inputs = {
  members: document.getElementById('members'),
  addonPrice: document.getElementById('addonPrice'),
};

const labels = {
  members: document.getElementById('membersVal'),
  addonPrice: document.getElementById('addonPriceVal'),
};

const results = {
  weeklyExtra: document.getElementById('resWeeklyExtra'),
  annualExtra: document.getElementById('resAnnualExtra'),
};

function calculate() {
  const members = Number(inputs.members.value);
  const addonPrice = Number(inputs.addonPrice.value);

  if (labels.members) labels.members.textContent = members;
  if (labels.addonPrice) labels.addonPrice.textContent = addonPrice;

  const weeklyExtra = members * addonPrice;
  const annualExtra = weeklyExtra * 52;

  results.weeklyExtra.textContent = fmt(weeklyExtra);
  results.annualExtra.textContent = fmt(annualExtra);
}

Object.values(inputs).forEach((input) => {
  if (input) input.addEventListener('input', calculate);
});

calculate();
