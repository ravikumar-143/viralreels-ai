// ViralReels AI - Phase 8 Admin Dashboard

(function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const pageTitle = document.getElementById("pageTitle");
  const demoRibbon = document.getElementById("adminDemoRibbon");
  const adminEmailLabel = document.getElementById("adminEmailLabel");
  const userSearchInput = document.getElementById("adminUserSearch");

  let adminData = {
    profiles: [],
    videos: [],
    payments: [],
    socialAccounts: []
  };
  let isDemo = false;
  let accessToken = null;

  function getDemoAdminData() {
    return {
      profiles: [
        { id: "u1", full_name: "Aarav Sharma", email: "aarav@example.com", plan: "Pro", credits: 142, created_at: new Date().toISOString() },
        { id: "u2", full_name: "Priya Nair", email: "priya@example.com", plan: "Creator", credits: 38, created_at: new Date().toISOString() },
        { id: "u3", full_name: "Demo Creator", email: "creator@viralreelsai.com", plan: "Starter", credits: 10, created_at: new Date().toISOString() }
      ],
      videos: [
        { id: "v1", user_id: "u1", title: "5 Hidden Temples in India", niche: "History", status: "Ready", created_at: new Date().toISOString() },
        { id: "v2", user_id: "u2", title: "Norse Mythology Explained", niche: "Mythology", status: "Ready", created_at: new Date().toISOString() }
      ],
      payments: [
        { id: "p1", user_id: "u1", plan_name: "Pro", credits_added: 150, amount_inr: 2499, status: "Paid", created_at: new Date().toISOString() },
        { id: "p2", user_id: "u2", plan_name: "Creator", credits_added: 50, amount_inr: 999, status: "Paid", created_at: new Date().toISOString() }
      ],
      socialAccounts: [
        { user_id: "u1", platform: "youtube", account_name: "Aarav History" },
        { user_id: "u1", platform: "instagram", account_name: "@aarav.reels" },
        { user_id: "u2", platform: "youtube", account_name: "Mythology Daily" }
      ]
    };
  }

  function renderAll() {
    const totalRevenue = adminData.payments.reduce((sum, p) => sum + Number(p.amount_inr || 0), 0);
    document.getElementById("adminKpiUsers").textContent = adminData.profiles.length;
    document.getElementById("adminKpiRevenue").innerHTML = "&#8377;" + totalRevenue.toLocaleString();
    document.getElementById("adminKpiVideos").textContent = adminData.videos.length;
    document.getElementById("adminKpiChannels").textContent = adminData.socialAccounts.length;

    renderUsers();
    renderPayments();
    renderVideos();
    renderOverviewActivity();
  }

  function renderOverviewActivity() {
    const el = document.getElementById("adminRecentActivity");
    const rows = adminData.payments.slice(0, 5).map((p) => `
      <tr>
        <td>${p.plan_name} Plan Upgrade</td>
        <td>+${p.credits_added} credits</td>
        <td>&#8377;${Number(p.amount_inr).toLocaleString()}</td>
        <td><span class="badge badge-ready">${p.status}</span></td>
      </tr>`).join("");
    el.innerHTML = rows
      ? `<table><thead><tr><th>Event</th><th>Credits</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<div class="empty-state"><p>No recent transactions.</p></div>`;
  }

  function renderUsers() {
    const el = document.getElementById("adminUsersTable");
    const q = (userSearchInput ? userSearchInput.value : "").trim().toLowerCase();
    const list = adminData.profiles.filter(
      (u) => !q || (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );

    const rows = list.map((u) => {
      const channels = adminData.socialAccounts
        .filter((s) => s.user_id === u.id)
        .map((s) => s.platform)
        .join(", ") || "None";

      return `
        <tr>
          <td><strong>${u.full_name || "User"}</strong><br><span style="font-size:0.78rem;color:var(--text-secondary);">${u.email}</span></td>
          <td>${u.plan || "Starter"}</td>
          <td><strong>${u.credits ?? 0}</strong></td>
          <td>${channels}</td>
          <td>
            <button type="button" class="btn-secondary-sm" data-add-credits="${u.id}">+10 Credits</button>
          </td>
        </tr>`;
    }).join("");

    el.innerHTML = `<table><thead><tr><th>User</th><th>Plan</th><th>Credits</th><th>Connected Socials</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>`;

    el.querySelectorAll("[data-add-credits]").forEach((btn) => {
      btn.addEventListener("click", () => addCreditsToUser(btn.dataset.addCredits, 10));
    });
  }

  function renderPayments() {
    const el = document.getElementById("adminPaymentsTable");
    const rows = adminData.payments.map((p) => `
      <tr>
        <td>${p.plan_name}</td>
        <td>+${p.credits_added}</td>
        <td>&#8377;${Number(p.amount_inr).toLocaleString()}</td>
        <td><span class="badge badge-ready">${p.status}</span></td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
      </tr>`).join("");
    el.innerHTML = rows
      ? `<table><thead><tr><th>Plan</th><th>Credits</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<div class="empty-state"><p>No payments recorded yet.</p></div>`;
  }

  function renderVideos() {
    const el = document.getElementById("adminVideosTable");
    const rows = adminData.videos.map((v) => `
      <tr>
        <td><strong>${v.title}</strong></td>
        <td>${v.niche}</td>
        <td><span class="badge badge-ready">${v.status}</span></td>
        <td>${new Date(v.created_at).toLocaleDateString()}</td>
      </tr>`).join("");
    el.innerHTML = rows
      ? `<table><thead><tr><th>Title</th><th>Niche</th><th>Status</th><th>Created</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<div class="empty-state"><p>No videos generated yet.</p></div>`;
  }

  async function addCreditsToUser(userId, delta) {
    const user = adminData.profiles.find((u) => u.id === userId);
    if (!user) return;
    const nextCredits = Number(user.credits || 0) + delta;

    if (isDemo) {
      user.credits = nextCredits;
      renderAll();
      return;
    }

    const res = await fetch("/api/admin-update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ userId, credits: nextCredits })
    });

    if (res.ok) {
      user.credits = nextCredits;
      renderAll();
    }
  }

  async function initAdmin() {
    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase) {
      isDemo = true;
      demoRibbon.classList.add("visible");
      adminData = getDemoAdminData();
      renderAll();
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      window.location.href = "login.html";
      return;
    }

    accessToken = data.session.access_token;
    adminEmailLabel.textContent = data.session.user.email;

    try {
      const res = await fetch("/api/admin-data", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Admin API not configured");
      adminData = await res.json();
      renderAll();
    } catch (_err) {
      isDemo = true;
      demoRibbon.classList.add("visible");
      adminData = getDemoAdminData();
      renderAll();
    }
  }

  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      document.querySelectorAll(".view-section").forEach((s) => s.classList.toggle("active", s.id === "view-" + view));
      document.querySelectorAll(".nav-item[data-view]").forEach((b) => b.classList.toggle("active", b === btn));
      pageTitle.textContent = btn.dataset.title;
      sidebar.classList.remove("open");
      sidebarBackdrop.classList.remove("open");
    });
  });

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", () => { sidebar.classList.add("open"); sidebarBackdrop.classList.add("open"); });
  if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", () => { sidebar.classList.remove("open"); sidebarBackdrop.classList.remove("open"); });
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", () => { sidebar.classList.remove("open"); sidebarBackdrop.classList.remove("open"); });
  if (userSearchInput) userSearchInput.addEventListener("input", renderUsers);

  initAdmin();
})();
