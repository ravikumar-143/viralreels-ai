// ViralReels AI - Phase 4 AI Video Generator (Serverless API + Demo Mode Fallback)

(function () {
  const topicInput = document.getElementById("studioTopic");
  const nicheSelect = document.getElementById("studioNiche");
  const durationSelect = document.getElementById("studioDuration");
  const ratioSelect = document.getElementById("studioRatio");
  const voiceSelect = document.getElementById("studioVoice");
  const musicSelect = document.getElementById("studioMusic");
  const captionsToggle = document.getElementById("studioCaptions");

  const genScriptBtn = document.getElementById("studioGenScriptBtn");
  const genVoiceBtn = document.getElementById("studioGenVoiceBtn");
  const renderVideoBtn = document.getElementById("studioRenderVideoBtn");

  const scriptTextarea = document.getElementById("studioScriptText");
  const scenesContainer = document.getElementById("studioScenesList");
  const audioContainer = document.getElementById("studioAudioContainer");
  const previewPhone = document.getElementById("studioPreviewPhone");
  const previewTag = document.getElementById("studioPreviewTag");
  const previewCaption = document.getElementById("studioPreviewCaption");
  const studioStatus = document.getElementById("studioStatus");

  // Standalone Script & Voice tabs
  const quickScriptBtn = document.getElementById("quickScriptBtn");
  const quickScriptTopic = document.getElementById("quickScriptTopic");
  const quickScriptNiche = document.getElementById("quickScriptNiche");
  const quickScriptOutput = document.getElementById("quickScriptOutput");

  const quickVoiceBtn = document.getElementById("quickVoiceBtn");
  const quickVoiceText = document.getElementById("quickVoiceText");
  const quickVoiceSelect = document.getElementById("quickVoiceSelect");
  const quickVoiceOutput = document.getElementById("quickVoiceOutput");

  if (!genScriptBtn) return;

  let currentScenes = [];
  let currentTitle = "";

  function setStatus(msg, type) {
    if (!studioStatus) return;
    studioStatus.textContent = msg;
    studioStatus.className = "status-msg " + (type || "");
  }

  function buildDemoScript(topic, niche) {
    return {
      title: topic.length > 48 ? topic.slice(0, 48) + "..." : topic,
      hook: `Most people have no idea what really happened with ${topic}.`,
      narration: `Most people have no idea what really happened with ${topic}. In the world of ${niche}, one overlooked detail changed everything. Historians and researchers spent decades piecing together the truth behind ${topic}. And the final revelation still leaves people speechless today.`,
      scenes: [
        { caption: `The untold story of ${topic}`, visualPrompt: `Cinematic moody ${niche} opening shot, dramatic lighting, 4k` },
        { caption: "An overlooked clue changed everything", visualPrompt: `Close-up atmospheric ${niche} artifact, golden rim light` },
        { caption: "Decades of mystery uncovered", visualPrompt: `Wide dramatic scene, volumetric fog, ultra detailed` },
        { caption: "Follow for part 2", visualPrompt: `Epic finale shot with glowing embers, dark aesthetic` }
      ]
    };
  }

  function renderScenes(scenes) {
    currentScenes = scenes || [];
    if (!scenesContainer) return;
    if (!currentScenes.length) {
      scenesContainer.innerHTML = "";
      return;
    }
    scenesContainer.innerHTML = currentScenes
      .map(
        (s, idx) => `
      <div class="scene-item">
        <strong>Scene ${idx + 1}: ${s.caption}</strong>
        <span>Visual: ${s.visualPrompt}</span>
      </div>`
      )
      .join("");
    if (previewCaption) {
      previewCaption.textContent = currentScenes[0].caption;
    }
  }

  if (ratioSelect && previewPhone) {
    ratioSelect.addEventListener("change", () => {
      previewPhone.classList.remove("ratio-16-9", "ratio-1-1");
      if (ratioSelect.value === "16:9") previewPhone.classList.add("ratio-16-9");
      if (ratioSelect.value === "1:1") previewPhone.classList.add("ratio-1-1");
    });
  }

  if (nicheSelect && previewTag) {
    nicheSelect.addEventListener("change", () => {
      previewTag.textContent = nicheSelect.value + " • 1080p";
    });
  }

  async function requestScript(topic, niche, durationSec) {
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche, durationSec })
      });
      if (!res.ok) throw new Error("Serverless API unavailable");
      return await res.json();
    } catch (_err) {
      return { ...buildDemoScript(topic, niche), _demoFallback: true };
    }
  }

  genScriptBtn.addEventListener("click", async () => {
    const topic = topicInput.value.trim();
    if (!topic) {
      setStatus("Enter a video topic first.", "error");
      return;
    }
    genScriptBtn.disabled = true;
    genScriptBtn.textContent = "Generating Script...";
    setStatus("Writing viral script...", "");

    const result = await requestScript(topic, nicheSelect.value, Number(durationSelect.value));
    currentTitle = result.title || topic;
    scriptTextarea.value = result.narration || "";
    renderScenes(result.scenes || []);

    genScriptBtn.disabled = false;
    genScriptBtn.textContent = "1. Generate AI Script";
    setStatus(
      result._demoFallback
        ? "Script generated in Demo Preview mode (deploy /api/generate-script with OPENAI_API_KEY for live GPT output)."
        : "AI script generated!",
      "success"
    );
  });

  genVoiceBtn.addEventListener("click", async () => {
    const text = scriptTextarea.value.trim();
    if (!text) {
      setStatus("Generate or type a script before creating voiceover.", "error");
      return;
    }
    genVoiceBtn.disabled = true;
    genVoiceBtn.textContent = "Generating Voice...";
    setStatus("Synthesizing AI voiceover...", "");

    try {
      const res = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceSelect.value })
      });
      if (!res.ok) throw new Error("Voice API unavailable");
      const data = await res.json();
      audioContainer.innerHTML = `<div class="audio-box"><strong>Voiceover Ready (${voiceSelect.value})</strong><audio controls src="${data.audioDataUrl}"></audio></div>`;
      setStatus("ElevenLabs voiceover ready!", "success");
    } catch (_err) {
      // Browser SpeechSynthesis preview fallback
      audioContainer.innerHTML = `<div class="audio-box"><strong>Demo Voice Preview</strong><p style="font-size:0.82rem;color:#94a3b8;margin-top:4px;">Deploy /api/generate-voice with ELEVENLABS_API_KEY for neural MP3 audio. <button type="button" id="speakDemoBtn" class="btn-secondary-sm" style="margin-top:8px;">Play Browser Voice Preview</button></p></div>`;
      const speakBtn = document.getElementById("speakDemoBtn");
      if (speakBtn && "speechSynthesis" in window) {
        speakBtn.addEventListener("click", () => {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        });
      }
      setStatus("Voice preview ready (Demo Mode).", "success");
    }

    genVoiceBtn.disabled = false;
    genVoiceBtn.textContent = "2. Generate AI Voice";
  });

  renderVideoBtn.addEventListener("click", async () => {
    const topic = topicInput.value.trim() || "Untitled Faceless Reel";
    const title = currentTitle || topic;
    if (!scriptTextarea.value.trim()) {
      setStatus("Please generate a script first.", "error");
      return;
    }

    renderVideoBtn.disabled = true;
    renderVideoBtn.textContent = "Rendering 1080p MP4...";
    setStatus("Assembling scenes, voiceover, and captions...", "");

    let finalStatus = "Ready";
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          niche: nicheSelect.value,
          aspectRatio: ratioSelect.value,
          scenes: currentScenes,
          captions: captionsToggle.checked,
          music: musicSelect.value
        })
      });
      if (res.ok) {
        const data = await res.json();
        finalStatus = data.status || "Ready";
      }
    } catch (_err) {
      // Demo fallback saves video to workspace library
    }

    if (typeof window.addGeneratedVideoToWorkspace === "function") {
      await window.addGeneratedVideoToWorkspace({
        title,
        niche: nicheSelect.value,
        aspect_ratio: ratioSelect.value,
        duration_sec: Number(durationSelect.value),
        status: finalStatus
      });
    }

    renderVideoBtn.disabled = false;
    renderVideoBtn.textContent = "3. Render 1080p MP4";
    setStatus(`"${title}" saved to My Videos (${finalStatus})!`, "success");
  });

  // Standalone Script tab
  if (quickScriptBtn) {
    quickScriptBtn.addEventListener("click", async () => {
      const topic = quickScriptTopic.value.trim();
      if (!topic) return;
      quickScriptBtn.disabled = true;
      quickScriptBtn.textContent = "Generating...";
      const data = await requestScript(topic, quickScriptNiche.value, 45);
      quickScriptOutput.value = data.narration || "";
      quickScriptBtn.disabled = false;
      quickScriptBtn.textContent = "Generate Script";
    });
  }

  // Standalone Voice tab
  if (quickVoiceBtn) {
    quickVoiceBtn.addEventListener("click", async () => {
      const text = quickVoiceText.value.trim();
      if (!text) return;
      quickVoiceBtn.disabled = true;
      quickVoiceBtn.textContent = "Synthesizing...";
      try {
        const res = await fetch("/api/generate-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: quickVoiceSelect.value })
        });
        if (!res.ok) throw new Error("Unavailable");
        const data = await res.json();
        quickVoiceOutput.innerHTML = `<audio controls src="${data.audioDataUrl}" style="width:100%;margin-top:10px;"></audio>`;
      } catch (_err) {
        quickVoiceOutput.innerHTML = `<p style="font-size:0.86rem;color:#fcd34d;margin-top:10px;">Serverless /api/generate-voice not active yet — using browser speech preview.</p>`;
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
      }
      quickVoiceBtn.disabled = false;
      quickVoiceBtn.textContent = "Generate Voiceover";
    });
  }
})();
