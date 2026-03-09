import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

import EventsPage from "./pages/EventsPage";
import NewsletterPage from "./pages/NewsletterPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/layout/HeroSection";
import EventSection from "./components/layout/EventSection";
import TeamSection from "./components/layout/TeamSection";

import BlogsPage from "./pages/BlogsPage";
import WriteBlogPage from "./pages/WriteBlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";

import AdminSidebar from "./components/admin/AdminSidebar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";

function HomePage() {
return ( <main className="flex-1"> <HeroSection /> <EventSection /> <TeamSection /> </main>
);
}

// Admin layout
function AdminLayout() {
const [sidebarOpen, setSidebarOpen] = useState(true);

return ( <div className="min-h-screen flex bg-[#0d0d0d] text-white"> <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />


  <main
    className="flex-1 overflow-y-auto transition-all duration-300"
    style={{ marginLeft: sidebarOpen ? "256px" : "64px" }}
  >
    <Outlet />
  </main>
</div>


);
}

export default function App() {
return ( <BrowserRouter> <Routes>


    {/* Public Home Page */}
    <Route
      path="/"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <div className="h-24" />

          <HomePage />
          <Footer />
        </div>
      }
    />

    {/* Blogs List Page */}
    <Route
      path="/blogs"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <BlogsPage />
        </div>
      }
    />

    {/* Write Blog Page */}
    <Route
      path="/write-blog"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <WriteBlogPage />
        </div>
      }
    />

    {/* Blog Detail Page */}
    <Route
      path="/blog/:id"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <BlogDetailPage />
        </div>
      }
    />
     
     {/* Events page */}
      <Route
      path="/events"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <EventsPage />
        </div>
      }
    />

      {/* Newsletter page */}
      <Route
      path="/newsletter"
      element={
        <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
          <div className="fixed top-6 w-full z-50 flex justify-center">
            <Navbar />
          </div>

          <NewsletterPage />
        </div>
      }
    />

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="blogs" element={<AdminBlogs />} />
      <Route path="newsletters" element={<AdminNewsletters />} />
      <Route path="teams" element={<AdminTeams />} />
      <Route path="events" element={<AdminEvents />} />
      <Route path="gallery" element={<AdminGallery />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>

  </Routes>
</BrowserRouter>


);
}

