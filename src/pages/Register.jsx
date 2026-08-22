import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Lightbulb,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="auth-page register-page">

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
            START YOUR JOURNEY
          </div>

          <h1>
            Build a future
            <br />
            that feels <span>right.</span>
          </h1>

          <p className="auth-description">
            Create your CareerPath AI profile and start discovering careers,
            skills, and learning paths designed around you.
          </p>

          <form className="login-form">

            {/* NAME */}
            <div className="input-group">
              <label htmlFor="name">Full Name</label>

              <div className="input-wrapper">
                <UserRound size={18} />

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <label htmlFor="register-email">Email Address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label htmlFor="register-password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* TERMS */}
            <label className="remember-me register-terms">
              <input type="checkbox" />
              <span>
                I agree to the Terms & Privacy Policy
              </span>
            </label>

            {/* CREATE ACCOUNT */}
  <Link to="/login" className="auth-button">
  Create Account
  <ArrowRight size={17} />
</Link>

          </form>

          <p className="register-text">
            Already have an account?
            <Link to="/login"> Log in</Link>
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right register-visual">

        <div className="idea-glow" />

        <div className="idea-orbit idea-orbit-one" />
        <div className="idea-orbit idea-orbit-two" />
        <div className="idea-orbit idea-orbit-three" />

        <div className="idea-visual">

          <div className="idea-rings ring-one" />
          <div className="idea-rings ring-two" />

          <div className="idea-symbol">
            <Lightbulb size={86} strokeWidth={1.1} />
          </div>

          <div className="idea-label">
            <Sparkles size={14} />
            <span>IMAGINE • LEARN • CREATE</span>
          </div>

        </div>

        <div className="idea-node idea-node-one">
          <BrainCircuit size={18} />
          <span>THINK</span>
        </div>

        <div className="idea-node idea-node-two">
          <Lightbulb size={18} />
          <span>IDEATE</span>
        </div>

        <div className="idea-node idea-node-three">
          <Sparkles size={18} />
          <span>DISCOVER</span>
        </div>

        <div className="idea-node idea-node-four">
          <ArrowRight size={18} />
          <span>GROW</span>
        </div>

        <div className="thinking-caption">
          <span />
          <p>
            Every great career starts
            <br />
            with <strong>one good idea.</strong>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Register;