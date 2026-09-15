import { useEffect, useMemo, useState } from "react";

const initialClaims = [
  {
    id: 1,
    text: "SHOCKING! This new health drink can cure every disease. Share before deleted!",
    platform: "WhatsApp",
    category: "Health",
    source: "",
    status: "Unverified",
    note: "",
    submittedAt: "15 Sep 2026, 10:30 AM",
  },
  {
    id: 2,
    text: "Government announces a new financial scheme for students.",
    platform: "X",
    category: "Finance",
    source: "https://example.com",
    status: "Verified True",
    note: "The information was checked against the available source.",
    submittedAt: "15 Sep 2026, 09:15 AM",
  },
];

function getFlags(claimText, source) {
  const flags = [];

  const lowerText = claimText.toLowerCase();

  if (
    lowerText.includes("breaking") ||
    lowerText.includes("shocking") ||
    lowerText.includes("share before deleted")
  ) {
    flags.push("Sensational");
  }

  let letters = 0;
  let capitals = 0;

  for (let i = 0; i < claimText.length; i++) {
    const ch = claimText[i];

    if (ch >= "A" && ch <= "Z") {
      capitals++;
      letters++;
    } else if (ch >= "a" && ch <= "z") {
      letters++;
    }
  }

  if (letters > 0 && capitals / letters > 0.5) {
    flags.push("Shouting");
  }

  if (!source || source.trim() === "") {
    flags.push("Unsourced");
  }

  return flags;
}

