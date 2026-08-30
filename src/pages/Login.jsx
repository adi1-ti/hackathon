import { supabase } from "../supabaseClient";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";

import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Mail,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  function showPopup(type, title, message) {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  }

  function closePopup() {
    setPopup((prev) => ({
      ...prev,
      show: false,
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      showPopup(
        "error",
        "Missing Information",
        "Please enter your email address and password."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        console.error("LOGIN ERROR:", error);

        showPopup(
          "error",
          "Login Failed",
          error.message
        );

        return;
      }

      console.log("LOGIN SUCCESSFUL:", data);

      showPopup(
        "success",
        "Login Successful",
        "Welcome back! Redirecting you to your profile..."
      );

      setTimeout(() => {
        navigate("/student-profile");
      }, 1600);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      showPopup(
        "error",
        "Something Went Wrong",
        "We couldn't complete your login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      {/* =================================================
          CUSTOM POPUP
      ================================================= */}

      {popup.show && (
        <div className="custom-popup-overlay">

          <div
            className={`custom-popup ${
              popup.type === "success"
                ? "popup-success"
                : "popup-error"
            }`}
          >

            <button
              type="button"
              className="popup-close"
              onClick={closePopup}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="popup-icon">

              {popup.type === "success" ? (
                <CheckCircle2 size={28} />
              ) : (
                <X size={28} />
              )}

            </div>

            <div className="popup-content">

              <span className="popup-kicker">
                {popup.type === "success"
                  ? "WELCOME BACK"
                  : "PLEASE CHECK"}
              </span>

              <h3>{popup.title}</h3>

              <p>{popup.message}</p>

            </div>

            <div className="popup-line" />

          </div>

        </div>
      )}

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="auth-left">

        <Link to="/" className="auth-brand">

          <div className="brand-mark">
            <Sparkles size={18} />
          </div>

          <div>

            <span className="brand-name">
              CAREERPATH
            </span>

            <span className="brand-subtitle">
              AI
            </span>

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
            Login to continue exploring your personalized
            career journey, recommendations, and skill
            roadmap.
          </p>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
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

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  showPopup(
                    "error",
                    "Password Reset",
                    "Password reset can be connected to Supabase Auth here."
                  )
                }
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Log In"}

              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>

          <p className="register-text">

            Don't have an account?

            <Link to="/register">
              {" "}
              Create one
            </Link>

          </p>

        </div>

      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="auth-right">

        <div className="thinking-glow" />

        <div className="thinking-orbit thinking-orbit-one" />

        <div className="thinking-orbit thinking-orbit-two" />

        <div className="thinking-orbit thinking-orbit-three" />

        <div className="brain-visual">

          <div className="brain-ring ring-one" />

          <div className="brain-ring ring-two" />

          <div className="brain-symbol">

            <BrainCircuit
              size={95}
              strokeWidth={1.1}
            />

          </div>

          <div className="brain-label">

            <Sparkles size={14} />

            <span>
              THINK • DISCOVER • GROW
            </span>

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
            AI that helps you
            <br />
            <strong>
              think beyond the obvious.
            </strong>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;