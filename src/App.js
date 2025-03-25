import './App.css';
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import UpdateProfile from './Pages/UpdateProfile';
import Navbar from './Components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DoctorDashBoard from './Pages/DoctorDashBoard';
import PatientDashBoard from './Pages/PatientDashboard';
import FooterNav from './Components/Footer';
function App() {
	return (
		<>
		<div style={{
		display: 'flex',
		flexDirection: 'column',
		minHeight: '100vh' // Takes full viewport height
		}}>
			<BrowserRouter>
				<Navbar />
				<div style={{
					flex: 1, // This makes the content expand to push footer down
					padding: '20px' // Add spacing around content
				}}>
				<Routes>
					<Route path='/' element={<Landing />} />
					<Route path='/doctor-login' element={<Login isDoctor={true} />} />
					<Route path='/patient-login' element={<Login isDoctor={false} />} />
					<Route path='/update-profile' element={<UpdateProfile />} />
					<Route path='/doctor-dashboard' element={<DoctorDashBoard />} />
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
