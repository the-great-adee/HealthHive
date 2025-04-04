import './App.css';
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import UpdateProfile from './Pages/UpdateProfile';
import Navbar from './Components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DoctorDashBoard from './Pages/DoctorDashBoard';
import PatientDashBoard from './Pages/PatientDashboard';
import FooterNav from './Components/Footer';
import DoctorProfile from './Components/Doctor/DoctorProfile';
import PatientProfile from './Components/Patient/PatientProfile';
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
				</Routes>
				</div>
			</BrowserRouter>
			<FooterNav/>
			</div>
		</>
	);
}

export default App;
