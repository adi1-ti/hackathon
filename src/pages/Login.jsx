import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Mail,
  Sparkles,
  Target,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-left">

        <Link to="/" className="auth-brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>

          <div>
            <span className="brand-name">CAREERPATH</span>
            <span className="brand-subtitle">AI</span>
          </div>
        </Link>

        <div className="auth-content">

          <div className="auth-kicker">
            <span />
            WELCOME BACK
          </div>

          <h1>
            Continue building
            <br />
            your <span>career path.</span>
          </h1>

          <p className="auth-description">
            Login to continue exploring your personalized career journey,
            recommendations, and skill roadmap.
          </p>

          <form className="login-form">

            {/* EMAIL */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="form-row">

              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}
            <button
  type="button"
  className="auth-button"
  onClick={() => navigate("/StudentProfile")}
>Log In
  <ArrowRight size={17} />
</button>

          </form>

          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create one</Link>
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">

  <div className="thinking-glow" />

  <div className="thinking-orbit thinking-orbit-one" />
  <div className="thinking-orbit thinking-orbit-two" />
  <div className="thinking-orbit thinking-orbit-three" />

  <div className="brain-visual">

    <div className="brain-ring ring-one" />
    <div className="brain-ring ring-two" />

    <div className="brain-symbol">
      <BrainCircuit size={95} strokeWidth={1.1} />
    </div>

    <div className="brain-label">
      <Sparkles size={14} />
      <span>THINK • DISCOVER • GROW</span>
    </div>

  </div>

  <div className="thought-node node-one">
    <Target size={18} />
    <span>GOALS</span>
  </div>

  <div className="thought-node node-two">
    <Lightbulb size={18} />
    <span>IDEAS</span>
  </div>

  <div className="thought-node node-three">
    <GraduationCap size={18} />
    <span>SKILLS</span>
  </div>

  <div className="thought-node node-four">
    <BriefcaseBusiness size={18} />
    <span>CAREER</span>
  </div>

  <div className="thinking-caption">
    <span />
    <p>
      AI that helps you<br />
      <strong>think beyond the obvious.</strong>
    </p>
  </div>

</div>

    </div>
  );
}

export default Login;