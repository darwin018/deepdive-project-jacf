import Navbar from './Components/Navbar'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from './Components/Home'
import AdminLogin from './Components/AdminLogin'
import AdminDashboard from './Components/AdminDashboard'
import Categories from './Components/Categories'
import Products from './Components/Products'
import CheckoutForm from './Components/CheckoutForm'
import ProtectedRoute from './Components/ProtectedRoute'

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="checkout" element={<CheckoutForm />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
