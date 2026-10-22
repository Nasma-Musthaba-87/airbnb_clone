import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetails from "./pages/ListingDetails";
import MyBookings from "./pages/MyBookings";
import BecomeHost from "./pages/BecomeHost";
import HostDashboard from "./pages/HostDashboard";
import ListingForm from "./pages/ListingDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/become-a-host" element={<ProtectedRoute><BecomeHost /></ProtectedRoute>} />
        <Route path="/host/dashboard" element={<ProtectedRoute hostOnly><HostDashboard /></ProtectedRoute>} />
        <Route path="/host/listings/new" element={<ProtectedRoute hostOnly><ListingForm /></ProtectedRoute>} />
        <Route path="/host/listings/:id/edit" element={<ProtectedRoute hostOnly><ListingForm /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
