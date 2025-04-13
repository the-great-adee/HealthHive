import './App.css';
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import UpdateProfile from './Pages/UpdateProfile';
import Navbar from './Components/Navbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DoctorDashBoard from './Pages/DoctorDashBoard';
import PatientDashBoard from './Pages/PatientDashboard';
import FooterNav from './Components/Footer';
import DoctorProfile from './Components/Doctor/DoctorProfile';
import PatientProfile from './Components/Patient/PatientProfile';
// Import new store pages
import Store from './Pages/Store';
// import ProductDetail from './Components/Store/ProductDetail';
import ProductDetails from './Pages/ProductDetails';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import OrdersPage from './Pages/OrdersPage';
import OrderConfirmation from './Pages/OrderConfirmation'; // Create this file

// Auth Guard component to protect routes
const ProtectedRoute = ({ children }) => {
  const jwtToken = document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwtToken='));
  return jwtToken ? children : <Navigate to="/patient-login" />;
};

function App() {
  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <BrowserRouter>
          <Navbar />
          <div style={{
            flex: 1,
            padding: '20px'
          }}>
            <Routes>
              <Route path='/' element={<Landing />} />
              <Route path='/doctor-login' element={<Login isDoctor={true} />} />
              <Route path='/patient-login' element={<Login isDoctor={false} />} />
              <Route path='/update-profile' element={<UpdateProfile />} />
              <Route path='/doctor-dashboard' element={<DoctorDashBoard />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/patient-profile' element={<PatientProfile />} />
              <Route path='/patient-dashboard/*' element={<PatientDashBoard />} />
              
              {/* Store routes */}
              <Route path='/store' element={<Store />} />
              <Route path="/store/product/:id" element={<ProductDetails />} />
              <Route path='/cart' element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path='/checkout' element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path='/orders' element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path='/orders/:id' element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              {/* Add this new route for order confirmation */}
              <Route path='/order/confirmation/:id' element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
        <FooterNav/>
      </div>
    </>
  );
}

export default App;