// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clear                // Redirect to full dashboard
                setTimeout(() => {
                    console.log('Redirecting to full dashboard...');
                    window.location.replace('./dashboard.html');
                }, 1500);ut(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== FORM VALIDATION =====
class FormValidator {
    constructor() {
        this.rules = {
            email: {
                required: true,
                message: 'Username is required'
            },
            password: {
                required: true,
                message: 'Password is required'
            }
        };
    }

    validateField(field, value) {
        const rule = this.rules[field];
        if (!rule) return { isValid: true };

        // Check if field is required
        if (rule.required && (!value || value.trim() === '')) {
            return {
                isValid: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
            };
        }

        // Skip other validations if field is empty and not required
        if (!value && !rule.required) {
            return { isValid: true };
        }

        return { isValid: true };
    }

    validateForm(formData) {
        const errors = {};
        let isFormValid = true;

        Object.keys(this.rules).forEach(field => {
            const validation = this.validateField(field, formData[field]);
            if (!validation.isValid) {
                errors[field] = validation.message;
                isFormValid = false;
            }
        });

        return { isFormValid, errors };
    }
}

// ===== NOTIFICATION SYSTEM =====
class NotificationManager {
    constructor() {
        this.notification = $('#notification');
        this.icon = $('.notification-icon');
        this.message = $('.notification-message');
    }

    show(message, type = 'success', duration = 4000) {
        this.message.textContent = message;
        this.notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => {
            this.notification.classList.add('show');
        }, 100);

        // Auto hide
        setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.notification.classList.remove('show');
    }
}

// ===== LOADING MANAGER =====
class LoadingManager {
    constructor(button) {
        this.button = button;
        this.originalText = button.querySelector('.btn-text').textContent;
    }

    start() {
        this.button.disabled = true;
        this.button.classList.add('loading');
    }

    stop() {
        this.button.disabled = false;
        this.button.classList.remove('loading');
    }
}

// ===== MAIN APPLICATION CLASS =====
class LoginApp {
    constructor() {
        this.validator = new FormValidator();
        this.notification = new NotificationManager();
        this.form = $('#loginForm');
        this.submitButton = $('#submitBtn');
        this.loadingManager = new LoadingManager(this.submitButton);
        
        this.fields = {
            email: $('#email'),
            password: $('#password')
        };

        this.errorElements = {
            email: $('#email-error'),
            password: $('#password-error')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupFloatingLabels();
        this.setupAccessibility();
        this.preloadAssets();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            
            // Debounced validation on input
            field.addEventListener('input', debounce((e) => {
                this.validateSingleField(fieldName, e.target.value);
            }, 300));

            // Immediate validation on blur
            field.addEventListener('blur', (e) => {
                this.validateSingleField(fieldName, e.target.value);
            });

            // Clear errors on focus
            field.addEventListener('focus', () => {
                this.clearFieldError(fieldName);
            });
        });

        // Social login buttons
        $$('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password link
        $('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Sign up link
        $('.signup-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSignUpRedirect();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    setupPasswordToggle() {
        const passwordToggle = $('.password-toggle');
        const passwordInput = $('#password');

        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            const icon = passwordToggle.querySelector('i');
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            
            // Update aria-label for accessibility
            passwordToggle.setAttribute('aria-label', 
                isPassword ? 'Hide password' : 'Show password'
            );

            // Brief focus indication
            passwordToggle.style.color = 'var(--primary-color)';
            setTimeout(() => {
                passwordToggle.style.color = '';
            }, 200);
        });
    }

    setupFloatingLabels() {
        Object.values(this.fields).forEach(field => {
            // Handle autofill detection
            const checkAutofill = () => {
                if (field.value) {
                    field.classList.add('has-value');
                } else {
                    field.classList.remove('has-value');
                }
            };

            // Check on load and periodically for autofill
            checkAutofill();
            setInterval(checkAutofill, 500);

            // Handle manual input
            field.addEventListener('input', checkAutofill);
            field.addEventListener('blur', checkAutofill);
        });
    }

    setupAccessibility() {
        // Add ARIA live region for dynamic error messages
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        // Improve focus management
        this.form.addEventListener('focusin', (e) => {
            if (e.target.matches('.form-input')) {
                e.target.parentElement.classList.add('focused');
            }
        });

        this.form.addEventListener('focusout', (e) => {
            if (e.target.matches('.form-input')) {
                e.target.parentElement.classList.remove('focused');
            }
        });
    }

