import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import EventsPage from "./pages/EventsPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