function formatDate() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem("truthlens_claims");

    if (saved) {
      return JSON.parse(saved);
    }

    return initialClaims;
  });

  const [page, setPage] = useState("feed");
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    text: "",
    platform: "WhatsApp",
    category: "Politics",
    source: "",
  });

  const [reviewStatus, setReviewStatus] = useState("Unverified");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    localStorage.setItem("truthlens_claims", JSON.stringify(claims));
  }, [claims]);

  const getClaimFlags = (claim) => {
    return getFlags(claim.text, claim.source);
  };

  const getRisk = (claim) => {
    const flags = getClaimFlags(claim);

    if (flags.length >= 2) {
      return "High Risk";
    }

    if (flags.length === 1) {
      return "Medium Risk";
    }

    return "Low Risk";
  };

  const filteredClaims = useMemo(() => {
    let result = [...claims];

    if (categoryFilter !== "All") {
      result = result.filter(
        (claim) => claim.category === categoryFilter
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (claim) => claim.status === statusFilter
      );
    }

    const riskValue = {
      "High Risk": 3,
      "Medium Risk": 2,
      "Low Risk": 1,
    };

    result.sort((a, b) => {
      return riskValue[getRisk(b)] - riskValue[getRisk(a)];
    });

    return result;
  }, [claims, categoryFilter, statusFilter]);

  function submitClaim(e) {
    e.preventDefault();

    if (!form.text.trim()) {
      alert("Please enter a claim.");
      return;
    }

    const newClaim = {
      id: Date.now(),
      text: form.text.trim(),
      platform: form.platform,
      category: form.category,
      source: form.source.trim(),
      status: "Unverified",
      note: "",
      submittedAt: formatDate(),
    };

    setClaims((prev) => [newClaim, ...prev]);

    setForm({
      text: "",
      platform: "WhatsApp",
      category: "Politics",
      source: "",
    });

    setPage("feed");
  }

  function openClaim(claim) {
    setSelectedClaim(claim);
    setReviewStatus(claim.status);
    setReviewNote(claim.note || "");
    setPage("detail");
  }

  function saveReview() {
    if (!selectedClaim) return;

    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === selectedClaim.id
          ? {
              ...claim,
              status: reviewStatus,
              note: reviewNote,
            }
          : claim
      )
    );

    const updatedClaim = {
      ...selectedClaim,
      status: reviewStatus,
      note: reviewNote,
    };

    setSelectedClaim(updatedClaim);

    alert("Review saved successfully!");
  }

  function resetDemoData() {
    localStorage.removeItem("truthlens_claims");
    setClaims(initialClaims);
    setPage("feed");
  }

  return (
    <div className="app">
      <header className="navbar">
        <div
          className="logo"
          onClick={() => setPage("feed")}
        >
          <div className="logoIcon">✓</div>
          <div>
            <h1>TruthLens</h1>
            <span>Misinformation Triage</span>
          </div>
        </div>

        <div className="navButtons">
          <button
            className={page === "feed" ? "navActive" : ""}
            onClick={() => setPage("feed")}
          >
            Public Feed
          </button>

          <button
            className={page === "submit" ? "navActive" : ""}
            onClick={() => setPage("submit")}
          >
            + Submit Claim
          </button>
        </div>
      </header>

      <main className="container">
        {page === "feed" && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">CIVIC TECHNOLOGY</p>
                <h2>See the claim.<br />Check the risk.</h2>
                <p className="heroText">
                  TruthLens helps newsrooms and citizen groups
                  triage viral claims quickly and transparently.
                </p>

                <button
                  className="primaryButton"
                  onClick={() => setPage("submit")}
                >
                  Submit a Claim →
                </button>
              </div>

              <div className="heroCard">
                <div className="shield">✓</div>
                <h3>Neutral by design</h3>
                <p>
                  We check information, not ideologies.
                  Every claim starts as unverified.
                </p>
              </div>
            </section>

            <section className="feedSection">
              <div className="sectionHeader">
                <div>
                  <p className="eyebrow">LIVE CLAIMS</p>
                  <h2>Public Feed</h2>
                </div>

                <button
                  className="resetButton"
                  onClick={resetDemoData}
                >
                  Reset Demo
                </button>
              </div>

              <div className="filters">
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                >
                  <option value="All">All Categories</option>
                  <option value="Politics">Politics</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">All Statuses</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Verified True">
                    Verified True
                  </option>
                  <option value="False">False</option>
                  <option value="Misleading">Misleading</option>
                </select>

                <span className="orderInfo">
                  High risk first
                </span>
              </div>

              <div className="claims">
                {filteredClaims.length === 0 ? (
                  <div className="empty">
                    No claims found.
                  </div>
                ) : (
                  filteredClaims.map((claim) => {
                    const flags = getClaimFlags(claim);
                    const risk = getRisk(claim);

                    return (
                      <article className="claimCard" key={claim.id}>
                        <div className="claimTop">
                          <div className="badges">
                            <span className="categoryBadge">
                              {claim.category}
                            </span>

                            <span
                              className={`riskBadge ${risk
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {risk}
                            </span>

                            <span
                              className={`statusBadge ${claim.status
                                .toLowerCase()
                                .replaceAll(" ", "-")}`}
                            >
                              {claim.status}
                            </span>
                          </div>

                          <span className="time">
                            {claim.submittedAt}
                          </span>
                        </div>

                        <h3>{claim.text}</h3>

                        <div className="claimMeta">
                          <span>● {claim.platform}</span>

                          {flags.length > 0 && (
                            <span>
                              ⚠ {flags.join(" • ")}
                            </span>
                          )}
                        </div>

                        <button
                          className="viewButton"
                          onClick={() => openClaim(claim)}
                        >
                          View Details →
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}

        {page === "submit" && (
          <section className="formPage">
            <button
              className="backButton"
              onClick={() => setPage("feed")}
            >
              ← Back to Feed
            </button>

            <div className="formHeader">
              <p className="eyebrow">NEW CLAIM</p>
              <h2>Submit a Claim</h2>
              <p>
                Add a viral claim for risk triage and review.
              </p>
            </div>

            <form onSubmit={submitClaim} className="claimForm">
              <label>
                Claim Text
                <textarea
                  placeholder="Paste the viral post or claim here..."
                  value={form.text}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      text: e.target.value,
                    })
                  }
                  rows="7"
                />
              </label>

              <div className="twoColumns">
                <label>
                  Source Platform
                  <select
                    value={form.platform}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        platform: e.target.value,
                      })
                    }
                  >
                    <option>WhatsApp</option>
                    <option>X</option>
                    <option>Instagram</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                  >
                    <option>Politics</option>
                    <option>Health</option>
                    <option>Finance</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <label>
                Source URL
                <input
                  type="url"
                  placeholder="https://example.com/source"
                  value={form.source}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      source: e.target.value,
                    })
                  }
                />
                <small>
                  Leave empty if the claim has no source link.
                </small>
              </label>

              <div className="infoBox">
                <strong>Automatic risk analysis</strong>
                <p>
                  TruthLens will check for sensational language,
                  excessive capital letters, and missing source links.
                </p>
              </div>

              <button className="primaryButton submitButton">
                Submit Claim
              </button>
            </form>
          </section>
        )}

        {page === "detail" && selectedClaim && (
          <section className="detailPage">
            <button
              className="backButton"
              onClick={() => setPage("feed")}
            >
              ← Back to Feed
            </button>

            <div className="detailHeader">
              <div>
                <p className="eyebrow">CLAIM DETAIL</p>
                <h2>Review Claim</h2>
              </div>

              <span
                className={`largeStatus ${selectedClaim.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {selectedClaim.status}
              </span>
            </div>

            <div className="detailGrid">
              <div>
                <div className="detailCard">
                  <div className="detailLabels">
                    <span>{selectedClaim.platform}</span>
                    <span>{selectedClaim.category}</span>
                    <span>{selectedClaim.submittedAt}</span>
                  </div>

                  <h3>Claim</h3>

                  <p className="fullClaim">
                    {selectedClaim.text}
                  </p>

                  {selectedClaim.source && (
                    <div className="source">
                      <strong>Source:</strong>{" "}
                      <a
                        href={selectedClaim.source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selectedClaim.source}
                      </a>
                    </div>
                  )}
                </div>

                <div className="detailCard">
                  <h3>Risk Analysis</h3>

                  <div className="riskSummary">
                    <strong>{getRisk(selectedClaim)}</strong>
                    <span>
                      {getClaimFlags(selectedClaim).length} flag(s)
                    </span>
                  </div>

                  <div className="flagList">
                    {getClaimFlags(selectedClaim).length === 0 ? (
                      <div className="noFlags">
                        ✓ No automatic risk flags detected.
                      </div>
                    ) : (
                      getClaimFlags(selectedClaim).map((flag) => (
                        <div className="flag" key={flag}>
                          <span>⚠</span>
                          <div>
                            <strong>{flag}</strong>

                            <p>
                              {flag === "Sensational" &&
                                "Contains attention-grabbing phrases such as breaking or shocking."}

                              {flag === "Shouting" &&
                                "More than 50% of alphabetic characters are capital letters."}

                              {flag === "Unsourced" &&
                                "No source link was provided with the claim."}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="reviewCard">
                <p className="eyebrow">REVIEW WORKFLOW</p>
                <h3>Reviewer Decision</h3>

                <label>
                  Status
                  <select
                    value={reviewStatus}
                    onChange={(e) =>
                      setReviewStatus(e.target.value)
                    }
                  >
                    <option>Unverified</option>
                    <option>Verified True</option>
                    <option>False</option>
                    <option>Misleading</option>
                  </select>
                </label>

                <label>
                  Reviewer Note
                  <textarea
                    rows="8"
                    placeholder="Write a short explanation..."
                    value={reviewNote}
                    onChange={(e) =>
                      setReviewNote(e.target.value)
                    }
                  />
                </label>

                <button
                  className="primaryButton"
                  onClick={saveReview}
                >
                  Save Review
                </button>

                <div className="decisionBox">
                  <strong>Editing policy</strong>
                  <p>
                    Submitted claim text cannot be edited.
                    Corrections should be submitted as a new claim.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <div>
          <strong>TruthLens</strong>
          <span>Neutral misinformation triage</span>
        </div>

        <span>Built for Code2Career · Track 2</span>
      </footer>
    </div>
  );
}

export default App;