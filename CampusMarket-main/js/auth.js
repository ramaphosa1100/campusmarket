// ======================================
// CAMPUSMARKET - AUTHENTICATION
// ======================================

// GET HTML ELEMENTS
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const authMessage = document.getElementById("authMessage");
const logoutButton = document.getElementById("logoutButton"); // The one on login.html
const forgotPassword = document.getElementById("forgotPassword");

// UI State Elements (For login.html)
const authFormsContainer = document.getElementById("authFormsContainer");
const userDetailsContainer = document.getElementById("userDetailsContainer");
const authHeaderText = document.getElementById("authHeaderText");

// UI State Elements (For Navbar)
const navLoggedOut = document.getElementById("navLoggedOut");
const navLoggedIn = document.getElementById("navLoggedIn");
const navUserName = document.getElementById("navUserName");
const navLogoutButton = document.getElementById("navLogoutButton");

// WEBSITE URL
const WEBSITE_URL = "https://campusmarket-vert.vercel.app";


// ======================================
// UI SWITCHING (LOGIN / SIGNUP FORMS)
// ======================================

if (showSignup && showLogin) {
    showSignup.addEventListener("click", function(event) {
        event.preventDefault();
        loginSection.style.display = "none";
        signupSection.style.display = "block";
        authMessage.textContent = "";
        authMessage.className = "";
    });

    showLogin.addEventListener("click", function(event) {
        event.preventDefault();
        signupSection.style.display = "none";
        loginSection.style.display = "block";
        authMessage.textContent = "";
        authMessage.className = "";
    });
}


// ======================================
// DISPLAY MESSAGES & ERROR HANDLING
// ======================================

function displayMessage(message, type) {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.className = "mt-3 alert alert-" + type;
}

function handleAuthError(error) {
    console.error("Authentication error:", error);

    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        displayMessage("Too many email requests. Please wait before trying again.", "warning");
    } else {
        displayMessage(error.message, "danger");
    }
}


// ======================================
// STUDENT REGISTRATION
// ======================================

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const submitButton = signupForm.querySelector('button[type="submit"]');
        if (submitButton.disabled) return;

        const fullName = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";
        displayMessage("Creating your account...", "info");

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${WEBSITE_URL}/login.html`
                }
            });

            if (error) {
                handleAuthError(error);
                return;
            }

            if (data.user && !data.session) {
                displayMessage("Account created! Please check your email and confirm your account before logging in.", "success");
            } else {
                displayMessage("Registration successful! Welcome to CampusMarket.", "success");
            }

            signupForm.reset();
            console.log("Registration result:", data);

        } catch (error) {
            handleAuthError(error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Create Account";
        }
    });
}


// ======================================
// STUDENT LOGIN
// ======================================

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton.disabled) return;

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";
        displayMessage("Checking your account...", "info");

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                handleAuthError(error);
                return;
            }

            displayMessage("Login successful! Welcome to CampusMarket.", "success");
            console.log("Login successful:", data);

            // If they log in on login.html, the UI will switch automatically.
            // If they log in via a modal on another page, redirect to home:
            if (!authFormsContainer) {
                setTimeout(function() {
                    window.location.href = "index.html";
                }, 1500);
            }

        } catch (error) {
            handleAuthError(error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Sign in";
        }
    });
}


// ======================================
// FORGOT PASSWORD
// ======================================

if (forgotPassword) {
    forgotPassword.addEventListener("click", async function(event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();

        if (!email) {
            displayMessage("Please enter your email address first.", "warning");
            document.getElementById("loginEmail").focus();
            return;
        }

        if (forgotPassword.dataset.loading === "true") return;

        forgotPassword.dataset.loading = "true";
        forgotPassword.textContent = "Sending recovery email...";
        displayMessage("Requesting password reset...", "info");

        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${WEBSITE_URL}/reset-password.html`
            });

            if (error) {
                handleAuthError(error);
                return;
            }

            displayMessage("If an account exists for this email, a password recovery link will be sent. Please check your inbox and spam folder.", "success");

        } catch (error) {
            handleAuthError(error);
        } finally {
            forgotPassword.dataset.loading = "false";
            forgotPassword.textContent = "Forgot Password?";
        }
    });
}


// ======================================
// UNIVERSAL STATE MANAGEMENT & UI UPDATES
// ======================================

function updateUI(user) {
    // --- 1. HANDLE LOGIN.HTML SPECIFIC ELEMENTS ---
    if (authFormsContainer && userDetailsContainer && authHeaderText) {
        if (user) {
            authFormsContainer.classList.add('d-none');
            authHeaderText.classList.add('d-none');
            userDetailsContainer.classList.remove('d-none');

            const userName = user.user_metadata?.full_name || user.email.split('@')[0];
            document.getElementById('profileName').textContent = userName;
            document.getElementById('profileEmail').textContent = user.email;
        } else {
            authFormsContainer.classList.remove('d-none');
            authHeaderText.classList.remove('d-none');
            userDetailsContainer.classList.add('d-none');
            
            if(loginSection) loginSection.style.display = "block";
            if(signupSection) signupSection.style.display = "none";
        }
    }

    // --- 2. HANDLE NAVBAR ELEMENTS (index.html, etc.) ---
    if (navLoggedOut && navLoggedIn) {
        if (user) {
            navLoggedOut.classList.add('d-none');
            navLoggedIn.classList.remove('d-none');
            
            if (navUserName) {
                const userName = user.user_metadata?.full_name || user.email.split('@')[0];
                navUserName.textContent = userName;
            }
        } else {
            navLoggedOut.classList.remove('d-none');
            navLoggedIn.classList.add('d-none');
        }
    }
}

// Check for session on page load
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof supabaseClient !== 'undefined') {
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUI(session?.user || null);
    }
});

// Listen for auth changes (Login/Logout)
if (typeof supabaseClient !== 'undefined') {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user || null);
    });
}


// ======================================
// STUDENT LOGOUT (UNIVERSAL)
// ======================================

async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            handleAuthError(error);
            return;
        }
        
        // If on login.html, show success message. Otherwise, redirect to home.
        if (authMessage) {
            displayMessage("You have successfully logged out.", "success");
            setTimeout(function() {
                window.location.href = "login.html";
            }, 1000);
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        handleAuthError(error);
    }
}

// Attach logout click event to the login.html profile logout button
if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        logoutButton.disabled = true;
        handleLogout();
        // Note: We don't re-enable the button here because the page will redirect or swap UI
    });
}

// Attach logout click event to the Navbar logout button
if (navLogoutButton) {
    navLogoutButton.addEventListener("click", function() {
        navLogoutButton.disabled = true;
        handleLogout();
    });
}
