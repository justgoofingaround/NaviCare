/* ===== NaviCare Login Script ===== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing NaviCare Login');
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');
    const passwordToggle = document.querySelector('.password-toggle');
    const notification = document.getElementById('notification');

    // Debug logging
    console.log('Form element found:', !!loginForm);
    console.log('Email input found:', !!emailInput);
    console.log('Password input found:', !!passwordInput);
    console.log('Submit button found:', !!submitBtn);

    if (!loginForm) {
        console.error('Critical Error: Login form not found!');
        return;
    }

    // Form validation
    const validators = {
        email: (value) => {
            if (!value.trim()) return 'Username is required';
            return null;
        },
        
        password: (value) => {
            if (!value.trim()) return 'Password is required';
            if (value.length < 3) return 'Password must be at least 3 characters';
            return null;
        }
    };

    // Valid login credentials
    const validCredentials = [
        { username: 'test_user', password: 'test' },
        { username: 'demo', password: 'demo' },
        { username: 'admin', password: 'admin' }
    ];

    // Utility Functions
    function showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            inputElement.style.borderColor = '#e74c3c';
        }
    }

    function clearError(field) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.style.display = 'none';
            inputElement.style.borderColor = '#e2e8f0';
        }
    }

    function showNotification(message, type = 'info') {
        if (!notification) return;
        
        const notificationContent = notification.querySelector('.notification-content');
        const iconElement = notification.querySelector('.notification-icon');
        const messageElement = notification.querySelector('.notification-message');
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        if (iconElement) iconElement.className = `notification-icon ${icons[type] || icons.info}`;
        if (messageElement) messageElement.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    function setLoading(loading) {
        if (!submitBtn) return;
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (btnText) btnText.style.opacity = '0.7';
            if (btnLoader) btnLoader.style.display = 'block';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            if (btnText) btnText.style.opacity = '1';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Clear all errors first
        ['email', 'password'].forEach(clearError);
        
        // Validate email
        if (emailInput) {
            const emailError = validators.email(emailInput.value);
            if (emailError) {
                showError('email', emailError);
                isValid = false;
            }
        }
        
        // Validate password
        if (passwordInput) {
            const passwordError = validators.password(passwordInput.value);
            if (passwordError) {
                showError('password', passwordError);
                isValid = false;
            }
        }
        
        return isValid;
    }

    function authenticateUser(username, password) {
        return validCredentials.some(cred => 
            cred.username === username && cred.password === password
        );
    }

    async function handleLogin(e) {
        console.log('Login form submitted');
        e.preventDefault(); // Prevent default form submission
        e.stopPropagation(); // Stop event bubbling
        
        if (!validateForm()) {
            showNotification('Please fix the errors above', 'error');
            return false;
        }
        
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const username = emailInput?.value.trim() || '';
        const password = passwordInput?.value.trim() || '';
        
        console.log('Attempting login with:', { username, password: '***' });
        
        if (authenticateUser(username, password)) {
            // Store user session (compatible with dashboard storage utility)
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
            localStorage.setItem('userName', JSON.stringify(username));
            localStorage.setItem('loginTime', JSON.stringify(new Date().toISOString()));
            
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                console.log('Redirecting to dashboard...');
                window.location.href = 'views/dashboard.html';
            }, 1500);
            
        } else {
            setLoading(false);
            showNotification('Invalid username or password. Please try again.', 'error');
            
            // Focus on email field for retry
            if (emailInput) {
                emailInput.focus();
                emailInput.select();
            }
        }
        
        return false; // Ensure form doesn't submit
    }

    // Event Listeners
    if (loginForm) {
        console.log('Attaching submit event listener to form');
        loginForm.addEventListener('submit', handleLogin);
        
        // Also add click event to submit button as backup
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                if (e.target.type === 'submit') {
                    console.log('Submit button clicked');
                    e.preventDefault();
                    handleLogin(e);
                }
            });
        }
    } else {
        console.error('Login form not found!');
    }

    // Real-time validation
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const error = validators.email(emailInput.value);
            if (error) {
                showError('email', error);
            } else {
                clearError('email');
            }
        });
        
        emailInput.addEventListener('input', () => clearError('email'));
        
        emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (passwordInput) passwordInput.focus();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            const error = validators.password(passwordInput.value);
            if (error) {
                showError('password', error);
            } else {
                clearError('password');
            }
        });
        
        passwordInput.addEventListener('input', () => clearError('password'));
        
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter pressed in password field - triggering form submit');
                if (loginForm) {
                    const event = new Event('submit', { cancelable: true, bubbles: true });
                    loginForm.dispatchEvent(event);
                }
            }
        });
    }

    // Password toggle functionality
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            const icon = passwordToggle.querySelector('i');
            
            passwordInput.type = isPassword ? 'text' : 'password';
            if (icon) {
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    }

    // Social login buttons (demo functionality)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Social login is not implemented in this demo', 'info');
        });
    });

    // Hide notification when clicked
    if (notification) {
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
        });
    }

    // Initialize
    // Clear any existing session
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('loginTime');
    
    // Focus on first input
    if (emailInput) emailInput.focus();
    
    // Demo credentials notification
    setTimeout(() => {
        showNotification('Demo: Use "test_user" / "test" or "demo" / "demo" to login', 'info');
    }, 1000);
    
    console.log('NaviCare Login Script Initialization Complete');
});