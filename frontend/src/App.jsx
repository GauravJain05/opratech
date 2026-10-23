import { useState, useEffect, useRef } from "react";

async function api(path, body) {
  const r = await fetch("/api" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (sessionStorage.getItem("t") || ""),
    },
    body: body && JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Something went wrong");
  return j;
}

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const mask = (p) => (p && p.length === 10 ? p.slice(0, 2) + "••••••" + p.slice(-2) : p || "—");

const ICONS = {
  Counter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  RFM: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  Lapsed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Campaigns: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  Enrichment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  ),
};

function Shell({ children, right, side }) {
  return (
    <>
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-badge">
            <img src="/logo.svg" alt="Cotton Junction Logo" />
          </div>
          <div className="brand-text">
            <h1>Cotton Junction</h1>
            <div className="sub">Counter Capture &amp; Customer Re-Engagement Engine</div>
          </div>
        </div>

        <div className="header-actions">
          {right}
        </div>
      </header>

      <div className={"app-layout" + (side ? "" : " single-col")}>
        {side}
        <main className="content-area">{children}</main>
      </div>
    </>
  );
}

function Login({ done }) {
  const [u, setU] = useState("manager");
  const [p, setP] = useState("manager123");
  const [err, setErr] = useState("");

  const go = async (ev) => {
    ev.preventDefault();
    try {
      const j = await api("/auth/login", { user: u, password: p });
      sessionStorage.setItem("t", j.token);
      sessionStorage.setItem("role", j.role);
      done(j.role);
    } catch (x) {
      setErr(x.message);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "60px auto", padding: "0 16px" }}>
      <form className="card" onSubmit={go}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="brand-badge" style={{ width: 64, height: 64, margin: "0 auto 12px" }}>
            <img src="/logo.svg" alt="Cotton Junction" style={{ width: 52, height: 52 }} />
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>Staff Sign In</h2>
          <p style={{ color: "var(--ink-500)", fontSize: 13 }}>
            Cotton Junction Counter &amp; CRM Management Portal
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Username</label>
          <input
            placeholder="Username (e.g. manager or cashier)"
            value={u}
            onChange={(ev) => setU(ev.target.value)}
            autoCapitalize="none"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 18 }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={p}
            onChange={(ev) => setP(ev.target.value)}
          />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", height: 48, fontSize: 16 }}>
          Sign in to Terminal
        </button>

        {err && <p style={{ color: "var(--rust-500)", fontWeight: 600, marginTop: 12, fontSize: 14 }}>{err}</p>}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--linen-200)", fontSize: 12, color: "var(--ink-500)" }}>
          <p><b>Quick Demo Credentials:</b></p>
          <p>• Manager: <code>manager</code> / <code>manager123</code> (All features &amp; campaigns)</p>
          <p>• Cashier: <code>cashier</code> / <code>cashier123</code> (Counter capture)</p>
        </div>
      </form>
    </div>
  );
}

const CATS = ["Men", "Women", "Kids", "Festive"];

