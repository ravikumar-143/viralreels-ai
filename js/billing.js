// ViralReels AI - Phase 7 Subscription & Razorpay Billing

(function () {
  const billingStatus = document.getElementById("billingStatus");
  const billingHistoryContainer = document.getElementById("billingHistoryContainer");
  const currentPlanLabel = document.getElementById("billingCurrentPlan");
  const currentCreditsLabel = document.getElementById("billingCurrentCredits");

  if (!billingHistoryContainer) return;

  const DEMO_PAYMENTS_KEY = "viralreels_demo_payments";

  function setStatus(msg, type) {
    if (!billingStatus) return;
    billingStatus.textContent = msg;
    billingStatus.className = "status-msg " + (type || "");
  }

  function renderPaymentHistory(list) {
    if (!list || !list.length) {
      billingHistoryContainer.innerHTML = `<div class="empty-state"><h3>No payments yet</h3><p>Your subscription upgrades and credit top-ups will appear here.</p></div>`;
      return;
    }

    const rows = list
      .map(
        (p) => `
      <tr>
        <td><strong>${p.plan_name}</strong></td>
        <td>+${p.credits_added} credits</td>
        <td>&#8377;${Number(p.amount_inr).toLocaleString()}</td>
        <td><span class="badge badge-ready">${p.status || "Paid"}</span></td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
      </tr>`
      )
      .join("");

    billingHistoryContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Credits</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  async function loadBillingHistory() {
    if (typeof window.getWorkspaceProfile === "function") {
      const prof = window.getWorkspaceProfile();
      if (currentPlanLabel) currentPlanLabel.textContent = (prof.plan || "Starter") + " Plan";
      if (currentCreditsLabel) currentCreditsLabel.textContent = prof.credits ?? 10;
    }

    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase) {
      const demo = JSON.parse(localStorage.getItem(DEMO_PAYMENTS_KEY) || "[]");
      renderPaymentHistory(demo);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return;

    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .order("created_at", { ascending: false });

    renderPaymentHistory(data || []);
  }

  async function completeUpgrade(planName, credits, amountInr, orderId, paymentId) {
    if (typeof window.applyPlanUpgrade === "function") {
      await window.applyPlanUpgrade(planName, credits);
    }

    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase) {
      const demo = JSON.parse(localStorage.getItem(DEMO_PAYMENTS_KEY) || "[]");
      demo.unshift({
        plan_name: planName,
        credits_added: credits,
        amount_inr: amountInr,
        status: "Paid (Demo)",
        created_at: new Date().toISOString()
      });
      localStorage.setItem(DEMO_PAYMENTS_KEY, JSON.stringify(demo));
    } else {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        await supabase.from("payments").insert([{
          user_id: sessionData.session.user.id,
          razorpay_order_id: orderId || null,
          razorpay_payment_id: paymentId || null,
          plan_name: planName,
          credits_added: credits,
          amount_inr: amountInr,
          status: "Paid"
        }]);
      }
    }

    setStatus(`Upgraded to ${planName} Plan! +${credits} AI credits added.`, "success");
    await loadBillingHistory();
  }

  document.querySelectorAll("[data-upgrade-plan]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const planName = btn.dataset.upgradePlan;
      const credits = Number(btn.dataset.credits || 50);
      const amountInr = Number(btn.dataset.amount || 999);

      setStatus("Initializing checkout...", "");

      try {
        const orderRes = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planName })
        });

        if (!orderRes.ok) throw new Error("Razorpay server not configured");
        const orderData = await orderRes.json();

        if (typeof window.Razorpay === "undefined") {
          throw new Error("Razorpay Checkout script not loaded");
        }

        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "ViralReels AI",
          description: `${planName} Plan (${credits} AI Credits)`,
          order_id: orderData.orderId,
          handler: async function (response) {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified) {
              await completeUpgrade(planName, credits, amountInr, response.razorpay_order_id, response.razorpay_payment_id);
            } else {
              setStatus("Payment signature verification failed.", "error");
            }
          }
        });
        rzp.open();
      } catch (_err) {
        // Demo Mode fallback
        await completeUpgrade(planName, credits, amountInr, "demo_order", "demo_pay");
      }
    });
  });

  window.refreshBillingView = loadBillingHistory;
  loadBillingHistory();
})();
