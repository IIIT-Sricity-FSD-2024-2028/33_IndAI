import Reveal from "../components/Reveal";
import React from "react";
export default function Home({
  slots = {},
  form = {},
  onField = () => {},
  onAction = () => {},
  tab = "",
  step = 1,
  faq = null,
  mobileOpen = false,
  busy = false,
  error = "",
  showPassword = false,
}) {
  return (
    <>
      <nav className="landing-nav">
        <a href="#" className="brand">
          <div className="nav-logo blue">
            <svg viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          {"\n      IndAI\n    "}
        </a>
        <button
          type="button"
          className="btn btn-secondary btn-sm home-menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls="home-nav-links"
          onClick={() => onAction("toggleMobileMenu()")}
        >
          Menu
        </button>
        <div
          id="home-nav-links"
          className={"nav-links" + (mobileOpen ? " is-open" : "")}
          onClick={() => onAction("closeMobileMenu()")}
        >
          <a href="#" className="active">
            {"Home"}
          </a>
          <a href="#how-it-works">{"How It Works"}</a>
          <a href="#pricing">{"Plans"}</a>
          <a href="#faq">{"FAQ"}</a>
          <a href="#about">{"About Us"}</a>
          <a href="#contact">{"Contact Us"}</a>
        </div>
        <a href="/login.html" className="btn btn-primary btn-sm">
          {"Login"}
        </a>
      </nav>
      <div className="hero-wrapper">
        <div className="hero">
          <div>
            <div className="hero-tag">
              <svg viewBox="0 0 24 24">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              {"\n          Educational Paper Trading Platform\n        "}
            </div>
            <h1>
              {"Learn Trading Without"}
              <br />
              <span>{"Risking Real Money"}</span>
            </h1>
            <p>
              {
                "IndAI empowers young learners to master financial markets through risk-free paper trading, interactive challenges, and expert guidance. Build real-world trading skills in a safe, educational environment."
              }
            </p>
            <div className="hero-actions">
              <a href="/register.html" className="btn btn-primary btn-lg">
                {"Get Started Free"}
              </a>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                {"See How It Works"}
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="number">
                  <span data-target="2400" data-suffix="+">
                    {"2,400+"}
                  </span>
                </div>
                <div className="label">{"Active Learners"}</div>
              </div>
              <div className="hero-stat">
                <div className="number">
                  <span data-target="180" data-suffix="+">
                    {"180+"}
                  </span>
                </div>
                <div className="label">{"Courses"}</div>
              </div>
              <div className="hero-stat">
                <div className="number">
                  <span data-target="94" data-suffix="%">
                    {"94%"}
                  </span>
                </div>
                <div className="label">{"Satisfaction Rate"}</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap finance-hero-photo">
              <div className="hero-chart-overlay">
                <div className="hero-chart-label">
                  {"Market Simulation Dashboard"}
                </div>
                <div className="hero-chart-price">
                  {"\n              \u20b921,843.25\n              "}
                  <span className="hero-price-change">{"+2.4%"}</span>
                </div>
                <div className="hero-chart-bars">
                  <div className="chart-bar up" style={{ height: "40%" }}></div>
                  <div className="chart-bar up" style={{ height: "65%" }}></div>
                  <div
                    className="chart-bar down"
                    style={{ height: "50%" }}
                  ></div>
                  <div className="chart-bar up" style={{ height: "80%" }}></div>
                  <div
                    className="chart-bar down"
                    style={{ height: "45%" }}
                  ></div>
                  <div className="chart-bar up" style={{ height: "90%" }}></div>
                  <div className="chart-bar up" style={{ height: "70%" }}></div>
                  <div
                    className="chart-bar down"
                    style={{ height: "55%" }}
                  ></div>
                  <div className="chart-bar up" style={{ height: "85%" }}></div>
                  <div
                    className="chart-bar up"
                    style={{ height: "100%" }}
                  ></div>
                  <div
                    className="chart-bar down"
                    style={{ height: "60%" }}
                  ></div>
                  <div className="chart-bar up" style={{ height: "95%" }}></div>
                </div>
              </div>
            </div>
            <div className="hero-badge">
              <div className="badge-icon">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <div className="badge-text">{"Zero Real Money Risk"}</div>
                <div className="badge-sub">
                  {"\u20b91,00,000 Virtual Starting Balance"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="trusted-bar">
        <div className="trusted-inner">
          <span className="trusted-label">{"Trusted by institutions"}</span>
          <div className="trusted-logos">
            <div className="trusted-logo">
              <svg viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {"\n          IIIT SriCity\n        "}
            </div>
            <div className="trusted-logo">
              <svg viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              {"\n          State University\n        "}
            </div>
            <div className="trusted-logo">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                <path d="M16 7V5a2 2 0 0 0-4 0v2"></path>
                <path d="M12 12v3"></path>
                <circle cx="12" cy="12" r="1"></circle>
              </svg>
              {"\n          FinEdu Institute\n        "}
            </div>
            <div className="trusted-logo">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
              {"\n          TradeMasters\n        "}
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "var(--white)" }}>
        <section id="features">
          {slots["features"] ?? (
            <>
              <p className="section-tag">{"What We Offer"}</p>
              <h2 className="section-title">
                {"Everything You Need to Learn Trading"}
              </h2>
              <p className="section-sub">
                {
                  "A comprehensive platform built for students, educators, and financial institutions."
                }
              </p>
              <Reveal className="features-grid reveal">
                <div className="feature-card">
                  <div className="feature-icon fi-blue">
                    <svg viewBox="0 0 24 24">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  </div>
                  <h4>{"Paper Trading"}</h4>
                  <p>
                    {
                      "Execute real-time simulated trades across NSE and BSE with live market data \u2014 no real money involved."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-green">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <h4>{"Skill Challenges"}</h4>
                  <p>
                    {
                      "Complete instructor-designed assignments to earn skill points and unlock advanced trading features."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-orange">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <h4>{"Curated Courses"}</h4>
                  <p>
                    {
                      "Access structured learning paths from verified course providers covering equity, crypto, and options."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-purple">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <h4>{"Live Sessions"}</h4>
                  <p>
                    {
                      "Join instructor-led trading sessions with real-time commentary and interactive Q&A."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-green">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h4>{"Leaderboards"}</h4>
                  <p>
                    {
                      "Compete with classmates on portfolio returns and skill points for healthy academic competition."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-blue">
                    <svg viewBox="0 0 24 24">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <h4>{"Portfolio Analytics"}</h4>
                  <p>
                    {
                      "Track P&L, win rate, sector allocation, and trading patterns with detailed visual analytics."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-orange">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <h4>{"Risk-Free Environment"}</h4>
                  <p>
                    {
                      "All trades use virtual currency. Make mistakes, learn from them, and improve without consequences."
                    }
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-purple">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h4>{"Expert Guidance"}</h4>
                  <p>
                    {
                      "Learn directly from certified instructors with hands-on feedback on your trading decisions."
                    }
                  </p>
                </div>
              </Reveal>
            </>
          )}
        </section>
      </div>
      <div
        id="how-it-works"
        style={{ background: "var(--gray-50)", padding: "80px 0" }}
      >
        {slots["how-it-works"] ?? (
          <>
            <section>
              <p className="section-tag">{"Simple Process"}</p>
              <h2 className="section-title">{"How IndAI Works"}</h2>
              <p className="section-sub">
                {
                  "Get started in minutes and begin your trading education journey today."
                }
              </p>
              <Reveal className="steps-grid reveal">
                <div className="step-item">
                  <div className="step-num">{"1"}</div>
                  <h4>{"Create Your Account"}</h4>
                  <p>
                    {
                      "Sign up as a student, instructor, or institution. Quick registration with role verification."
                    }
                  </p>
                </div>
                <div className="step-item">
                  <div className="step-num green-num">{"2"}</div>
                  <h4>{"Join Your Class"}</h4>
                  <p>
                    {
                      "Your instructor assigns you to a cohort. You receive \u20b91,00,000 in virtual trading capital."
                    }
                  </p>
                </div>
                <div className="step-item">
                  <div className="step-num orange-num">{"3"}</div>
                  <h4>{"Learn & Trade"}</h4>
                  <p>
                    {
                      "Complete courses, watch live sessions, and execute paper trades in real market conditions."
                    }
                  </p>
                </div>
                <div className="step-item">
                  <div className="step-num purple-num">{"4"}</div>
                  <h4>{"Earn & Advance"}</h4>
                  <p>
                    {
                      "Earn skill points from assignments, climb the leaderboard, and unlock advanced features."
                    }
                  </p>
                </div>
              </Reveal>
            </section>
          </>
        )}
      </div>
      <div style={{ background: "var(--white)", padding: "80px 0" }}>
        <section>
          <Reveal className="stats-section reveal">
            <div className="stats-section-title">{"IndAI by the Numbers"}</div>
            <div className="stats-section-sub">
              {"Empowering the next generation of informed traders"}
            </div>
            <div className="platform-stats-grid">
              <div className="platform-stat">
                <div className="platform-stat-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div
                  className="platform-stat-num"
                  data-target="2400"
                  data-suffix="+"
                >
                  {"2,400+"}
                </div>
                <div className="platform-stat-label">{"Active Learners"}</div>
              </div>
              <div className="platform-stat">
                <div className="platform-stat-icon">
                  <svg viewBox="0 0 24 24">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  </svg>
                </div>
                <div
                  className="platform-stat-num"
                  data-target="142000"
                  data-prefix="\u20b9"
                  data-suffix="Cr+"
                >
                  {"\u20b91.42 Lakh Cr+"}
                </div>
                <div className="platform-stat-label">
                  {"Virtual Trades Executed"}
                </div>
              </div>
              <div className="platform-stat">
                <div className="platform-stat-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div
                  className="platform-stat-num"
                  data-target="180"
                  data-suffix="+"
                >
                  {"180+"}
                </div>
                <div className="platform-stat-label">{"Courses Available"}</div>
              </div>
              <div className="platform-stat">
                <div className="platform-stat-icon">
                  <svg viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div
                  className="platform-stat-num"
                  data-target="94"
                  data-suffix="%"
                >
                  {"94%"}
                </div>
                <div className="platform-stat-label">
                  {"Learner Satisfaction"}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
      <div style={{ background: "var(--gray-50)", padding: "80px 0" }}>
        <section>
          <p className="section-tag">{"For Everyone"}</p>
          <h2 className="section-title">{"Built for Every Role"}</h2>
          <p className="section-sub">
            {"IndAI serves every stakeholder in financial education."}
          </p>
          <Reveal className="roles-section reveal">
            <div className="roles-grid">
              <div className="role-info-card">
                <div className="role-header">
                  <div className="role-icon-badge rib-blue">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>{"Learners"}</h4>
                    <div className="desc">
                      {"Students building trading skills"}
                    </div>
                  </div>
                </div>
                <ul>
                  <li>
                    {"Execute paper trades with \u20b91L virtual balance"}
                  </li>
                  <li>{"Earn skill points through assignments"}</li>
                  <li>{"Track portfolio performance & analytics"}</li>
                  <li>{"Compete on class leaderboards"}</li>
                  <li>{"Access curated courses & live sessions"}</li>
                </ul>
              </div>
              <div className="role-info-card">
                <div className="role-header">
                  <div className="role-icon-badge rib-green">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>{"Instructors"}</h4>
                    <div className="desc">
                      {"Educators guiding student progress"}
                    </div>
                  </div>
                </div>
                <ul>
                  <li>{"Assign trading challenges & assessments"}</li>
                  <li>{"Monitor student portfolios in real time"}</li>
                  <li>{"Schedule and host live trading sessions"}</li>
                  <li>{"Award skill points and provide feedback"}</li>
                  <li>{"View class rankings and progress reports"}</li>
                </ul>
              </div>
              <div className="role-info-card">
                <div className="role-header">
                  <div className="role-icon-badge rib-orange">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>{"Course Providers"}</h4>
                    <div className="desc">
                      {"Institutions offering curriculum"}
                    </div>
                  </div>
                </div>
                <ul>
                  <li>{"Publish courses for platform-wide learners"}</li>
                  <li>{"Track course enrollment and completion"}</li>
                  <li>{"Receive learner feedback and ratings"}</li>
                  <li>{"Manage lesson content and skill point rewards"}</li>
                  <li>{"Analyse engagement and performance metrics"}</li>
                </ul>
              </div>
              <div className="role-info-card">
                <div className="role-header">
                  <div className="role-icon-badge rib-purple">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>{"Administrators"}</h4>
                    <div className="desc">
                      {"Managing institutional operations"}
                    </div>
                  </div>
                </div>
                <ul>
                  <li>{"Approve instructor and provider accounts"}</li>
                  <li>{"Oversee institution-wide activity"}</li>
                  <li>{"Configure trading rules and limits"}</li>
                  <li>{"Generate reports and performance summaries"}</li>
                  <li>{"Manage user access and permissions"}</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
      <div style={{ background: "var(--white)", padding: "80px 0" }}>
        <section>
          <p className="section-tag">{"What Learners Say"}</p>
          <h2 className="section-title">{"Stories from Our Community"}</h2>
          <p className="section-sub">
            {
              "Thousands of students have built real trading knowledge with IndAI."
            }
          </p>
          <Reveal className="testimonials-grid reveal">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <p className="testimonial-text">
                {
                  "\"IndAI completely changed how I understand markets. I made my first 'trade' in the simulator and I was hooked. Now I can explain P&L, stop-losses, and portfolio diversification to my friends!\""
                }
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar av-blue">{"A"}</div>
                <div>
                  <div className="testimonial-name">{"Arjun Sharma"}</div>
                  <div className="testimonial-role">
                    {"B.Tech Student \u00b7 IIIT SriCity"}
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <p className="testimonial-text">
                {
                  "\"As an instructor, IndAI has transformed my classroom. I can assign challenges, monitor every student's portfolio, and see exactly where they struggle. It's the best EdTech tool I've used.\""
                }
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar av-green">{"P"}</div>
                <div>
                  <div className="testimonial-name">{"Prof. Priya Nair"}</div>
                  <div className="testimonial-role">
                    {"Finance Instructor \u00b7 State University"}
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <p className="testimonial-text">
                {
                  '"I went from knowing nothing about markets to being top of my class leaderboard in just 3 months. The skill points system keeps me motivated every single day."'
                }
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar av-purple">{"R"}</div>
                <div>
                  <div className="testimonial-name">{"Riya Kapoor"}</div>
                  <div className="testimonial-role">
                    {"MBA Student \u00b7 FinEdu Institute"}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
      <div
        id="pricing"
        style={{ background: "var(--white)", padding: "80px 0" }}
      >
        {slots["pricing"] ?? (
          <>
            <section>
              <p className="section-tag">{"Flexible Access"}</p>
              <h2 className="section-title">
                {"Free Learning, Pro Depth, Institution Scale"}
              </h2>
              <p className="section-sub">
                {
                  "Students can start free and upgrade when they need advanced content. Institutions can license a private IndAI workspace for their own learners, instructors and verified course providers."
                }
              </p>
              <Reveal
                className="features-grid reveal"
                style={{ gridTemplateColumns: "repeat(3,1fr)" }}
              >
                <div className="feature-card">
                  <div className="feature-icon fi-blue">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <h4>{"Free"}</h4>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "900",
                      margin: "8px 0 12px",
                    }}
                  >
                    {"\u20b90 "}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--gray-500)",
                      }}
                    >
                      {"forever"}
                    </span>
                  </div>
                  <p>
                    {
                      "Core financial-literacy courses, standard quizzes, paper trading, basic videos/PDFs and institution-provided learning."
                    }
                  </p>
                  <a
                    href="/register.html"
                    className="btn btn-secondary btn-block"
                    style={{ marginTop: "18px" }}
                  >
                    {"Start Free"}
                  </a>
                </div>
                <div
                  className="feature-card"
                  style={{
                    border: "2px solid var(--orange)",
                    position: "relative",
                  }}
                >
                  <span
                    className="badge badge-orange"
                    style={{ position: "absolute", right: "16px", top: "16px" }}
                  >
                    {"Advanced"}
                  </span>
                  <div className="feature-icon fi-orange">
                    <svg viewBox="0 0 24 24">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <h4>{"IndAI Pro"}</h4>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "900",
                      margin: "8px 0 12px",
                    }}
                  >
                    {"\u20b9299 "}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--gray-500)",
                      }}
                    >
                      {"/ month"}
                    </span>
                  </div>
                  <p>
                    {
                      "Advanced Pro courses, enhanced quizzes, premium video/PDF materials and deeper learning paths. Quarterly and annual plans are also available inside the learner portal."
                    }
                  </p>
                  <a
                    href="/login.html"
                    className="btn btn-orange btn-block"
                    style={{ marginTop: "18px" }}
                  >
                    {"Upgrade in Learner Portal"}
                  </a>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-purple">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <h4>{"Institution License"}</h4>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "900",
                      margin: "8px 0 12px",
                    }}
                  >
                    {"B2B "}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--gray-500)",
                      }}
                    >
                      {"annual licensing"}
                    </span>
                  </div>
                  <p>
                    {
                      "A private workspace for institutes such as IIIT Sri City, with dedicated learners, instructors, verified providers, user mapping, private courses and centralized billing."
                    }
                  </p>
                  <a
                    href="#contact"
                    className="btn btn-purple btn-block"
                    style={{ marginTop: "18px" }}
                  >
                    {"Contact for Institution Access"}
                  </a>
                </div>
              </Reveal>
              <Reveal
                className="card reveal"
                style={{ marginTop: "24px", background: "var(--gray-50)" }}
              >
                <div style={{ fontWeight: "800", marginBottom: "8px" }}>
                  {"How the model works"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--gray-600)",
                    lineHeight: "1.8",
                  }}
                >
                  {
                    "Course providers quote a commercial price when submitting a course. Payment Admin can negotiate, sanction the final amount and publish the approved course. Instructors are compensated monthly per assigned active learner and may receive skill-growth performance bonuses. IndAI earns from Pro subscriptions, institution licenses and per-student platform commission."
                  }
                </div>
              </Reveal>
            </section>
          </>
        )}
      </div>
      <div id="faq" style={{ background: "var(--gray-50)", padding: "80px 0" }}>
        {slots["faq"] ?? (
          <>
            <section>
              <p className="section-tag">{"FAQ"}</p>
              <h2 className="section-title">{"Frequently Asked Questions"}</h2>
              <p className="section-sub">
                {"Everything you need to know about IndAI"}
              </p>
              <Reveal
                style={{ maxWidth: "700px", margin: "0 auto" }}
                className="reveal"
              >
                <div className={"faq-item" + (faq === 0 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(0)", e);
                    }}
                  >
                    {
                      "\n            What is paper trading and how does it work?\n            "
                    }
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 0 ? " open" : "")}>
                    {
                      "Paper trading lets you practice buying and selling stocks using virtual money. You experience real market conditions without risking any real capital. On IndAI, you start with \u20b91,00,000 virtual money and can execute simulated trades just like real trading."
                    }
                  </div>
                </div>
                <div className={"faq-item" + (faq === 1 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(1)", e);
                    }}
                  >
                    {"\n            How do skill points work?\n            "}
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 1 ? " open" : "")}>
                    {
                      "Skill points are earned by completing assignments, courses, and challenges set by your instructor. As you accumulate points, your trading limit increases, allowing you to take on larger simulated positions. Higher skill levels unlock advanced features like margin trading."
                    }
                  </div>
                </div>
                <div className={"faq-item" + (faq === 2 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(2)", e);
                    }}
                  >
                    {"\n            Who can use IndAI?\n            "}
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 2 ? " open" : "")}>
                    {
                      "IndAI is designed for students from educational institutions who want to learn financial markets. Instructors, course providers, and administrators also use the platform to manage learning programs and track student progress."
                    }
                  </div>
                </div>
                <div className={"faq-item" + (faq === 3 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(3)", e);
                    }}
                  >
                    {"\n            Is my data secure?\n            "}
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 3 ? " open" : "")}>
                    {
                      "Yes, all personal information is encrypted and stored securely. We never share your data with third parties. Our platform follows strict data privacy protocols to ensure your information remains safe."
                    }
                  </div>
                </div>
                <div className={"faq-item" + (faq === 4 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(4)", e);
                    }}
                  >
                    {
                      "\n            Can I compete with other learners?\n            "
                    }
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 4 ? " open" : "")}>
                    {
                      "Yes! IndAI has a ranking system within your class. Your instructor can view your rank compared to other students based on portfolio returns and skill points. This encourages healthy competition and motivation."
                    }
                  </div>
                </div>
                <div className={"faq-item" + (faq === 5 ? " open" : "")}>
                  <div
                    className="faq-q"
                    onClick={(e) => {
                      onAction("toggleFaq(5)", e);
                    }}
                  >
                    {
                      "\n            What types of trading can I learn?\n            "
                    }
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </div>
                  <div className={"faq-a" + (faq === 5 ? " open" : "")}>
                    {
                      "IndAI covers equity trading, technical analysis, fundamental analysis, risk management, and more. Advanced features include crypto trading and options basics, unlocked as you earn skill points."
                    }
                  </div>
                </div>
              </Reveal>
            </section>
          </>
        )}
      </div>
      <div id="about" style={{ background: "var(--white)", padding: "80px 0" }}>
        {slots["about"] ?? (
          <>
            <section>
              <Reveal className="about-grid reveal">
                <div>
                  <p className="section-tag" style={{ textAlign: "left" }}>
                    {"Our Story"}
                  </p>
                  <h2
                    style={{
                      textAlign: "left",
                      fontSize: "1.8rem",
                      color: "var(--dark)",
                    }}
                  >
                    {"About IndAI"}
                  </h2>
                  <p style={{ marginTop: "16px", lineHeight: "1.8" }}>
                    {
                      "IndAI is an innovative educational platform developed to address a critical gap in financial literacy education. We recognized that many young people lack practical knowledge about investing and trading, often learning through costly mistakes."
                    }
                  </p>
                  <p style={{ marginTop: "14px", lineHeight: "1.8" }}>
                    {
                      "Our mission is to provide a safe, risk-free environment where students can learn trading fundamentals, develop strategies, and build confidence before entering real markets."
                    }
                  </p>
                  <div className="about-points">
                    <div className="about-point">
                      <div className="apoint-icon api-blue">
                        <svg viewBox="0 0 24 24">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                      </div>
                      <div className="apoint-text">
                        <h4>{"Educational Focus"}</h4>
                        <p>
                          {
                            "Designed specifically for learning, not speculation"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="about-point">
                      <div className="apoint-icon api-green">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className="apoint-text">
                        <h4>{"Risk-Free Environment"}</h4>
                        <p>{"Learn without the fear of losing real money"}</p>
                      </div>
                    </div>
                    <div className="about-point">
                      <div className="apoint-icon api-orange">
                        <svg viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <div className="apoint-text">
                        <h4>{"Expert Guidance"}</h4>
                        <p>
                          {"Supported by experienced trading professionals"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="about-imgs">
                  <div
                    className="about-img tall"
                    style={{
                      background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
                    }}
                  >
                    <div className="about-img-inner">
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          stroke: "#93C5FD",
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                        <polyline points="6 9 9 12 12 9 16 13 20 9"></polyline>
                      </svg>
                      <div
                        className="about-img-label"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {"Live Market Data"}
                      </div>
                    </div>
                  </div>
                  <div
                    className="about-img"
                    style={{
                      background: "linear-gradient(135deg, #0D2E1F, #059669)",
                    }}
                  >
                    <div className="about-img-inner">
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          stroke: "#6EE7B7",
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <div
                        className="about-img-label"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {"Class Cohorts"}
                      </div>
                    </div>
                  </div>
                  <div
                    className="about-img"
                    style={{
                      background: "linear-gradient(135deg, #2D1F00, #D97706)",
                    }}
                  >
                    <div className="about-img-inner">
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          stroke: "#FCD34D",
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      <div
                        className="about-img-label"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {"Portfolio Growth"}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>
          </>
        )}
      </div>
      <div
        id="contact"
        style={{ background: "var(--gray-50)", padding: "80px 0" }}
      >
        {slots["contact"] ?? (
          <>
            <section>
              <h2 className="section-title">{"Get In Touch"}</h2>
              <p className="section-sub">
                {"Have questions? We'd love to hear from you."}
              </p>
              <Reveal className="contact-grid reveal">
                <div className="contact-info">
                  <h3>{"Contact Information"}</h3>
                  <p>
                    {"Reach out to us through any of the following channels."}
                  </p>
                  <div className="contact-item">
                    <div className="c-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.92 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="c-label">{"Phone Numbers"}</div>
                      <div className="c-value">
                        {"+91 94403 01727"}
                        <br />
                        {"+91 82478 75743"}
                      </div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="c-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="c-label">{"Email Address"}</div>
                      <div className="c-value">{"indai.s1300@gmail.com"}</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="c-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <div className="c-label">{"Location"}</div>
                      <div className="c-value">
                        {"IIIT SriCity"}
                        <br />
                        {"Chittoor, Andhra Pradesh"}
                        <br />
                        {"India \u2013 517 588"}
                      </div>
                    </div>
                  </div>
                  <div className="office-hours">
                    <h4>{"Office Hours"}</h4>
                    <p>
                      {"Monday \u2013 Friday: 9:00 AM \u2013 6:00 PM IST"}
                      <br />
                      {"Saturday: 10:00 AM \u2013 4:00 PM IST"}
                      <br />
                      {"Sunday: Closed"}
                    </p>
                  </div>
                </div>
                <div className="contact-form-card">
                  <h3>{"Send Us a Message"}</h3>
                  <p>
                    {
                      "Fill out the form below and we'll get back to you as soon as possible."
                    }
                  </p>
                  <form
                    id="contact-form"
                    aria-busy={busy}
                    onSubmit={(e) => {
                      e.preventDefault();
                      onAction("submitContact(event)", e);
                    }}
                  >
                    {slots["contact-form"] ?? (
                      <>
                        <div className="form-group">
                          <label className="form-label">{"Your Name"}</label>
                          <input
                            type="text"
                            id="c-name"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={form["c-name"] ?? ""}
                            onChange={(e) => onField("c-name", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            {"Email Address"}
                          </label>
                          <input
                            type="email"
                            id="c-email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={form["c-email"] ?? ""}
                            onChange={(e) => onField("c-email", e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{"I am a\u2026"}</label>
                          <select
                            id="c-role"
                            className="form-select"
                            value={form["c-role"] ?? ""}
                            onChange={(e) => onField("c-role", e.target.value)}
                          >
                            {slots["c-role"] ?? (
                              <>
                                <option value="">{"Select your role"}</option>
                                <option>{"Student / Learner"}</option>
                                <option>{"Instructor"}</option>
                                <option>{"Institution"}</option>
                                <option>{"Other"}</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">{"Message"}</label>
                          <textarea
                            id="c-message"
                            className="form-textarea"
                            placeholder="Tell us how we can help you\u2026"
                            value={form["c-message"] ?? ""}
                            onChange={(e) =>
                              onField("c-message", e.target.value)
                            }
                          >
                            {slots["c-message"] ?? <></>}
                          </textarea>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary btn-block btn-lg"
                        >
                          {"Send Message"}
                        </button>
                      </>
                    )}
                    {slots["contact-status"]}
                  </form>
                </div>
              </Reveal>
            </section>
          </>
        )}
      </div>
      <footer className="landing-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-row">
              <div className="nav-logo blue">
                <svg viewBox="0 0 24 24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <span className="footer-brand-text">{"IndAI"}</span>
            </div>
            <p className="footer-brand">
              {
                "Empowering the next generation of traders through risk-free, educational paper trading experiences. Built at IIIT SriCity."
              }
            </p>
          </div>
          <div className="footer-col">
            <h5>{"Quick Links"}</h5>
            <a href="#">{"Home"}</a>
            <a href="#how-it-works">{"How It Works"}</a>
            <a href="#faq">{"FAQ"}</a>
            <a href="#about">{"About Us"}</a>
            <a href="#contact">{"Contact"}</a>
          </div>
          <div className="footer-col">
            <h5>{"User Roles"}</h5>
            <a href="/login.html">{"Learners"}</a>
            <a href="/login.html">{"Instructors"}</a>
            <a href="/login.html">{"Course Providers"}</a>
            <a href="/login.html">{"Administrators"}</a>
            <a href="/login.html">{"Super Users"}</a>
          </div>
        </div>
        <div className="footer-bottom">
          {
            "\u00a9 2024 IndAI. All rights reserved. | IIIT SriCity, Chittoor, Andhra Pradesh"
          }
        </div>
      </footer>
    </>
  );
}
