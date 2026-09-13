// Oluwayemisi Joel-Osebor Foundation - Main JavaScript
// Production-ready with donation form integration

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initNavbar();
  initAnimations();
  initDonateOptions();
  initForms();
  initSmoothScroll();
  initImageLazyLoad();
});

// ============================================
// NAVBAR MODULE
// ============================================
function initNavbar() {
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
}

// ============================================
// ANIMATION MODULE
// ============================================
function initAnimations() {
  const animateElements = document.querySelectorAll('.animate-fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1, 
    rootMargin: '0px 0px -50px 0px' 
  });

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
}

// ============================================
// DONATE OPTIONS MODULE
// ============================================
function initDonateOptions() {
  const donateOptions = document.querySelectorAll('.donate-option');
  const customAmountInput = document.getElementById('custom-amount');
  const amountInput = document.getElementById('amount');

  donateOptions.forEach(option => {
    option.addEventListener('click', () => {
      donateOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      const amount = option.dataset.amount;
      if (amount && amount !== 'custom' && amountInput) {
        amountInput.value = amount;
      }
      
      if (customAmountInput) {
        customAmountInput.value = '';
      }
    });

    // Keyboard accessibility
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        option.click();
      }
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('focus', () => {
      donateOptions.forEach(opt => opt.classList.remove('selected'));
    });

    customAmountInput.addEventListener('input', () => {
      if (amountInput) {
        amountInput.value = customAmountInput.value;
      }
    });
  }
}

// ============================================
// FORM HANDLING MODULE
// ============================================
const API_CONFIG = {
  // Replace with your actual API endpoints
  endpoints: {
    donation: '/api/donations',
    contact: '/api/contact',
    newsletter: '/api/newsletter',
    volunteer: '/api/volunteer'
  },
  // For demo/testing, you can use a service like Formspree, Netlify Forms, or your own backend
  // Example: 'https://formspree.io/f/your-form-id'
  demoMode: true, // Set to false in production
  demoEndpoint: 'https://formspree.io/f/your-form-id' // Replace with your Formspree ID
};

async function handleFormSubmit(form, endpoint) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validation
  const validationError = validateForm(form, data);
  if (validationError) {
    showToast(validationError, 'error');
    return false;
  }

  // UI loading state
  submitBtn.textContent = 'Processing...';
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');

  try {
    let response;
    
    if (API_CONFIG.demoMode) {
      // Demo mode - simulate API call
      response = await simulateApiCall(data);
    } else {
      // Production mode - actual API call
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    }

    if (response.ok || response.success) {
      showToast('Thank you! Your submission was successful.', 'success');
      form.reset();
      
      // Reset donate options if donation form
      if (form.id === 'donation-form') {
        document.querySelectorAll('.donate-option').forEach(opt => opt.classList.remove('selected'));
        const customInput = document.getElementById('custom-amount');
        if (customInput) customInput.value = '';
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Submission failed. Please try again.');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showToast(error.message || 'Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
}

function validateForm(form, data) {
  const requiredFields = form.querySelectorAll('[required]');
  
  for (const field of requiredFields) {
    const value = data[field.name];
    if (!value || value.trim() === '') {
      return `${getFieldLabel(field)} is required.`;
    }
    
    // Email validation
    if (field.type === 'email' && !isValidEmail(value)) {
      return 'Please enter a valid email address.';
    }
    
    // Phone validation (if provided)
    if (field.type === 'tel' && value && !isValidPhone(value)) {
      return 'Please enter a valid phone number.';
    }
    
    // Amount validation for donation form
    if (field.name === 'amount' && form.id === 'donation-form') {
      const amount = parseFloat(value);
      if (isNaN(amount) || amount < 1000) {
        return 'Minimum donation amount is ₦1,000.';
      }
    }
  }
  
  return null;
}

function getFieldLabel(field) {
  const label = form.querySelector(`label[for="${field.id}"]`);
  return label ? label.textContent.replace('*', '').trim() : field.name;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
}

async function simulateApiCall(data) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In demo mode, log to console
  console.log('Demo form submission:', data);
  
  // Simulate success (95% success rate for demo)
  if (Math.random() > 0.05) {
    return { ok: true, success: true };
  } else {
    return { ok: false, success: false, message: 'Simulated server error' };
  }
}

function showToast(message, type = 'info') {
  // Remove existing toasts
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto dismiss
  const dismissTimeout = setTimeout(() => {
    dismissToast(toast);
  }, 5000);

  // Manual dismiss
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(dismissTimeout);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}

function initForms() {
  const forms = document.querySelectorAll('form[novalidate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const endpoint = form.dataset.endpoint || API_CONFIG.endpoints.donation;
      handleFormSubmit(form, endpoint);
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  });
}

function validateField(field) {
  if (field.hasAttribute('required') && (!field.value || field.value.trim() === '')) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    showFieldError(field, 'Please enter a valid email');
    return false;
  }
  
  if (field.name === 'amount' && field.value) {
    const amount = parseFloat(field.value);
    if (isNaN(amount) || amount < 1000) {
      showFieldError(field, 'Minimum amount is ₦1,000');
      return false;
    }
  }
  
  clearFieldError(field);
  return true;
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  errorEl.setAttribute('role', 'alert');
  
  field.parentNode.appendChild(errorEl);
}

function clearFieldError(field) {
  field.classList.remove('error');
  field.removeAttribute('aria-invalid');
  const errorEl = field.parentNode.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

// ============================================
// SMOOTH SCROLL MODULE
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
}

// ============================================
// LAZY LOAD IMAGES MODULE
// ============================================
function initImageLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.src = img.dataset.src || img.src;
    });
    return;
  }

  // Fallback for browsers without native lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.removeAttribute('loading');
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for scroll/resize handlers
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for high-frequency events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format currency for Nigerian Naira
function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount);
}

// Parse Naira string to number
function parseNaira(str) {
  return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
}

// ============================================
// EXPORT FOR MODULE USAGE (if using modules)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initNavbar,
    initAnimations,
    initDonateOptions,
    initForms,
    handleFormSubmit,
    showToast,
    formatNaira,
    parseNaira,
    debounce,
    throttle
  };
}