    preloadAssets() {
        // Preload any critical assets or prepare for smooth animations
        const shapes = $$('.shape');
        shapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 7}s`;
        });
    }

    validateSingleField(fieldName, value) {
        const validation = this.validator.validateField(fieldName, value);
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];

        if (!validation.isValid) {
            this.showFieldError(fieldName, validation.message);
        } else {
            this.clearFieldError(fieldName);
        }

        return validation.isValid;
    }

    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];

        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');

        // Announce error to screen readers
        const liveRegion = $('#live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }

        // Add subtle shake animation
        field.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 300);
    }

    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];

        field.classList.remove('error');
        errorElement.classList.remove('show');
        
        setTimeout(() => {
            errorElement.textContent = '';
        }, 150);
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            email: this.fields.email.value.trim(),
            password: this.fields.password.value,
            remember: $('#remember').checked
        };

        // Validate form
        const { isFormValid, errors } = this.validator.validateForm(formData);

        // Clear previous errors
        Object.keys(this.fields).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });

        // Show field errors
        if (!isFormValid) {
            Object.keys(errors).forEach(fieldName => {
                this.showFieldError(fieldName, errors[fieldName]);
            });
            
            // Focus first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField && this.fields[firstErrorField]) {
                this.fields[firstErrorField].focus();
            }
            
            return;
        }

        // Start loading state
        this.loadingManager.start();

        try {
            // Simulate API call
            const success = await this.simulateLogin(formData);
            
            if (success) {
                // Store user name for dashboard
                localStorage.setItem('userName', formData.email || 'User');
                
                console.log('Login successful, storing username:', formData.email);
                
                this.notification.show('Login successful! Redirecting...', 'success');
                
                // Redirect to full dashboard
                setTimeout(() => {
                    console.log('Redirecting to full dashboard...');
                    window.location.replace('./dashboard.html');
                }, 1000);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.notification.show(
                error.message || 'Login failed. Please try again.', 
                'error'
            );
        } finally {
            this.loadingManager.stop();
        }
    }

    async simulateLogin(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple username/password check
        if (formData.email === 'test_user' && formData.password === 'test') {
            return true;
        } else {
            throw new Error('Invalid credentials. Use username: test_user and password: test');
        }
    }

    handleSocialLogin(e) {
        e.preventDefault();
        const provider = e.currentTarget.classList.contains('google-btn') ? 'Google' : 'Microsoft';
        
        // Add loading state to the clicked button
        const button = e.currentTarget;
        const originalContent = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Connecting...</span>`;
        button.disabled = true;

        // Simulate social login
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            this.notification.show(
                `${provider} login is currently unavailable.`, 
                'error', 
                3000
            );
        }, 1000);
    }

    handleForgotPassword() {
        // In a real app, this would open a forgot password modal or redirect
        this.notification.show(
            'Forgot password feature would open here.', 
            'success', 
            3000
        );
    }

    handleSignUpRedirect() {
        // In a real app, this would redirect to the sign-up page
        this.notification.show(
            'Sign up page would open here.', 
            'success', 
            3000
        );
    }

    handleKeyboardNavigation(e) {
        // Enhanced keyboard navigation
        if (e.key === 'Enter' && e.target.classList.contains('form-input')) {
            // Move to next input or submit if on last input
            const inputs = Array.from($$('.form-input'));
            const currentIndex = inputs.indexOf(e.target);
            
            if (currentIndex < inputs.length - 1) {
                e.preventDefault();
                inputs[currentIndex + 1].focus();
            }
        }

        // ESC to close notifications
        if (e.key === 'Escape') {
            this.notification.hide();
        }
    }
}

// ===== ADDITIONAL ANIMATIONS =====
const addShakeAnimation = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
};

// ===== PERFORMANCE OPTIMIZATIONS =====
const optimizePerformance = () => {
    // Preload critical resources
    const criticalImages = [
        // Add any critical images here
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    // Enable passive event listeners for better scroll performance
    const passiveSupported = (() => {
        let passive = false;
        try {
            const options = Object.defineProperty({}, 'passive', {
                get() { passive = true; }
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {}
        return passive;
    })();

    if (passiveSupported) {
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
    }
};

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Add shake animation
    addShakeAnimation();
    
    // Optimize performance
    optimizePerformance();
    
    // Initialize the login application
    const app = new LoginApp();
    
    // Add smooth reveal animation for the container
    const loginContainer = $('.login-container');
    if (loginContainer) {
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            loginContainer.style.transition = 'all 0.8s ease-out';
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateY(0)';
        }, 100);
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FormValidator,
        NotificationManager,
        LoadingManager,
        LoginApp
    };
}