// ViralReels AI - Phase 6 Instagram Reels Manager

(function () {
  const connectBtn = document.getElementById("igConnectBtn");
  const disconnectBtn = document.getElementById("igDisconnectBtn");
  const disconnectedBox = document.getElementById("igDisconnectedBox");
  const connectedBox = document.getElementById("igConnectedBox");

  const accountAvatar = document.getElementById("igAccountAvatar");
  const accountUsername = document.getElementById("igUsername");
  const followersCount = document.getElementById("igFollowersCount");
  const mediaCount = document.getElementById("igMediaCount");

  const publishForm = document.getElementById("igPublishForm");
  const videoSelect = document.getElementById("igVideoSelect");
  const captionInput = document.getElementById("igCaptionInput");
  const shareToFeedCheckbox = document.getElementById("igShareToFeed");
  const scheduleInput = document.getElementById("igScheduleInput");
  const publishStatus = document.getElementById("igPublishStatus");

  if (!connectBtn) return;

  const DEMO_IG_KEY = "viralreels_demo_ig_account";
  let currentIgUserId = null;

  function setStatus(msg, type) {
    if (!publishStatus) return;
    publishStatus.textContent = msg;
    publishStatus.className = "status-msg " + (type || "");
  }

  function showConnected(acc) {
    disconnectedBox.style.display = "none";
    connectedBox.style.display = "block";
    currentIgUserId = acc.igUserId || "demo_ig_id";
    accountUsername.textContent = "@" + (acc.username || "viralreels.ai");
    followersCount.textContent = Number(acc.followers || 0).toLocaleString();
    mediaCount.textContent = Number(acc.mediaCount || 0).toLocaleString();
    if (accountAvatar) {
      accountAvatar.textContent = (acc.username || "I").charAt(0).toUpperCase();
    }
    populateVideoDropdown();
  }

  function showDisconnected() {
    disconnectedBox.style.display = "block";
    connectedBox.style.display = "none";
    currentIgUserId = null;
  }

  function populateVideoDropdown() {
    if (!videoSelect) return;
    const videos = typeof window.getWorkspaceVideos === "function" ? window.getWorkspaceVideos() : [];
    if (!videos.length) {
      videoSelect.innerHTML = `<option value="">No videos in library yet</option>`;
      return;
    }
    videoSelect.innerHTML = videos
      .map((v) => `<option value="${v.title}">${v.title} (${v.status})</option>`)
      .join("");
  }

  async function checkInstagramConnection() {
    try {
      const res = await fetch("/api/instagram-account");
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          showConnected(data);
          return;
        }
      }
    } catch (_err) {
      // Demo fallback
    }

    const demoRaw = localStorage.getItem(DEMO_IG_KEY);
    if (demoRaw) {
      showConnected(JSON.parse(demoRaw));
    } else {
      showDisconnected();
    }
  }

  connectBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/instagram-auth?action=url");
      if (res.ok) {
        const data = await res.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
          return;
        }
      }
    } catch (_err) {
      // Demo fallback
    }

    const demoAcc = {
      connected: true,
      igUserId: "demo_ig_001",
      username: "viralreels.creator",
      followers: 8940,
      mediaCount: 27
    };
    localStorage.setItem(DEMO_IG_KEY, JSON.stringify(demoAcc));
    showConnected(demoAcc);
    if (typeof window.registerSocialConnection === "function") {
      await window.registerSocialConnection("instagram", "@" + demoAcc.username, demoAcc.followers);
    }
  });

  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/instagram-account", { method: "DELETE" });
      } catch (_err) {}
      localStorage.removeItem(DEMO_IG_KEY);
      showDisconnected();
    });
  }

  if (publishForm) {
    publishForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const videoTitle = videoSelect.value;
      if (!videoTitle) {
        setStatus("Create or select a video first.", "error");
        return;
      }

      const scheduledFor = scheduleInput.value ? new Date(scheduleInput.value).toISOString() : null;
      const caption = captionInput.value.trim();

      try {
        const res = await fetch("/api/instagram-publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            igUserId: currentIgUserId,
            videoTitle,
            caption,
            shareToFeed: shareToFeedCheckbox.checked,
            scheduledFor
          })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus(data.message || "Reel published!", "success");
        } else {
          throw new Error(data.error || "Demo fallback");
        }
      } catch (_err) {
        setStatus(
          scheduledFor
            ? `"${videoTitle}" scheduled for Instagram Reels (Demo Mode).`
            : `"${videoTitle}" queued for Instagram Reels publishing (Demo Mode).`,
          "success"
        );
      }

      if (scheduledFor && typeof window.addScheduledPostToWorkspace === "function") {
        await window.addScheduledPostToWorkspace(videoTitle, "Instagram Reels", scheduledFor);
      }
    });
  }

  checkInstagramConnection();
})();
