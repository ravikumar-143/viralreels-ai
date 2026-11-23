// ViralReels AI - Phase 5 YouTube Channel Manager

(function () {
  const connectBtn = document.getElementById("ytConnectBtn");
  const disconnectBtn = document.getElementById("ytDisconnectBtn");
  const disconnectedBox = document.getElementById("ytDisconnectedBox");
  const connectedBox = document.getElementById("ytConnectedBox");

  const channelAvatar = document.getElementById("ytChannelAvatar");
  const channelName = document.getElementById("ytChannelName");
  const channelSubs = document.getElementById("ytSubsCount");
  const channelViews = document.getElementById("ytViewsCount");
  const channelVideos = document.getElementById("ytVideosCount");

  const uploadForm = document.getElementById("ytUploadForm");
  const videoSelect = document.getElementById("ytVideoSelect");
  const titleInput = document.getElementById("ytTitleInput");
  const descInput = document.getElementById("ytDescInput");
  const tagsInput = document.getElementById("ytTagsInput");
  const privacySelect = document.getElementById("ytPrivacySelect");
  const scheduleInput = document.getElementById("ytScheduleInput");
  const uploadStatus = document.getElementById("ytUploadStatus");

  if (!connectBtn) return;

  const DEMO_YT_KEY = "viralreels_demo_yt_channel";

  function setStatus(msg, type) {
    if (!uploadStatus) return;
    uploadStatus.textContent = msg;
    uploadStatus.className = "status-msg " + (type || "");
  }

  function showConnected(ch) {
    disconnectedBox.style.display = "none";
    connectedBox.style.display = "block";
    channelName.textContent = ch.title;
    channelSubs.textContent = Number(ch.subscribers || 0).toLocaleString();
    channelViews.textContent = Number(ch.views || 0).toLocaleString();
    channelVideos.textContent = Number(ch.videoCount || 0).toLocaleString();
    if (channelAvatar) {
      channelAvatar.textContent = (ch.title || "Y").charAt(0).toUpperCase();
    }
    populateVideoDropdown();
  }

  function showDisconnected() {
    disconnectedBox.style.display = "block";
    connectedBox.style.display = "none";
  }

  function populateVideoDropdown() {
    if (!videoSelect) return;
    const videos = typeof window.getWorkspaceVideos === "function" ? window.getWorkspaceVideos() : [];
    if (!videos.length) {
      videoSelect.innerHTML = `<option value="">No videos in library yet (create one in AI Video Generator)</option>`;
      return;
    }
    videoSelect.innerHTML = videos
      .map((v) => `<option value="${v.title}">${v.title} (${v.status})</option>`)
      .join("");
    if (titleInput && !titleInput.value && videos[0]) {
      titleInput.value = videos[0].title;
    }
  }

  if (videoSelect && titleInput) {
    videoSelect.addEventListener("change", () => {
      if (videoSelect.value) titleInput.value = videoSelect.value;
    });
  }

  async function checkYouTubeConnection() {
    try {
      const res = await fetch("/api/youtube-channel");
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          showConnected(data);
          return;
        }
      }
    } catch (_err) {
      // Fall back to demo connection state
    }

    const demoRaw = localStorage.getItem(DEMO_YT_KEY);
    if (demoRaw) {
      showConnected(JSON.parse(demoRaw));
    } else {
      showDisconnected();
    }
  }

  connectBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/youtube-auth?action=url");
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

    const demoChannel = {
      connected: true,
      title: "ViralReels Demo Channel",
      subscribers: 12400,
      views: 485200,
      videoCount: 34
    };
    localStorage.setItem(DEMO_YT_KEY, JSON.stringify(demoChannel));
    showConnected(demoChannel);
    if (typeof window.registerSocialConnection === "function") {
      await window.registerSocialConnection("youtube", demoChannel.title, demoChannel.subscribers);
    }
  });

  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/youtube-channel", { method: "DELETE" });
      } catch (_err) {}
      localStorage.removeItem(DEMO_YT_KEY);
      showDisconnected();
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        setStatus("Enter a video title.", "error");
        return;
      }

      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const publishAt = scheduleInput.value ? new Date(scheduleInput.value).toISOString() : null;

      try {
        const res = await fetch("/api/youtube-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: descInput.value.trim(),
            tags,
            privacyStatus: privacySelect.value,
            publishAt
          })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus(data.message || "Uploaded to YouTube!", "success");
        } else {
          throw new Error(data.error || "Demo fallback");
        }
      } catch (_err) {
        setStatus(
          publishAt
            ? `"${title}" scheduled for YouTube Shorts (Demo Mode).`
            : `"${title}" queued for YouTube upload (${privacySelect.value}, Demo Mode).`,
          "success"
        );
      }

      if (publishAt && typeof window.addScheduledPostToWorkspace === "function") {
        await window.addScheduledPostToWorkspace(title, "YouTube Shorts", publishAt);
      }
    });
  }

  window.refreshYouTubeDropdown = populateVideoDropdown;
  checkYouTubeConnection();
})();
