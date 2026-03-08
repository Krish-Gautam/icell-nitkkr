import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";


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

