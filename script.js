// Supabase Configuration
const SUPABASE_URL = 'https://bqzaabymdpepkrhtgbty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemFhYnltZHBlcGtyaHRnYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjgwNDUsImV4cCI6MjA2NzgwNDA0NX0.Dj-IT1aMnHsfvO3KNeCFw3RNn-k4OeNUielzaf28DAA';

// Initialize Supabase client (will be loaded from CDN)
// let supabase; // Removed duplicate declaration

// Load Supabase from CDN
function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
}

function hideSuccess(elementId) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.classList.remove('show');
    }
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = button.textContent;
        button.textContent = 'Chargement...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

// Auth Tab Switching (signup.html)
function initAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === targetTab + 'Form') {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Authentication Functions
async function handleSignup(email, password, confirmPassword) {
    if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
    }

    if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) throw error;
    return data;
}

async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) throw error;
    return data;
}

// Form Submission Functions
async function submitRegistrationForm(formData) {
    const { data, error } = await supabase
        .from('participants')
        .insert([formData]);

    if (error) throw error;
    return data;
}

// Event Listeners
function initSignupPage() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            
            hideError('loginError');
            setLoading(submitButton, true);

            try {
                await handleLogin(email, password);
                window.location.href = 'formulaire.html';
            } catch (error) {
                showError('loginError', error.message);
            } finally {
                setLoading(submitButton, false);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitButton = signupForm.querySelector('button[type="submit"]');
            
            hideError('signupError');
            setLoading(submitButton, true);

            try {
                await handleSignup(email, password, confirmPassword);
                window.location.href = 'formulaire.html';
            } catch (error) {
                showError('signupError', error.message);
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
}

function initRegistrationForm() {
    const registrationForm = document.getElementById('registrationForm');
    
    if (registrationForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('dateArrivee');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registrationForm);
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            
            hideError('formError');
            hideSuccess('formSuccess');
            setLoading(submitButton, true);

            try {
                // Validate form data
                const data = {
                    nom: formData.get('nom').trim(),
                    prenom: formData.get('prenom').trim(),
                    age: parseInt(formData.get('age')),
                    telephone: formData.get('telephone').trim(),
                    adresse: formData.get('adresse').trim(),
                    gouvernorat: formData.get('gouvernorat'),
                    role: formData.get('role'),
                    date_arrivee: formData.get('dateArrivee'),
                    created_at: new Date().toISOString()
                };

                // Basic validation
                if (!data.nom || !data.prenom || !data.telephone || !data.adresse) {
                    throw new Error('Veuillez remplir tous les champs obligatoires');
                }

                if (data.age < 16 || data.age > 100) {
                    throw new Error('L\'âge doit être entre 16 et 100 ans');
                }

                // Submit to Supabase
                await submitRegistrationForm(data);
                
                showSuccess('formSuccess', 'Inscription réussie ! Nous vous contacterons bientôt.');
                registrationForm.reset();
                
                // Reset date minimum
                if (dateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.min = today;
                }
                
            } catch (error) {
                showError('formError', error.message);
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
}

// Supabase setup
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Supabase will be initialized via loadSupabase() and assigned to the global 'supabase' variable.

// Listen for form submission
const form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    // Send data to Supabase (replace 'inscriptions' with your table name)
    const { error } = await supabase.from('inscriptions').insert([data]);
    if (error) {
      alert('Erreur lors de l\'inscription: ' + error.message);
    } else {
      alert('Inscription réussie!');
      form.reset();
    }
  });
}

// Check Authentication Status
async function checkAuthStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error checking auth status:', error);
        return null;
    }
}

// Initialize Application
async function initApp() {
    try {
        await loadSupabase();
        
        // Initialize based on current page
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (currentPage) {
            case 'signup.html':
                initAuthTabs();
                initSignupPage();
                break;
            case 'formulaire.html':
                initRegistrationForm();
                break;
            default:
                // Landing page - no special initialization needed
                break;
        }
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Show user-friendly error message
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = 'Erreur de connexion. Veuillez rafraîchir la page.';
            el.classList.add('show');
        });
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle authentication state changes
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    console.log('User signed in:', session.user);
                } else if (event === 'SIGNED_OUT') {
                    console.log('User signed out');
                }
            });
        }
    });
}