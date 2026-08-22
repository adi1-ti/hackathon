import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import StudentProfile from "./pages/StudentProfile";
import CareerSelection from "./pages/CareerSelection";
import CareerGoals from "./pages/CareerGoals";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/career-selection" element={<CareerSelection />} />
        <Route path="/career-goals" element={<CareerGoals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;