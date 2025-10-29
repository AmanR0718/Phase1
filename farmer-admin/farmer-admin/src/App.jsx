import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Farmers from "./pages/Farmers";

export default function App() {
  const isAuth = !!localStorage.getItem("access_token");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth ? <Navigate to="/farmers" /> : <Login />} />
        <Route path="/farmers" element={isAuth ? <Farmers /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
