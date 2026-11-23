// ViralReels AI - Phase 3 User Dashboard (Supabase DB + Demo Persistence)

(function () {
  const supabase = window.getSupabaseClient();
  const demoKey = window.VIRALREELS_CONFIG.DEMO_STORAGE_KEY;
  const demoDataKey = "viralreels_demo_workspace_v3";

  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const pageTitle = document.getElementById("pageTitle");
  const demoRibbon = document.getElementById("demoRibbon");

  const userAvatar = document.getElementById("userAvatar");
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const welcomeHeading = document.getElementById("welcomeHeading");
  const creditsCountEl = document.getElementById("creditsCount");

  const kpiVideos = document.getElementById("kpiVideos");
  const kpiCredits = document.getElementById("kpiCredits");
  const kpiPlan = document.getElementById("kpiPlan");
  const kpiChannels = document.getElementById("kpiChannels");
  const kpiScheduled = document.getElementById("kpiScheduled");

  const recentVideosContainer = document.getElementById("recentVideosContainer");
  const allVideosContainer = document.getElementById("allVideosContainer");
  const scheduledPostsContainer = document.getElementById("scheduledPostsContainer");
  const analyticsChart = document.getElementById("analyticsChart");
  const analyticsSummary = document.getElementById("analyticsSummary");

  const videoSearchInput = document.getElementById("videoSearchInput");
  const videoStatusFilter = document.getElementById("videoStatusFilter");

  const settingsName = document.getElementById("settingsName");
  const settingsEmail = document.getElementById("settingsEmail");
  const profileForm = document.getElementById("profileForm");
  const profileStatus = document.getElementById("profileStatus");
  const passwordForm = document.getElementById("passwordForm");
  const passwordStatus = document.getElementById("passwordStatus");

  let currentUser = null;
  let isDemoMode = false;
  let state = {
    profile: { credits: 10, plan: "Starter" },
    videos: [],
    scheduledPosts: [],
    socialAccounts: []
  };

  function getDefaultDemoData() {
    return {
      profile: { credits: 10, plan: "Starter" },
      videos: [
        {
          id: "vid-1",
          title: "The Mystery of the Hanging Gardens",
          niche: "History",
          aspect_ratio: "9:16",
          duration_sec: 48,
          status: "Ready",
          views: 1420,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: "vid-2",
          title: "Why Norse Mythology Predicted Ragnarok",
          niche: "Mythology",
          aspect_ratio: "9:16",
          duration_sec: 55,
          status: "Draft",
          views: 0,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      scheduledPosts: [
        {
          id: "post-1",
          video_title: "The Mystery of the Hanging Gardens",
          platform: "YouTube Shorts",
          scheduled_for: new Date(Date.now() + 86400000).toISOString(),
          status: "Scheduled"
        }
      ],
      socialAccounts: []
    };
  }

  function saveDemoData() {
    localStorage.setItem(demoDataKey, JSON.stringify(state));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function badgeClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "ready") return "badge-ready";
    if (s === "rendering") return "badge-rendering";
    if (s === "scheduled") return "badge-scheduled";
    return "badge-draft";
  }

  function renderUser(user) {
    currentUser = user;
    const displayName =
      (user.user_metadata && user.user_metadata.full_name) ||
      user.full_name ||
      user.email.split("@")[0];

    userNameEl.textContent = displayName;
    userEmailEl.textContent = user.email;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    welcomeHeading.textContent = "Welcome back, " + displayName + "!";

    if (settingsName) settingsName.value = displayName;
    if (settingsEmail) settingsEmail.value = user.email;
  }

  function renderAll() {
    // KPIs
    const credits = state.profile ? state.profile.credits : 10;
    const plan = state.profile ? state.profile.plan : "Starter";
    creditsCountEl.textContent = credits;
    kpiCredits.textContent = credits;
    kpiPlan.textContent = plan + " Plan";
    kpiVideos.textContent = state.videos.length;
    kpiChannels.textContent = state.socialAccounts.length;
    kpiScheduled.textContent = state.scheduledPosts.filter((p) => p.status === "Scheduled").length;

    renderVideoTable(recentVideosContainer, state.videos.slice(0, 5), false);
    renderFilteredVideos();
    renderScheduledTable();
    renderAnalytics();
  }

  function renderVideoTable(container, list, showDelete) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><h3>No videos found</h3><p>Create a new video project to get started.</p></div>`;
      return;
    }

    const rows = list
      .map(
        (v) => `
      <tr>
        <td><strong>${escapeHtml(v.title)}</strong></td>
        <td>${escapeHtml(v.niche)}</td>
        <td>${escapeHtml(v.aspect_ratio || "9:16")}</td>
        <td><span class="badge ${badgeClass(v.status)}">${escapeHtml(v.status)}</span></td>
        <td>${formatDate(v.created_at)}</td>
        ${
          showDelete
            ? `<td><button type="button" class="btn-danger-sm" data-delete-video="${v.id}">Delete</button></td>`
            : ""
        }
      </tr>`
      )
      .join("");

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Niche</th>
            <th>Format</th>
            <th>Status</th>
            <th>Created</th>
            ${showDelete ? "<th>Action</th>" : ""}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    if (showDelete) {
      container.querySelectorAll("[data-delete-video]").forEach((btn) => {
        btn.addEventListener("click", () => deleteVideo(btn.dataset.deleteVideo));
      });
    }
  }

  function renderFilteredVideos() {
    const query = (videoSearchInput ? videoSearchInput.value : "").trim().toLowerCase();
    const status = videoStatusFilter ? videoStatusFilter.value : "ALL";

    const filtered = state.videos.filter((v) => {
      const matchesQuery =
        !query ||
        v.title.toLowerCase().includes(query) ||
        v.niche.toLowerCase().includes(query);
      const matchesStatus = status === "ALL" || v.status === status;
      return matchesQuery && matchesStatus;
    });

    renderVideoTable(allVideosContainer, filtered, true);
  }

  function renderScheduledTable() {
    if (!scheduledPostsContainer) return;
    if (!state.scheduledPosts.length) {
      scheduledPostsContainer.innerHTML = `<div class="empty-state"><h3>No scheduled posts</h3><p>Click "+ Schedule Post" to queue a video for YouTube Shorts or Instagram Reels.</p></div>`;
      return;
    }

    const rows = state.scheduledPosts
      .map(
        (p) => `
      <tr>
        <td><strong>${escapeHtml(p.video_title)}</strong></td>
        <td>${escapeHtml(p.platform)}</td>
        <td>${formatDateTime(p.scheduled_for)}</td>
        <td><span class="badge ${badgeClass(p.status)}">${escapeHtml(p.status)}</span></td>
        <td><button type="button" class="btn-danger-sm" data-delete-post="${p.id}">Remove</button></td>
      </tr>`
      )
      .join("");

    scheduledPostsContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Video</th>
            <th>Platform</th>
            <th>Scheduled For</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    scheduledPostsContainer.querySelectorAll("[data-delete-post]").forEach((btn) => {
      btn.addEventListener("click", () => deleteScheduledPost(btn.dataset.deletePost));
    });
  }

  function renderAnalytics() {
    if (!analyticsChart || !analyticsSummary) return;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totalViews = state.videos.reduce((acc, v) => acc + (v.views || 0), 0);
    const heights = totalViews > 0 ? [28, 42, 35, 68, 54, 85, 72] : [12, 18, 10, 22, 16, 25, 20];

    analyticsChart.innerHTML = days
      .map(
        (d, i) => `
      <div class="bar-col">
        <div class="bar-fill" style="height: ${heights[i]}%;"></div>
        <span class="bar-label">${d}</span>
      </div>`
      )
      .join("");

    const readyCount = state.videos.filter((v) => v.status === "Ready").length;
    const draftCount = state.videos.filter((v) => v.status === "Draft").length;

    analyticsSummary.innerHTML = `
      <div class="kpi-card" style="padding: 14px;">
        <div class="kpi-label">Total Tracked Views</div>
        <div class="kpi-value" style="font-size: 1.4rem;">${totalViews.toLocaleString()}</div>
      </div>
      <div class="kpi-card" style="padding: 14px;">
        <div class="kpi-label">Ready vs. Draft Videos</div>
        <div class="kpi-value" style="font-size: 1.4rem;">${readyCount} / ${draftCount}</div>
      </div>`;
  }

  async function loadWorkspaceData() {
    if (isDemoMode) {
      const saved = localStorage.getItem(demoDataKey);
      state = saved ? JSON.parse(saved) : getDefaultDemoData();
      saveDemoData();
      renderAll();
      return;
    }

    const userId = currentUser.id;
    const [profileRes, videosRes, postsRes, socialRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("videos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("scheduled_posts").select("*").eq("user_id", userId).order("scheduled_for", { ascending: true }),
      supabase.from("social_accounts").select("*").eq("user_id", userId)
    ]);

    if (profileRes.data) state.profile = profileRes.data;
    if (videosRes.data) state.videos = videosRes.data;
    if (postsRes.data) state.scheduledPosts = postsRes.data;
    if (socialRes.data) state.socialAccounts = socialRes.data;

    renderAll();
  }

  async function createVideoProject(title, niche, aspect_ratio) {
    if (isDemoMode) {
      state.videos.unshift({
        id: "vid-" + Date.now(),
        title,
        niche,
        aspect_ratio,
        duration_sec: 45,
        status: "Draft",
        views: 0,
        created_at: new Date().toISOString()
      });
      saveDemoData();
      renderAll();
      return;
    }

    const { data, error } = await supabase
      .from("videos")
      .insert([{ user_id: currentUser.id, title, niche, aspect_ratio, status: "Draft" }])
      .select()
      .single();

    if (!error && data) {
      state.videos.unshift(data);
      renderAll();
    }
  }

  async function deleteVideo(id) {
    if (isDemoMode) {
      state.videos = state.videos.filter((v) => v.id !== id);
      saveDemoData();
      renderAll();
      return;
    }
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (!error) {
      state.videos = state.videos.filter((v) => v.id !== id);
      renderAll();
    }
  }

  async function createScheduledPost(video_title, platform, scheduled_for) {
    if (isDemoMode) {
      state.scheduledPosts.push({
        id: "post-" + Date.now(),
        video_title,
        platform,
        scheduled_for,
        status: "Scheduled"
      });
      saveDemoData();
      renderAll();
      return;
    }

    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert([{ user_id: currentUser.id, video_title, platform, scheduled_for, status: "Scheduled" }])
      .select()
      .single();

    if (!error && data) {
      state.scheduledPosts.push(data);
      renderAll();
    }
  }

  async function deleteScheduledPost(id) {
    if (isDemoMode) {
      state.scheduledPosts = state.scheduledPosts.filter((p) => p.id !== id);
      saveDemoData();
      renderAll();
      return;
    }
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
    if (!error) {
      state.scheduledPosts = state.scheduledPosts.filter((p) => p.id !== id);
      renderAll();
    }
  }

  async function initSession() {
    if (!supabase) {
      const rawDemo = localStorage.getItem(demoKey);
      if (!rawDemo) {
        window.location.href = "login.html";
        return;
      }
      isDemoMode = true;
      if (demoRibbon) demoRibbon.classList.add("visible");
      renderUser(JSON.parse(rawDemo));
      await loadWorkspaceData();
      return;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data || !data.session) {
      window.location.href = "login.html";
      return;
    }

    renderUser(data.session.user);
    await loadWorkspaceData();
  }

  function switchView(viewName, titleText) {
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === "view-" + viewName);
    });
    document.querySelectorAll(".nav-item").forEach((btn) => {
      const isMatch = btn.dataset.view === viewName;
      btn.classList.toggle("active", isMatch);
      if (isMatch && !titleText) titleText = btn.dataset.title;
    });
    if (titleText) pageTitle.textContent = titleText;
    closeMobileSidebar();
  }

  function openMobileSidebar() {
    sidebar.classList.add("open");
    sidebarBackdrop.classList.add("open");
  }

  function closeMobileSidebar() {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("open");
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("open");
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("open");
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMobileSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view, btn.dataset.title));
  });

  document.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.jump));
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });

  ["openNewProjectModalBtn", "bannerNewProjectBtn", "videosTabNewBtn"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => openModal("newProjectModal"));
  });

  const openScheduleModalBtn = document.getElementById("openScheduleModalBtn");
  if (openScheduleModalBtn) {
    openScheduleModalBtn.addEventListener("click", () => openModal("scheduleModal"));
  }

  const newProjectForm = document.getElementById("newProjectForm");
  if (newProjectForm) {
    newProjectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("projectTitle").value.trim();
      const niche = document.getElementById("projectNiche").value;
      const ratio = document.getElementById("projectRatio").value;
      if (!title) return;
      await createVideoProject(title, niche, ratio);
      newProjectForm.reset();
      closeModal("newProjectModal");
    });
  }

  const scheduleForm = document.getElementById("scheduleForm");
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("scheduleVideoTitle").value.trim();
      const platform = document.getElementById("schedulePlatform").value;
      const dt = document.getElementById("scheduleDateTime").value;
      if (!title || !dt) return;
      await createScheduledPost(title, platform, new Date(dt).toISOString());
      scheduleForm.reset();
      closeModal("scheduleModal");
    });
  }

  if (videoSearchInput) videoSearchInput.addEventListener("input", renderFilteredVideos);
  if (videoStatusFilter) videoStatusFilter.addEventListener("change", renderFilteredVideos);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (isDemoMode) {
        localStorage.removeItem(demoKey);
        window.location.href = "login.html";
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      profileStatus.textContent = "";
      const newName = settingsName.value.trim();
      if (!newName) return;

      if (isDemoMode) {
        const updated = { ...currentUser, full_name: newName };
        localStorage.setItem(demoKey, JSON.stringify(updated));
        renderUser(updated);
        profileStatus.textContent = "Profile updated (Demo Mode).";
        profileStatus.className = "status-msg success";
        return;
      }

      const [authRes] = await Promise.all([
        supabase.auth.updateUser({ data: { full_name: newName } }),
        supabase.from("profiles").update({ full_name: newName }).eq("id", currentUser.id)
      ]);

      if (authRes.error) {
        profileStatus.textContent = authRes.error.message;
        profileStatus.className = "status-msg error";
      } else {
        renderUser(authRes.data.user);
        profileStatus.textContent = "Profile updated successfully.";
        profileStatus.className = "status-msg success";
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      passwordStatus.textContent = "";
      const newPassword = document.getElementById("newPassword").value;

      if (isDemoMode) {
        passwordStatus.textContent = "Connect Supabase in js/config.js to change passwords.";
        passwordStatus.className = "status-msg error";
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        passwordStatus.textContent = error.message;
        passwordStatus.className = "status-msg error";
      } else {
        passwordForm.reset();
        passwordStatus.textContent = "Password updated successfully.";
        passwordStatus.className = "status-msg success";
      }
    });
  }


  window.addGeneratedVideoToWorkspace = async function (videoObj) {
    if (isDemoMode) {
      state.videos.unshift({
        id: "vid-" + Date.now(),
        title: videoObj.title,
        niche: videoObj.niche,
        aspect_ratio: videoObj.aspect_ratio,
        duration_sec: videoObj.duration_sec || 45,
        status: videoObj.status || "Ready",
        views: 0,
        created_at: new Date().toISOString()
      });
      if (state.profile && state.profile.credits > 0) {
        state.profile.credits -= 1;
      }
      saveDemoData();
      renderAll();
      return;
    }

    const { data, error } = await supabase
      .from("videos")
      .insert([{
        user_id: currentUser.id,
        title: videoObj.title,
        niche: videoObj.niche,
        aspect_ratio: videoObj.aspect_ratio,
        duration_sec: videoObj.duration_sec || 45,
        status: videoObj.status || "Ready"
      }])
      .select()
      .single();

    if (!error && data) {
      state.videos.unshift(data);
      if (state.profile && state.profile.credits > 0) {
        const nextCredits = state.profile.credits - 1;
        await supabase.from("profiles").update({ credits: nextCredits }).eq("id", currentUser.id);
        state.profile.credits = nextCredits;
      }
      renderAll();
    }
  };


  window.getWorkspaceVideos = function () {
    return state.videos || [];
  };

  window.addScheduledPostToWorkspace = async function (video_title, platform, scheduled_for) {
    await createScheduledPost(video_title, platform, scheduled_for);
  };

  window.registerSocialConnection = async function (platform, account_name, followers_count) {
    if (isDemoMode) {
      if (!state.socialAccounts.find((a) => a.platform === platform)) {
        state.socialAccounts.push({ id: "soc-" + Date.now(), platform, account_name, followers_count });
        saveDemoData();
        renderAll();
      }
      return;
    }
    await supabase.from("social_accounts").insert([{ user_id: currentUser.id, platform, account_name, followers_count }]);
    await loadWorkspaceData();
  };


  window.getWorkspaceProfile = function () {
    return state.profile || { credits: 10, plan: "Starter" };
  };

  window.applyPlanUpgrade = async function (planName, creditsToAdd) {
    if (!state.profile) state.profile = { credits: 10, plan: "Starter" };
    const newCredits = (state.profile.credits || 0) + creditsToAdd;
    state.profile.plan = planName;
    state.profile.credits = newCredits;

    if (isDemoMode) {
      saveDemoData();
      renderAll();
      return;
    }

    await supabase
      .from("profiles")
      .update({ plan: planName, credits: newCredits })
      .eq("id", currentUser.id);
    renderAll();
  };

  initSession();
})();