function Counter({ onOpenReceiptDemo }) {
  const [phone, setPhone] = useState("");
  const [amt, setAmt] = useState("");
  const [field, setField] = useState("amount");
  const [consent, setConsent] = useState(false);
  const [hh, setHh] = useState(null);
  const [member, setMember] = useState("");
  const [cat, setCat] = useState("Men");
  const [secs, setSecs] = useState(null);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [isTabletView, setIsTabletView] = useState(false);

  const t0 = useRef(0);

  const toggleConsent = () => {
    if (consent) {
      setConsent(false);
      setPhone("");
      setField("amount");
      setSecs(null);
      setMember("");
      setHh(null);
    } else {
      setConsent(true);
      setField("phone");
    }
  };

  const press = (k) => {
    setRes(null);
    setErr("");
    const isP = field === "phone";
    const val = isP ? phone : amt;
    const set = isP ? setPhone : setAmt;

    if (k === "⌫") return set(val.slice(0, -1));
    if (k === "C") return set("");

    if (isP && !val && !"6789".includes(k)) {
      return setErr("Indian mobile numbers must start with 6, 7, 8 or 9");
    }
    if (val.length >= (isP ? 10 : 7)) return;

    const nv = val + k;
    if (isP) {
      if (!val) t0.current = performance.now();
      if (nv.length === 10) {
        setSecs(((performance.now() - t0.current) / 1000).toFixed(1));
        setField("amount");
      }
    }
    set(nv);
  };

  useEffect(() => {
    if (phone.length === 10) {
      api("/household/" + phone)
        .then((data) => {
          setHh(data);
          if (data.exists && data.members.length > 0 && !member) {
            // Leave member unselected or ready for cashier to confirm
          }
        })
        .catch(() => {});
    } else {
      setHh(null);
      setMember("");
      if (phone.length < 10) setSecs(null);
    }
  }, [phone]);

  const loadDemoHousehold = () => {
    setConsent(true);
    setPhone("9800000001");
    setSecs("1.8");
    setAmt("2450");
    setField("amount");
  };

  const mustPick = hh && hh.exists && !member.trim();
  const ready = amt && (!consent || phone.length === 10) && !mustPick;

  const sale = async () => {
    setErr("");
    try {
      const j = await api("/checkout", {
        phone,
        amount: +amt,
        consent,
        member_name: member,
        category: cat,
      });
      setRes({ ...j, who: member || (consent ? "Primary Shopper" : "Anonymous Customer"), phoneRecorded: phone });
      setPhone("");
      setAmt("");
      setMember("");
      setConsent(false);
      setField("amount");
      setHh(null);
      setSecs(null);
    } catch (x) {
      setErr(x.message);
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-block">
          <h2>1. Core Checkout &amp; Counter Capture</h2>
          <p>
            Ultra-fast customer intake in under 5 seconds with verbal consent compliance and household sub-profiles.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="btn btn-outline"
            onClick={() => setIsTabletView(!isTabletView)}
            style={{ fontSize: 13 }}
          >
            {isTabletView ? "💻 Standard POS View" : "📱 Tablet Bumper Mode"}
          </button>
          <button
            className="btn"
            style={{ background: "var(--forest-100)", color: "var(--forest-800)", borderColor: "var(--forest-600)", fontSize: 13 }}
            onClick={loadDemoHousehold}
          >
            ⚡ Load Demo Household (Rohan &amp; Meera)
          </button>
        </div>
      </div>

      <div className="counter-grid">
        {/* Left Column: Intake Controls & Household profile selection */}
        <div>
          {/* Verbal Privacy Consent Toggle */}
          <div
            className={"consent-banner" + (consent ? " granted" : "")}
            role="switch"
            aria-checked={consent}
            tabIndex={0}
            onClick={toggleConsent}
            onKeyDown={(e) => e.key === "Enter" && toggleConsent()}
          >
            <div className="consent-label">
              <div className="title">
                <span>Verbal Privacy Consent:</span>
                <span className="status-pill">{consent ? "YES (Opted In)" : "NO (Anonymous)"}</span>
              </div>
              <div className="sub">
                {consent
                  ? "✓ Customer agreed verbally: Mobile number will be safely stored for loyalty points & digital receipts."
                  : "Default: If customer declines or is in a hurry, sale stays 100% anonymous without slowing the queue."}
              </div>
            </div>
            <div className="switch-control">
              <i />
            </div>
          </div>

          {/* Active Field: Phone Number */}
          <div
            className={"pos-field-card" + (field === "phone" ? " active" : "")}
            onClick={() => consent && setField("phone")}
          >
            <div className="pos-field-meta">
              <span className="label">1. Customer Mobile Number</span>
              <span className="sub-note">
                {consent ? "10 digits (tap to edit)" : "Disabled (Consent is NO)"}
              </span>
            </div>
            <div className="pos-field-display">
              <span className={"digits" + (!phone ? " placeholder" : "")}>
                {phone
                  ? phone.length === 10
                    ? `${phone.slice(0, 5)}-${phone.slice(5)}`
                    : phone
                  : consent
                  ? "98765-XXXXX"
                  : "Anonymous Buyer"}
              </span>
              {secs && (
                <span className="speed-badge fast">
                  ⚡ {secs}s (<span style={{ fontWeight: 800 }}>&lt; 5s Target</span>)
                </span>
              )}
            </div>
          </div>

          {/* Active Field: Bill Amount */}
          <div
            className={"pos-field-card" + (field === "amount" ? " active" : "")}
            onClick={() => setField("amount")}
          >
            <div className="pos-field-meta">
              <span className="label">2. Bill Amount (INR)</span>
              <span className="sub-note">Enter amount for purchase history &amp; RFM</span>
            </div>
            <div className="pos-field-display">
              <span className={"digits" + (!amt ? " placeholder" : "")}>
                {amt ? inr(amt) : "₹0"}
              </span>
            </div>
          </div>

          {/* Category Chips (Optional fast tag) */}
          {consent && (
            <div className="category-row">
              <span className="label">Category:</span>
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"cat-chip" + (cat === c ? " selected" : "")}
                  onClick={() => setCat(cat === c ? "" : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Household Disambiguation Panel (Image 3 Feature) */}
          {hh && (
            <div className="household-box">
              <div className="household-box-header">
                <span className="title">
                  👥 Family Members on this Phone
                </span>
                <span className="badge">
                  {hh.exists ? `${hh.members.length} Existing Profiles` : "New Household"}
                </span>
              </div>

              {hh.exists && (
                <p style={{ fontSize: 13, color: "var(--ink-700)", marginBottom: 8 }}>
                  Who is making this purchase? <i>(Prevents mixing husband/wife/teen preferences)</i>:
                </p>
              )}

              <div className="household-members-grid">
                {hh.members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={"member-chip" + (member === m.name ? " selected" : "")}
                    onClick={() => setMember(m.name)}
                  >
                    <span className="role-dot" />
                    <span>{m.name}</span>
                    {m.days != null && (
                      <span className="last-seen">
                        · {m.days}d ago {m.days >= 60 ? "⚠️ (Lapsed)" : ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="member-input-row">
                <input
                  placeholder={
                    hh.exists
                      ? "Someone else in the family? Type name here..."
                      : "Shopper's Name (e.g. Amit, Priya, Dad)..."
                  }
                  value={member}
                  onChange={(e) => setMember(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sale confirmation banner */}
          {res && (
            <div className="sale-success-card">
              <div className="title">
                ✓ {res.anonymous ? "Anonymous sale recorded successfully!" : `Sale recorded for ${res.who}!`}
              </div>
              {!res.anonymous && res.link && (
                <div>
                  <div style={{ fontSize: 13, color: "#1e5c30", marginBottom: 6 }}>
                    📱 Automated SMS sent with digital receipt &amp; 50 bonus point profile enrichment link:
                  </div>
                  <div className="receipt-link-row">
                    <span className="receipt-url">{res.link}</span>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: "5px 12px" }}
                      onClick={() => onOpenReceiptDemo(res.link)}
                    >
                      Test Customer View ➜
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mustPick && amt && (
            <p style={{ color: "var(--rust-500)", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
              ⚠️ Please tap or enter which family member is shopping to keep purchase histories distinct.
            </p>
          )}

          {err && (
            <p style={{ color: "var(--rust-500)", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
              ⚠️ {err}
            </p>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%", height: 58, fontSize: 20 }}
            disabled={!ready}
            onClick={sale}
          >
            Complete Sale &amp; Print Bill
          </button>
        </div>

        {/* Right Column: Touch-Optimized Numeric Keypad */}
        <div className={isTabletView ? "tablet-frame" : ""}>
          {isTabletView && (
            <div className="tablet-header-tag">
              <span>Cotton Junction • Counter POS Tablet</span>
              <span>Battery 98% • WiFi Active</span>
            </div>
          )}

          <div className={isTabletView ? "tablet-screen" : "keypad-container"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--forest-900)" }}>
                TOUCH KEYPAD ({field === "phone" ? "Typing Phone" : "Typing Amount"})
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-500)" }}>Large 72px touch targets</span>
            </div>

            <div className="numpad-grid">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={
                    "numpad-btn" +
                    (k === "C" ? " clear-btn" : "") +
                    (k === "⌫" ? " back-btn" : "")
                  }
                  onClick={() => press(k)}
                  disabled={field === "phone" && !consent}
                >
                  {k}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-500)", textAlign: "center" }}>
              💡 Single tap switches between Mobile Number and Bill Amount.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Segments({ onOpenWhatsApp }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api("/segments").then(setData);
  }, []);

  if (!data) {
    return <p style={{ padding: 20 }}>Loading RFM Segmentation data...</p>;
  }

  const rows = data.rows
    .filter((r) => {
      if (filter === "All") return true;
      if (filter === "Lapsed 60+") return r.lapsed;
      return r.segment === filter;
    })
    .slice(0, 60);

  const vipRows = data.rows.filter((r) => r.segment === "VIP");
  const regularRows = data.rows.filter((r) => r.segment === "Regular");
  const inactiveRows = data.rows.filter((r) => r.segment === "Inactive");

  const avg = (arr, key) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + (b[key] || 0), 0) / arr.length) : 0;

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-block">
          <h2>3. Recency-Frequency-Monetary (RFM) Segmentation Engine</h2>
          <p>
            Visual analytics dashboard categorizing customers into VIPs, Regulars, and Inactive shoppers. Top 10% automatically tagged.
          </p>
        </div>
      </div>

      {/* 3 Overview Status Cards Matching Image 3 Panel 3 */}
      <div className="rfm-columns-grid">
        {/* Card 1: VIP Status */}
        <div className="rfm-card vip">
          <div className="rfm-badge-header">
            <span className="rfm-pill vip">★ VIP Status</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-600)" }}>Top 10% Tier</span>
          </div>

          <div>
            <div className="rfm-stat-number">{data.counts.VIP}</div>
            <div className="rfm-stat-label">High-value brand advocates</div>
          </div>

          <div className="rfm-meter-group">
            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How recently (Recency)</span>
                <span>Avg {avg(vipRows, "days")} days ago</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill vip" style={{ width: "88%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How often (Frequency)</span>
                <span>Avg {avg(vipRows, "freq")} visits</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill vip" style={{ width: "92%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How much (Monetary)</span>
                <span>Avg {inr(avg(vipRows, "spend"))}</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill vip" style={{ width: "95%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Regulars */}
        <div className="rfm-card regular">
          <div className="rfm-badge-header">
            <span className="rfm-pill regular">● Regulars</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate-600)" }}>Core Shoppers</span>
          </div>

          <div>
            <div className="rfm-stat-number">{data.counts.Regular}</div>
            <div className="rfm-stat-label">Steady walk-in family customers</div>
          </div>

          <div className="rfm-meter-group">
            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How recently (Recency)</span>
                <span>Avg {avg(regularRows, "days")} days ago</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill regular" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How often (Frequency)</span>
                <span>Avg {avg(regularRows, "freq")} visits</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill regular" style={{ width: "55%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How much (Monetary)</span>
                <span>Avg {inr(avg(regularRows, "spend"))}</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill regular" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="rfm-card inactive">
          <div className="rfm-badge-header">
            <span className="rfm-pill inactive">⊘ Inactive / Lapsed</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rust-600)" }}>60+ Days Absent</span>
          </div>

          <div>
            <div className="rfm-stat-number">{data.counts.Inactive}</div>
            <div className="rfm-stat-label">At-risk customers needing outreach</div>
          </div>

          <div className="rfm-meter-group">
            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>How recently (Absent)</span>
                <span>Avg {avg(inactiveRows, "days")} days since visit</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill inactive" style={{ width: "90%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>Prior spend at risk</span>
                <span>Avg {inr(avg(inactiveRows, "spend"))}</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill inactive" style={{ width: "45%" }} />
              </div>
            </div>

            <div className="rfm-meter-item">
              <div className="meter-labels">
                <span>Re-engagement Action</span>
                <span>Ready for WhatsApp message</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill inactive" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="table-filter-bar">
        {[
          ["All", `All Profiles (${data.rows.length})`],
          ["VIP", `★ VIP (${data.counts.VIP})`],
          ["Regular", `Regulars (${data.counts.Regular})`],
          ["Inactive", `Inactive (${data.counts.Inactive})`],
          ["Lapsed 60+", `Lapsed 60+ Days (${data.counts.lapsed})`],
        ].map(([k, label]) => (
          <button
            key={k}
            className={"filter-tab" + (filter === k ? " active" : "")}
            onClick={() => setFilter(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Modern Data Table */}
      <div className="data-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Segment Badge</th>
              <th>Days Since Visit</th>
              <th>Visits</th>
              <th>Total Spend</th>
              <th>R · F · M Quintiles</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="customer-name-cell">
                    <b>{r.name}</b>
                    <span style={{ color: "var(--ink-500)", fontSize: 13 }}>{mask(r.phone)}</span>
                    {r.shared > 1 && (
                      <span className="household-shared-tag">
                        Shared Phone ({r.shared})
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={"rfm-pill " + r.segment.toLowerCase()}>
                    {r.segment === "VIP" ? "★ VIP" : r.segment}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: r.days >= 60 ? 700 : 500, color: r.days >= 60 ? "var(--rust-500)" : "inherit" }}>
                    {r.days} days ago {r.days >= 60 ? "⚠️" : ""}
                  </span>
                </td>
                <td>{r.freq}</td>
                <td style={{ fontWeight: 700 }}>{inr(r.spend)}</td>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {r.r} · {r.f} · {r.m}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-whatsapp"
                    style={{ fontSize: 12, padding: "4px 10px", minHeight: 32 }}
                    onClick={() => onOpenWhatsApp(r)}
                  >
                    💬 WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const USUAL = { Men: "men's wear", Women: "women's wear", Kids: "kids' wear", Festive: "festive wear" };
const PROMPTS = {
  cotton: "Come see our fresh pure cotton arrivals and handloom fabrics.",
  festive: "Come see our latest festive and wedding collection.",
  usual: "Check out our latest seasonal arrivals.",
  "": "",
};

function LapsedList() {
  const [days, setDays] = useState(90);
  const [spend, setSpend] = useState(0);
  const [rows, setRows] = useState(null);
  const [pr, setPr] = useState("cotton");
  const [tpl, setTpl] = useState("Hi {name}, we miss you at Cotton Junction, Sudama Nagar. {prompt} Reply STOP to opt out.");

  useEffect(() => {
    api(`/lapsed?days=${days}&min_spend=${spend}`).then(setRows);
  }, [days, spend]);

  const text = (r) => {
    const p = pr === "usual" ? (r.cat ? "Come see our " + USUAL[r.cat] + "." : "") : PROMPTS[pr];
    return tpl.replace("{name}", r.name).replace("{prompt}", p).replace(/\s+/g, " ").trim();
  };

  const wa = (r) => `https://wa.me/91${r.phone}?text=${encodeURIComponent(text(r))}`;

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-block">
          <h2>3. Lapsed Customer Tracker &amp; WhatsApp Re-Engagement</h2>
          <p>
            Filter customers absent for 60+ or 90+ days. Click to launch ready-to-send WhatsApp messages with personalized cotton prompts.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label>Days Absent (≥ days)</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(+e.target.value || 0)}
            />
          </div>

          <div className="form-group">
            <label>Minimum Prior Spend (₹)</label>
            <input
              type="number"
              value={spend}
              onChange={(e) => setSpend(+e.target.value || 0)}
            />
          </div>

          <div className="form-group">
            <label>Seasonal / Cotton Product Prompt</label>
            <select value={pr} onChange={(e) => setPr(e.target.value)}>
              <option value="cotton">Pure Cotton Arrivals (Recommended)</option>
              <option value="festive">Festive &amp; Wedding Collection</option>
              <option value="usual">Their Usual Category</option>
              <option value="">No Product Pitch</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Personalized WhatsApp Message Template</label>
          <textarea
            rows={2}
            value={tpl}
            onChange={(e) => setTpl(e.target.value)}
          />
        </div>

        {rows && rows[0] && (
          <div className="sale-success-card" style={{ background: "var(--linen-100)", borderColor: "var(--linen-300)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--forest-900)" }}>
              💬 Live Message Preview for {rows[0].name}:
            </span>
            <div style={{ fontStyle: "italic", fontSize: 14, color: "var(--ink-700)" }}>
              "{text(rows[0])}"
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 20, marginBottom: 12 }}>
        {rows ? rows.length : "…"} Lapsed Shoppers Absent for {days}+ Days
      </h3>

      <div className="data-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Last Visit</th>
              <th>Usual Category</th>
              <th>Total Spend</th>
              <th>Re-Engagement Action</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).slice(0, 50).map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.name}</b> <span style={{ color: "var(--ink-500)", fontSize: 13 }}>{mask(r.phone)}</span>
                  {r.shared > 1 && (
                    <span className="household-shared-tag" style={{ marginLeft: 6 }}>
                      shared ({r.shared})
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ color: "var(--rust-500)", fontWeight: 700 }}>
                    {r.days} days ago
                  </span>
                </td>
                <td>{r.cat || "Various"}</td>
                <td style={{ fontWeight: 700 }}>{inr(r.spend)}</td>
                <td>
                  <a
                    className="btn btn-whatsapp"
                    style={{ fontSize: 12, padding: "5px 12px", textDecoration: "none" }}
                    href={wa(r)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open WhatsApp ➜
                  </a>
                </td>
              </tr>
            ))}
            {rows && !rows.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--ink-500)" }}>
                  No shoppers match this threshold. Try lowering the absent days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Campaigns() {
  const [preset, setPreset] = useState("lapsed_3k");
  const [minDays, setMinDays] = useState(60);
  const [minSpend, setMinSpend] = useState(3000);
  const [segment, setSegment] = useState("");
  const [previewData, setPreviewData] = useState({ count: 0, sample: [] });
  const [text, setText] = useState(
    "Hi {name}, we miss you at Cotton Junction! Enjoy flat 20% off pure cotton kurtas and shirts on your next visit to Sudama Nagar branch. Reply STOP to opt out."
  );
  const [sentCount, setSentCount] = useState(null);
  const [messagesLog, setMessagesLog] = useState([]);

  const PRESETS = {
    lapsed_3k: {
      name: "Lapsed shoppers (60+ days) who spent >₹3,000",
      days: 60,
      spend: 3000,
      seg: "",
      txt: "Hi {name}, we miss you at Cotton Junction! Get 20% off your next visit to Sudama Nagar branch. Reply STOP to opt out.",
    },
    lapsed_90d: {
      name: "Critical: Absent for 90+ days",
      days: 90,
      spend: 0,
      seg: "",
      txt: "Hi {name}, it's been over 3 months since your last visit to Cotton Junction! Come check out our new handloom arrivals. Reply STOP to opt out.",
    },
    vip_lapsed: {
      name: "VIP Members absent for >45 days",
      days: 45,
      spend: 5000,
      seg: "VIP",
      txt: "Hi {name}, as a VIP member of Cotton Junction, we've reserved an exclusive 500 bonus points for your next visit! Reply STOP to opt out.",
    },
  };

  const handlePresetChange = (key) => {
    setPreset(key);
    if (PRESETS[key]) {
      setMinDays(PRESETS[key].days);
      setMinSpend(PRESETS[key].spend);
      setSegment(PRESETS[key].seg);
      setText(PRESETS[key].txt);
    }
  };

  const runPreview = () => {
    api("/campaigns/preview", {
      min_days: minDays,
      min_spend: minSpend,
      segment: segment || undefined,
    })
      .then(setPreviewData)
      .catch(() => {});
  };

  useEffect(() => {
    runPreview();
  }, [minDays, minSpend, segment]);

  useEffect(() => {
    api("/messages").then(setMessagesLog).catch(() => {});
  }, [sentCount]);

  const dispatch = async () => {
    try {
      const res = await api("/campaigns/send", {
        min_days: minDays,
        min_spend: minSpend,
        segment: segment || undefined,
        text,
      });
      setSentCount(res.sent);
      setTimeout(() => setSentCount(null), 5000);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title-block">
          <h2>5. Targeted Re-Engagement Campaign Generator</h2>
          <p>
            Build, preview, and dispatch personalized discount campaigns directly to lapsed shoppers without running a complex e-commerce store.
          </p>
        </div>
      </div>

      <div className="campaign-builder-grid">
        {/* Left Form: Query & Message Composer */}
        <div className="campaign-form-card">
          <div className="form-group">
            <label>Target Audience Preset</label>
            <select value={preset} onChange={(e) => handlePresetChange(e.target.value)}>
              <option value="lapsed_3k">
                ★ Lapsed shoppers (60+ days) who spent &gt;₹3,000 (Reference Spec)
              </option>
              <option value="lapsed_90d">Critical Lapsed: Absent 90+ Days</option>
              <option value="vip_lapsed">VIP Members absent &gt;45 days</option>
              <option value="custom">Custom Filter Query</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Min Days Absent</label>
              <input
                type="number"
                value={minDays}
                onChange={(e) => setMinDays(+e.target.value || 0)}
              />
            </div>
            <div className="form-group">
              <label>Min Prior Spend (₹)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(+e.target.value || 0)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Promotional SMS / WhatsApp Text (Use {"{name}"} for customer name)</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ height: 48, fontSize: 16 }}
            onClick={dispatch}
            disabled={previewData.count === 0}
          >
            🚀 Dispatch Campaign to {previewData.count} Customers
          </button>

          {sentCount !== null && (
            <div className="sale-success-card">
              <span className="title">✓ Successfully dispatched campaign to {sentCount} customers!</span>
              <span style={{ fontSize: 13, color: "var(--forest-900)" }}>
                Messages are logged in the simulated outbound gateway.
              </span>
            </div>
          )}
        </div>

        {/* Right Panel: Audience Stats & Live Mobile SMS Mockup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="audience-preview-card">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--forest-800)", marginBottom: 4 }}>
              Matched Audience Size
            </div>
            <div className="audience-count-number">{previewData.count} Target Shoppers</div>
            <div style={{ fontSize: 13, color: "var(--ink-700)", marginTop: 6 }}>
              Sample Recipients: {previewData.sample.join(", ") || "None"}
            </div>
          </div>

          <div className="sms-preview-phone">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--forest-900)", textTransform: "uppercase" }}>
              📱 Live Customer SMS / WhatsApp Preview
            </div>
            <div className="sms-bubble">
              {text.replace("{name}", previewData.sample[0] || "Priya")}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 8 }}>
              Each shopper receives a personalized text greeting them by their individual family profile name.
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Campaign History Log */}
      {messagesLog.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>Outbound Dispatch Gateway Log (Recent 10)</h3>
          <div className="data-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Recipient</th>
                  <th>Kind</th>
                  <th>Delivered Message Content</th>
                </tr>
              </thead>
              <tbody>
                {messagesLog.slice(0, 10).map((m, i) => (
                  <tr key={i}>
                    <td>{m.at}</td>
                    <td>{mask(m.phone)}</td>
                    <td><span className="household-shared-tag">{m.kind}</span></td>
                    <td style={{ fontSize: 13, maxWidth: 450, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptEnrichmentView({ demoToken, onBack }) {
  const [token, setToken] = useState(demoToken || "");
  const [ok, setOk] = useState(true);
  const [f, setF] = useState({ name: "Priya Sharma", birthday: "1994-08-14", anniversary: "2019-11-20" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    try {
      if (token && token.length > 10) {
        const res = await api("/receipt/" + token, f);
        setDone(res);
      } else {
        // Simulated instant demo response
        setDone({ bonus: 50 });
      }
    } catch (x) {
      setErr(x.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      {onBack && (
        <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back to Terminal
        </button>
      )}

      <div className="page-header-row">
        <div className="page-title-block">
          <h2>2. Post-Purchase Profile Enrichment Flow</h2>
          <p>
            Customers receive an automated SMS with a receipt link. Clicking it opens this warm, non-intrusive mobile form to collect birthdays and anniversaries in exchange for 50 bonus loyalty points.
          </p>
        </div>
      </div>

      <div className="phone-mockup-frame">
        <div className="phone-notch" />

        <div className="enrichment-banner">
          <span className="bonus-pill">🎁 50 Bonus Points</span>
          <h3>Earn 50 Bonus Points</h3>
          <p>
            Complete your Cotton Junction profile to unlock exclusive birthday discounts and personalized cotton picks!
          </p>
        </div>

        {done ? (
          <div className="sale-success-card" style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div className="title" style={{ justifyContent: "center" }}>Rewards Claimed!</div>
            <p style={{ fontSize: 13, color: "var(--forest-900)", marginTop: 6 }}>
              {done.bonus} bonus points have been added to your household account for your next visit.
            </p>
          </div>
        ) : (
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                required
                placeholder="e.g. Priya Sharma"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Birthday (For birthday discount)</label>
              <input
                type="date"
                value={f.birthday}
                onChange={(e) => setF({ ...f, birthday: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Anniversary (Optional)</label>
              <input
                type="date"
                value={f.anniversary}
                onChange={(e) => setF({ ...f, anniversary: e.target.value })}
              />
            </div>

            {err && <p style={{ color: "var(--rust-500)", fontSize: 13 }}>{err}</p>}

            <button className="btn btn-primary" style={{ width: "100%", height: 48, marginTop: 8 }}>
              Claim Rewards &amp; Save Details
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const path = location.pathname;
  const [role, setRole] = useState(sessionStorage.getItem("role") || "");
  const [tab, setTab] = useState("Counter");
  const [simulatedReceiptToken, setSimulatedReceiptToken] = useState(null);

  if (path.startsWith("/r/")) {
    return (
      <Shell>
        <ReceiptEnrichmentView demoToken={path.slice(3)} />
      </Shell>
    );
  }

  if (!role) {
    return (
      <Shell>
        <Login done={setRole} />
      </Shell>
    );
  }

  const tabs =
    role === "manager"
      ? [
          { id: "Counter", label: "1. Core Checkout", icon: ICONS.Counter },
          { id: "Segments", label: "2. RFM Segmentation", icon: ICONS.RFM },
          { id: "Lapsed", label: "3. Lapsed Customers", icon: ICONS.Lapsed },
          { id: "Campaigns", label: "4. Campaign Generator", icon: ICONS.Campaigns },
          { id: "Enrichment", label: "5. Profile Enrichment", icon: ICONS.Enrichment },
        ]
      : [{ id: "Counter", label: "1. Core Checkout", icon: ICONS.Counter }];

  const right = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="role-tag">{role === "manager" ? "Manager" : "Cashier"}</span>
      <button
        className="header-btn"
        onClick={() => {
          sessionStorage.clear();
          setRole("");
        }}
      >
        Sign Out
      </button>
    </div>
  );

  const side = (
    <aside className="sidebar">
      <div className="nav-heading">Store Navigation</div>
      {tabs.map((t) => (
        <button
          key={t.id}
          className={"nav-link" + (tab === t.id ? " active" : "")}
          onClick={() => {
            setTab(t.id);
            setSimulatedReceiptToken(null);
          }}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}

      <div className="sidebar-footer">
        <div className="store-meta">
          Store: <b>Sudama Nagar Branch</b>
        </div>
        <div className="store-meta">
          Status: <span style={{ color: "#54d37a", fontWeight: 700 }}>● Online</span>
        </div>
      </div>
    </aside>
  );

  const handleOpenReceiptDemo = (url) => {
    const parts = url.split("/r/");
    if (parts.length > 1) {
      setSimulatedReceiptToken(parts[1]);
    }
    setTab("Enrichment");
  };

  const handleOpenWhatsAppFromRFM = (customer) => {
    const msg = `Hi ${customer.name}, we miss you at Cotton Junction, Sudama Nagar! Come see our pure cotton picks. Reply STOP to opt out.`;
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Shell right={right} side={side}>
      {tab === "Counter" && <Counter onOpenReceiptDemo={handleOpenReceiptDemo} />}
      {tab === "Segments" && <Segments onOpenWhatsApp={handleOpenWhatsAppFromRFM} />}
      {tab === "Lapsed" && <LapsedList />}
      {tab === "Campaigns" && <Campaigns />}
      {tab === "Enrichment" && (
        <ReceiptEnrichmentView
          demoToken={simulatedReceiptToken}
          onBack={() => setTab("Counter")}
        />
      )}
    </Shell>
  );
}