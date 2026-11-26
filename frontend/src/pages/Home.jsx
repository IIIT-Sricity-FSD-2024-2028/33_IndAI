import { ThemeToggle } from "../components/ThemeToggle.jsx";
import { Link } from "react-router-dom";
import { useResource } from "../hooks/api.js";
import { Brand, Icon } from "../components/Icon.jsx";
import { HomePreview } from "../components/HomePreview.jsx";
import "../styles/home.css";

const features = [
  {
    icon: "trade",
    title: "Practice with a paper portfolio",
    copy: "Explore NSE equities, place simulated orders, and understand what happens to your cash and positions.",
  },
  {
    icon: "book",
    title: "Build your understanding",
    copy: "Work through structured lessons, track your progress, and connect each concept to your trading practice.",
  },
  {
    icon: "journal",
    title: "Learn from your decisions",
    copy: "Keep a private trading journal and revisit your order history to develop a more considered process.",
  },
];
const plans = [
  {
    name: "Free",
    title: "Start with the fundamentals.",
    features: [
      "Paper trading & portfolio",
      "Watchlists & private journal",
      "Introductory lessons",
    ],
  },
  {
    name: "Pro",
    title: "Bring guidance into your practice.",
    features: [
      "Everything in Free",
      "Subscription course catalog",
      "Request a course provider",
    ],
  },
  {
    name: "Plus",
    title: "Give your learning a direction.",
    features: ["Everything in Pro", "Request a personal instructor"],
  },
];

export function Home() {
  const session = useResource("/me");
  const signedIn = Boolean(session.data);
  return (
    <div className="home-page">
      <a className="skip" href="#home-main">
        Skip to content
      </a>
      <div className="home-theme">
        <ThemeToggle />
      </div>
      <header className="home-header home-container">
        <Link to="/" aria-label="IndAI home">
          <Brand />
        </Link>
        <nav className="home-sections" aria-label="Explore IndAI">
          <a href="#experience">The experience</a>
          <a href="#how-it-works">How it works</a>
          <a href="#plans">Plans</a>
        </nav>
        <div className="home-header-actions">
          <Link className="home-signin" to="/login">
            Sign in
          </Link>
          <Link className="button" to={signedIn ? "/overview" : "/register"}>
            {signedIn ? "Open workspace" : "Get started"}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </header>
      <main id="home-main">
        <section className="home-hero home-container">
          <div className="home-hero-copy">
            <p className="home-eyebrow">
              A MORE THOUGHTFUL WAY TO LEARN TRADING
            </p>
            <h1>
              Learn the market.
              <br />
              Find your <em>process.</em>
            </h1>
            <p className="home-intro">
              Turn curiosity into experience. Explore the markets with paper
              trading, structured learning, and guidance as you grow.
            </p>
            <div className="home-hero-actions">
              <Link
                className="button"
                to={signedIn ? "/overview" : "/register"}
              >
                {signedIn
                  ? "Continue to your workspace"
                  : "Start your learning journey"}
                <Icon name="arrow" size={17} />
              </Link>
              <Link className="home-demo-link" to="/login#demo-login-title">
                Explore the demo <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="home-hero-note">
              <Icon name="admin" size={16} />
              Simulated trading. Space to practice.
            </p>
          </div>
          <HomePreview />
        </section>
        <div className="home-context">
          <div className="home-container">
            <span>Built for learning, from the first order onward.</span>
            <div>
              <span>NSE equities</span>
              <span>INR paper portfolio</span>
              <span>Courses & guidance</span>
            </div>
          </div>
        </div>
        <section id="experience" className="home-section home-container">
          <div className="home-section-heading">
            <p className="home-eyebrow">YOUR LEARNING WORKSPACE</p>
            <h2>
              A little more understanding.
              <br />
              With every session.
            </h2>
          </div>
          <div className="home-features">
            {features.map((feature) => (
              <article key={feature.title}>
                <span className="home-feature-icon">
                  <Icon name={feature.icon} size={25} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="home-journey">
          <div className="home-container home-journey-inner">
            <div className="home-section-heading">
              <p className="home-eyebrow">FROM CURIOUS TO CONSISTENT</p>
              <h2>
                Start where you are.
                <br />
                Build from there.
              </h2>
              <p>
                Your learning, trading practice, and guidance live together in
                one workspace.
              </p>
              <Link className="home-demo-link" to="/register">
                Apply for access <Icon name="arrow" size={17} />
              </Link>
            </div>
            <div className="home-steps">
              <article>
                <span>
                  <Icon name="admin" />
                </span>
                <div>
                  <h3>Apply and get approved</h3>
                  <p>
                    Create an account, verify your email, and follow your
                    application through administrator review.
                  </p>
                </div>
              </article>
              <article>
                <span>
                  <Icon name="trade" />
                </span>
                <div>
                  <h3>Learn by doing</h3>
                  <p>
                    Start with Free lessons and paper trading. Keep track of
                    your decisions and review your progress.
                  </p>
                </div>
              </article>
              <article>
                <span>
                  <Icon name="people" />
                </span>
                <div>
                  <h3>Connect when you’re ready</h3>
                  <p>
                    With Pro, request a course provider for learning plans and
                    milestones. Plus also lets you request a personal
                    instructor. Guidance begins after acceptance and depends on
                    specialist capacity.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section id="plans" className="home-section home-container">
          <div className="home-section-heading">
            <p className="home-eyebrow">ROOM TO GROW</p>
            <h2>
              Choose the support
              <br />
              for your next step.
            </h2>
          </div>
          <div className="home-plans">
            {plans.map((plan) => (
              <article key={plan.name}>
                <span className="home-plan-name">{plan.name}</span>
                <h3>{plan.title}</h3>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className="button secondary" to="/register">
                  Get started with {plan.name}
                  <Icon name="arrow" size={15} />
                </Link>
              </article>
            ))}
          </div>
          <p className="home-plan-note">
            Free access follows account approval. Paid plans require verified
            payment. Review current prices and availability in your workspace.
          </p>
        </section>
        <section className="home-closing home-container">
          <div>
            <p className="home-eyebrow">
              ONE PLATFORM, A SHARED LEARNING JOURNEY
            </p>
            <h2>
              Your next chapter
              <br />
              starts with practice.
            </h2>
            <p>
              A workspace for learners, instructors, providers, and the teams
              supporting them.
            </p>
          </div>
          <Link className="button" to="/login">
            Find your workspace
            <Icon name="arrow" size={17} />
          </Link>
        </section>
      </main>
      <footer className="home-footer home-container">
        <Link to="/" aria-label="IndAI home">
          <Brand />
        </Link>
        <p>Trading education & paper trading.</p>
        <nav aria-label="Footer">
          <Link to="/login">Sign in</Link>
          <Link to="/register">Apply for access</Link>
          <a href="#home-main">Back to top ↑</a>
        </nav>
      </footer>
    </div>
  );
}
