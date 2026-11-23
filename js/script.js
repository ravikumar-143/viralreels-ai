// ViralReels AI - Phase 1 Landing Page Interactions

(function () {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const nicheButtons = document.querySelectorAll(".niche-btn");
  const previewLabel = document.getElementById("previewNicheLabel");
  const previewScript = document.getElementById("previewScriptSample");

  const SAMPLES = {
    History: '"In 48 BC, one fire changed human history forever. The Great Library of Alexandria held hundreds of thousands of scrolls—and what survived is even more shocking..."',
    Mythology: '"Before Zeus ruled Olympus, the Titans waged a ten-year cosmic war. Here is the forgotten prophecy that almost ended the gods..."',
    Horror: '"At 2:14 AM, the lighthouse keeper logged one final entry: The fog is knocking on the glass from the outside—300 feet above the sea..."',
    Motivation: '"You do not need another year to change your life. You need 90 days of ruthless focus without telling anyone your next move..."'
  };

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  nicheButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      nicheButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const niche = btn.dataset.niche;
      if (previewLabel) previewLabel.textContent = `${niche} • 9:16 Shorts • 1080p`;
      if (previewScript && SAMPLES[niche]) previewScript.textContent = SAMPLES[niche];
    });
  });
})();
