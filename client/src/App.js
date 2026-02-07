import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Characters from "./pages/Characters";
import CharacterDetail from "./pages/CharacterDetail";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import FlashCards from "./pages/FlashCards";
import QuizDetail from "./pages/QuizDetail";
import Chatbot from "./pages/Chatbot";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentResult from "./pages/PaymentResult";
import AdminLogin from "./pages/Admin/Login";
import AdminRegister from "./pages/Admin/Register";
import AdminMain from "./pages/Admin/AdminMain";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCarousel from "./pages/Admin/AdminCarousel";
import AdminCharacters from "./pages/Admin/AdminCharacters";
import AdminPosts from "./pages/Admin/AdminPosts";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminQuiz from "./pages/Admin/AdminQuiz";
import AdminQuizCategories from "./pages/Admin/AdminQuizCategories";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminAdmins from "./pages/Admin/AdminAdmins";
import ForgotPassword from "./pages/Admin/ForgotPassword";
import ResetPassword from "./pages/Admin/ResetPassword";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nhan-vat" element={<Characters />} />
            <Route path="/nhan-vat/:slug" element={<CharacterDetail />} />
            <Route path="/blog" element={<Posts />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="/san-pham" element={<Products />} />
            <Route path="/san-pham/:slug" element={<ProductDetail />} />
            <Route path="/quiz" element={<FlashCards />} />
            <Route path="/quiz/:id" element={<QuizDetail />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/giai-dap" element={<FAQ />} />
            <Route path="/gio-hang" element={<Cart />} />
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/dat-hang-thanh-cong" element={<OrderSuccess />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminMain />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="characters" element={<AdminCharacters />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="quiz" element={<AdminQuiz />} />
              <Route path="quiz-categories" element={<AdminQuizCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="admins" element={<AdminAdmins />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
