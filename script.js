document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const menu = document.querySelector('.navbar-menu');
  const toggle = document.querySelector('.navbar-toggle');
  const links = document.querySelectorAll('.navbar-link');

  function updateNavbar() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function setActiveLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    links.forEach(link => {
      const href = link.getAttribute('href');
      const linkPage = href.split('/').pop();

      if (linkPage === currentPage ||
          (currentPage === 'index.html' && linkPage === 'index.html') ||
          (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function toggleMenu() {
    const isOpen = menu.classList.toggle('active');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });

  toggle?.addEventListener('click', toggleMenu);

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  updateNavbar();
  setActiveLink();

  const animateElements = document.querySelectorAll('.animate-fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });

  const donateOptions = document.querySelectorAll('.donate-option');
  const customAmountInput = document.getElementById('custom-amount');

  donateOptions.forEach(option => {
    option.addEventListener('click', () => {
      donateOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      if (customAmountInput) {
        customAmountInput.value = '';
      }
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('focus', () => {
      donateOptions.forEach(opt => opt.classList.remove('selected'));
    });
  }

  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      setTimeout(() => {
        alert('Thank you for your submission! This is a demo form.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
      }, 1500);
    });
  });
});