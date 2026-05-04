// ============================================================
// IndAI Platform – Shared Modal Components
// Terms of Service, Privacy Policy, Forgot Password
// ============================================================

const Modals = {

  showTerms() {
    UI.showModal(`
      <div class="modal-title">Tasks Terms of Service</div>
      <div class="modal-subtitle">Last updated: 30 March 2026</div>
      <div style="max-height:480px;overflow-y:auto;padding-right:4px;font-size:13px;line-height:1.8;color:var(--gray-700);">

        <h4 style="margin:16px 0 8px;color:var(--dark);">1. Acceptance of Terms</h4>
        <p>By accessing or using the IndAI paper trading platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">2. Description of Service</h4>
        <p>IndAI is an educational paper trading platform designed to simulate real stock market environments using virtual currency. <strong>No real money is involved.</strong> All trades are simulated and for educational purposes only. Portfolio values, gains, and losses do not represent real financial outcomes.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">3. Eligibility</h4>
        <p>The Service is available to students, instructors, course providers, and administrators associated with participating institutions. Users must register with accurate information and maintain the confidentiality of their credentials.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">4. Account Registration &amp; Approval</h4>
        <p>Learner accounts are activated immediately upon registration. Instructor, Course Provider, and Administrator accounts require Super Admin approval before access is granted. You will be notified by email once your account is reviewed.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">5. Permitted Use</h4>
        <p>You agree to use the Service solely for educational purposes. You must not: attempt to manipulate the simulation; use automated bots; share login credentials; or attempt to compromise platform security.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">6. Intellectual Property</h4>
        <p>All content, data, and functionality on IndAI are the property of IndAI and its licensors. You may not reproduce, distribute, or create derivative works without prior written permission.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">7. Disclaimer of Warranties</h4>
        <p>The Service is provided "as is" without warranties of any kind. IndAI does not guarantee uninterrupted access, accuracy of market data, or fitness for a particular purpose. Stock prices shown are for simulation only and do not reflect real-time market data.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">8. Limitation of Liability</h4>
        <p>IndAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Total liability shall not exceed the fees paid, if any, in the 12 months prior to the claim.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">9. Modifications</h4>
        <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">10. Contact</h4>
        <p>For questions regarding these Terms, contact us at <strong>legal@indai.com</strong> or write to IndAI Platform, IIIT Sri City, Chittoor, Andhra Pradesh 517646, India.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="UI.closeModal()">I Understand</button>
      </div>`);
  },

  showPrivacy() {
    UI.showModal(`
      <div class="modal-title">🔒 Privacy Policy</div>
      <div class="modal-subtitle">Last updated: 30 March 2026</div>
      <div style="max-height:480px;overflow-y:auto;padding-right:4px;font-size:13px;line-height:1.8;color:var(--gray-700);">

        <h4 style="margin:16px 0 8px;color:var(--dark);">1. Information We Collect</h4>
        <p>We collect information you provide during registration (name, email, institution, phone) and data generated through platform use (trades, quiz scores, session attendance). All data is stored locally in your browser using localStorage and is not transmitted to external servers.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">2. How We Use Your Information</h4>
        <p>Your data is used to: personalise your learning experience; generate performance reports; facilitate instructor-student interactions; and improve platform functionality. We do not sell or share your data with third parties.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">3. Data Storage</h4>
        <p>IndAI stores all data in your browser's localStorage. This means your data remains on your device. Clearing browser data will reset your account to default state. We recommend noting your credentials in a secure location.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">4. Cookies</h4>
        <p>IndAI uses only localStorage and sessionStorage — no third-party cookies are set. We do not use analytics tracking cookies.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">5. Data Security</h4>
        <p>While we implement reasonable security measures, no system is completely secure. Passwords are stored in plaintext within the simulation environment as this is an educational platform with no real financial data. Do not use real passwords for IndAI accounts.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">6. Children's Privacy</h4>
        <p>IndAI is designed for educational use across all age groups. We encourage parental or institutional supervision for users under 13. We do not knowingly collect personal data from children without institutional consent.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">7. Your Rights</h4>
        <p>You may request deletion of your account data at any time by contacting your institution administrator or clearing your browser's localStorage. You have the right to access and correct your personal information via the Settings panel.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">8. Changes to This Policy</h4>
        <p>We may update this Privacy Policy periodically. Significant changes will be communicated through a platform notification.</p>

        <h4 style="margin:16px 0 8px;color:var(--dark);">9. Contact Us</h4>
        <p>For privacy concerns, contact our Data Protection Officer at <strong>privacy@indai.com</strong>.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="UI.closeModal()">Close</button>
      </div>`);
  },

  showForgotPassword() {
    UI.showModal(`
      <div class="modal-title">Key Reset Password</div>
      <div class="modal-subtitle">Enter your registered email to receive reset instructions</div>
      <div id="fp-step1">
        <div class="form-group" style="margin-bottom:8px;">
          <label class="form-label">Email Address *</label>
          <input type="email" id="fp-email" class="form-input" placeholder="your@email.com" oninput="this.classList.remove('input-error')">
          <span class="field-error" id="fp-err-email"></span>
        </div>
        <div class="alert alert-blue" style="margin-bottom:16px;">
          ℹ️ <div style="font-size:12px;">Since this is a demo platform, we'll show you your password directly. In a production system, a reset link would be sent to your email.</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Modals._lookupPassword()">Find My Account →</button>
        </div>
      </div>
      <div id="fp-step2" style="display:none;"></div>`);
  },

  _lookupPassword() {
    const email = document.getElementById("fp-email").value.trim();
    const errEl = document.getElementById("fp-err-email");
    errEl.textContent = "";
    document.getElementById("fp-email").classList.remove("input-error");

    if (!email) {
      document.getElementById("fp-email").classList.add("input-error");
      errEl.textContent = "Email address is required.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("fp-email").classList.add("input-error");
      errEl.textContent = "Enter a valid email address.";
      return;
    }

    const user = IndAIData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const step2 = document.getElementById("fp-step2");
    document.getElementById("fp-step1").style.display = "none";
    step2.style.display = "block";

    if (!user) {
      step2.innerHTML = `
        <div class="alert alert-red" style="margin-bottom:20px;">
          No No account found with email <strong>${email}</strong>.<br>
          Please check the email address or <a href="register.html" style="color:var(--red);font-weight:700;">create a new account</a>.
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
          <button class="btn btn-primary" onclick="Modals.showForgotPassword()">Try Again</button>
        </div>`;
      return;
    }

    if (user.status === "pending") {
      step2.innerHTML = `
        <div class="alert alert-orange" style="margin-bottom:20px;">
          Pending Account found but <strong>pending approval</strong>.<br>
          Your account is awaiting Super Admin review. You'll be notified once approved.
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">OK</button></div>`;
      return;
    }

    const roleLabels = { learner:"Learner", instructor:"Instructor", provider:"Course Provider", admin:"Administrator", superuser:"Super User" };
    step2.innerHTML = `
      <div class="alert alert-green" style="margin-bottom:20px;">
        Done Account found for <strong>${user.firstName} ${user.lastName}</strong>
      </div>
      <div class="report-card" style="margin-bottom:20px;">
        <div class="report-metric">
          <span class="label">Email</span>
          <span class="value">${user.email}</span>
        </div>
        <div class="report-metric">
          <span class="label">Role</span>
          <span class="value">${roleLabels[user.role] || user.role}</span>
        </div>
        <div class="report-metric">
          <span class="label">Your Password</span>
          <span class="value" style="font-family:monospace;background:var(--gray-100);padding:4px 10px;border-radius:4px;letter-spacing:2px;">${user.password}</span>
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <label class="form-label">Set New Password (optional)</label>
        <input type="password" id="fp-new-pw" class="form-input" placeholder="Leave blank to keep current password" oninput="Modals._checkNewPw()">
        <div class="pw-req" style="margin-top:8px;">
          <div class="pw-rule" id="fp-pw-len">At least 8 characters</div>
          <div class="pw-rule" id="fp-pw-upper">One uppercase letter</div>
          <div class="pw-rule" id="fp-pw-num">One number</div>
          <div class="pw-rule" id="fp-pw-special">One special character</div>
        </div>
        <span class="field-error" id="fp-err-new"></span>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="Modals._saveNewPassword('${user.id}')">Update Password</button>
      </div>`;
  },

  _checkNewPw() {
    const pw = document.getElementById("fp-new-pw")?.value || "";
    const c  = Validate.password(pw);
    const set = (id, met) => {
      const el = document.getElementById(id);
      if (el) el.className = "pw-rule" + (met ? " met" : "");
    };
    set("fp-pw-len",     c.length);
    set("fp-pw-upper",   c.upper);
    set("fp-pw-num",     c.number);
    set("fp-pw-special", c.special);
  },

  _saveNewPassword(userId) {
    const pw    = document.getElementById("fp-new-pw")?.value || "";
    const errEl = document.getElementById("fp-err-new");
    if (errEl) errEl.textContent = "";

    if (pw) {
      const checks = Validate.password(pw);
      if (!checks.valid()) {
        if (errEl) errEl.textContent = "Password must meet all requirements.";
        return;
      }
      DB.updateUser(userId, { password: pw });
      UI.closeModal();
      UI.showToast("Done Password updated successfully! You can now sign in.");
    } else {
      UI.closeModal();
      UI.showToast("ℹ️ Password unchanged. You can sign in with your existing password.", "info");
    }
  }
};
