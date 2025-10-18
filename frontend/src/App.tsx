import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OverlayProvider } from "./contexts/OverlayContext";
import Overlay from "./components/Overlay";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <OverlayProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
        </Router>
        <Overlay />
      </OverlayProvider>
    </AuthProvider>
  );
}

export default App;
