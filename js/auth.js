// ViralReels AI - Authentication Logic (Supabase Auth + Demo Fallback)

(function () {
  const alertBox = document.getElementById("alertBox");
  const setupBanner = document.getElementById("setupBanner");
  const demoModeBtn = document.getElementById("demoModeBtn");
  const googleAuthBtn = document.getElementById("googleAuthBtn");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  const supabase = window.getSupabaseClient();

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = "alert-box " + type;
  }

  function clearAlert() {
    if (!alertBox) return;
    alertBox.textContent = "";
    alertBox.className = "alert-box";
  }

  function setLoading(button, isLoading, defaultText) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? "Please wait..." : defaultText;
  }

  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "Hide" : "Show";
    });
  });

  // Show setup banner & demo button if Supabase keys aren't set yet
  if (!supabase) {
    if (setupBanner) setupBanner.classList.add("visible");
    if (demoModeBtn) {
      demoModeBtn.style.display = "block";
      demoModeBtn.addEventListener("click", () => {
        localStorage.setItem(
          window.VIRALREELS_CONFIG.DEMO_STORAGE_KEY,
          JSON.stringify({
            id: "demo-user-001",
            email: "creator@viralreelsai.com",
            full_name: "Demo Creator",
            isDemo: true
          })
        );
        window.location.href = "dashboard.html";
      });
    }
  } else {
    // Redirect to dashboard if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data && data.session) {
        window.location.href = "dashboard.html";
      }
    });
  }

  // Google OAuth
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener("click", async () => {
      clearAlert();
      if (!supabase) {
        showAlert("Configure Supabase in js/config.js first, or use Demo Mode.", "error");
        return;
      }
      const redirectTo = window.location.origin + window.location.pathname.replace(/(login|signup)\.html$/, "dashboard.html");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
      if (error) {
        showAlert(error.message, "error");
      }
    });
  }

  // Login Form
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = document.getElementById("submitBtn");

      if (!email || !password) {
        showAlert("Please enter both your email and password.", "error");
        return;
      }

      if (!supabase) {
        showAlert("Supabase is not configured in js/config.js yet. Click Demo Mode below to preview.", "error");
        return;
      }

      setLoading(submitBtn, true, "Sign In");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(submitBtn, false, "Sign In");

      if (error) {
        showAlert(error.message, "error");
        return;
      }

      window.location.href = "dashboard.html";
    });
  }

  // Forgot Password
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      clearAlert();

      if (!supabase) {
        showAlert("Configure Supabase in js/config.js to enable password resets.", "error");
        return;
      }

      const email = document.getElementById("email").value.trim();
      if (!email) {
        showAlert("Enter your email address above first, then click Forgot password.", "error");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname.replace("login.html", "dashboard.html")
      });

      if (error) {
        showAlert(error.message, "error");
      } else {
        showAlert("Password reset link sent! Check your email inbox.", "success");
      }
    });
  }

  // Signup Form
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const termsChecked = document.getElementById("termsCheckbox").checked;
      const submitBtn = document.getElementById("submitBtn");

      if (!fullName || !email || !password) {
        showAlert("Please fill in all required fields.", "error");
        return;
      }

      if (password.length < 6) {
        showAlert("Password must be at least 6 characters.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Passwords do not match.", "error");
        return;
      }

      if (!termsChecked) {
        showAlert("Please accept the Terms of Service to continue.", "error");
        return;
      }

      if (!supabase) {
        showAlert("Supabase is not configured in js/config.js yet. Click Demo Mode below to preview.", "error");
        return;
      }

      setLoading(submitBtn, true, "Create Account");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      setLoading(submitBtn, false, "Create Account");

      if (error) {
        showAlert(error.message, "error");
        return;
      }

      if (data && data.session) {
        window.location.href = "dashboard.html";
      } else {
        showAlert("Account created! Please check your email to confirm your address before signing in.", "success");
        signupForm.reset();
      }
    });
  }
})();
