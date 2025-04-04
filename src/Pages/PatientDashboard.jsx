import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import PatientProfile from '../Components/Patient/PatientProfile';
import DoctorData from '../Components/Patient/DoctorData';
import toast, { Toaster } from 'react-hot-toast';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import Consultations from '../Components/Patient/Consultations';
import axios from 'axios';

const PatientDashBoard = () => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loc, setloc] = useState(''); // to store the patient's location once fetched
  const Location = useLocation(); // path location
  const email = localStorage.getItem('userEmail');
  const isDoctor = localStorage.getItem('isDoctor');
  const [statistics, setStatistics] = useState({
    pendingConsultations: 0,
    upcomingAppointments: 0,
    thisMonth: 0,
    totalVisits: 0,
    loading: true,
    error: null
  });

  function getJwtToken() {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'jwtToken') {
        return value;
      }
    }
    return null;
  }

  const navigator = useNavigate();
  const authFetch = async (url, options = {}) => {
    const jwtToken = getJwtToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return await fetch(url, {
      ...options,
      headers: headers,
    });
  };

  // Fetch statistics function
  const fetchStatistics = async () => {
    try {
      const jwtToken = getJwtToken();
      if (!jwtToken) return;

      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('No user email found in localStorage.');
        return;
      }

      console.log('Fetching statistics for patient:', userEmail);

      const response = await axios.post('http://localhost:6969/patient/getStatistics', 
        { patient: userEmail }, 
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );

      console.log('Statistics Response:', response.data);

      setStatistics({
        ...response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load statistics'
      }));
    }
  };

  useEffect(() => {
    if (Location.pathname === '/patient-dashboard') {
      setLocation(loc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Location.pathname]);

  const handleLocationChange = async (event) => {
    const changedlocation = event.target.value;
    setLocation(changedlocation);
  };

  useEffect(() => {
    const jwtToken = getJwtToken();
    if (!jwtToken) {
      toast.error('Access denied. Please login first!');
      setTimeout(() => {
        return navigator('/patient-login');
      }, 1500);
    } else if (isDoctor === 'true') {
      toast.error('Access denied. Please login as a patient!');
      setTimeout(() => {
        return navigator('/patient-login');
      }, 1500);
    } else {
      const fetchData = async () => {
        const response = await authFetch('http://localhost:6969/patient/getByEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.status === 404) {
          toast.error('Patient not found');
          return;
        }

        if (response.status === 500) {
          toast.error('Internal server error');
          return;
        }

        const patientData = await response.json();
        if (!patientData.location) {
          toast.error('Please update your location');
          return;
        }
        setLocation(patientData.location);
        setloc(patientData.location);
        
        // Fetch stats after location is set
        fetchStatistics();
        setIsLoading(false); // Set loading to false after data is fetched
      };
      fetchData();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Toaster />
      {isLoading ? (
        <div className='flex justify-center items-center h-screen'>
          <div className='animate-pulse text-gray-500 text-xl font-semibold'>Loading...</div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 pt-20 pb-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Content Area */}
              <div className="w-full md:w-2/3 lg:w-3/4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {window.location.pathname === '/patient-dashboard/consultations' 
                        ? 'Your Consultations' 
                        : 'Available Doctors'}
                    </h2>
                    <div className="flex items-center">
                      {window.location.pathname !== '/patient-dashboard/pending' && (
                        <select 
                          className="block rounded-md px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 mr-3" 
                          onChange={handleLocationChange} 
                          value={location}
                        >
                          <option value={loc}>{loc} (Current location)</option>
                          <option value='Jaipur'>Jaipur</option>
                          <option value='Delhi'>Delhi</option>
                          <option value='Bangalore'>Bangalore</option>
                          <option value='Kharagpur'>Kharagpur</option>
                          <option value='Mumbai'>Mumbai</option>
                          <option value='Chennai'>Chennai</option>
                          <option value='Kolkata'>Kolkata</option>
                          <option value='Hyderabad'>Hyderabad</option>
                          <option value='Pune'>Pune</option>
                          <option value='Ahmedabad'>Ahmedabad</option>
                          <option value='Surat'>Srinagar</option>
                          <option value='Kanpur'>Kanpur</option>
                          <option value='Nagpur'>Nagpur</option>
                          <option value='Lucknow'>Lucknow</option>
                          <option value='Bhopal'>Bhopal</option>
                        </select>
                      )}
                      {window.location.pathname === '/patient-dashboard/consultations' ? (
                        <Link to='/patient-dashboard' className='flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
                          All Doctors
                        </Link>
                      ) : (
                        <Link to='/patient-dashboard/consultations' className='flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
                          Your Consultations
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <Routes>
                      <Route path='/' element={<DoctorData location={location} />} />
                      <Route path='/consultations' element={<Consultations />} />
                      <Route path='/patient-dashboard' element={<Outlet />} />
                    </Routes>
                  </div>
                </div>
              </div>
              
              {/* Sidebar Area */}
              <div className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-24 self-start">
                {/* Profile & Actions Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                    <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <button 
                      onClick={() => navigator('/patient-profile')}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => navigator('/update-profile')}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Update Profile
                    </button>
                    <button 
                      onClick={() => {
                        document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('isDoctor');
                        navigator('/patient-login');
                      }}
                      className="w-full px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
                
                {/* Stats Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                    <h2 className="text-lg font-semibold text-gray-800">My Health Summary</h2>
                  </div>
                  <div className="p-4">
                    {statistics.loading ? (
                      <div className="text-center py-3">
                        <div className="animate-pulse text-gray-400">Loading statistics...</div>
                      </div>
                    ) : statistics.error ? (
                      <div className="text-center text-red-500 py-3">{statistics.error}</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {statistics.pendingConsultations || 0}
                          </div>
                          <div className="text-xs text-gray-500">Pending Consultations</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {statistics.upcomingAppointments || 0}
                          </div>
                          <div className="text-xs text-gray-500">Upcoming Appointments</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-indigo-600">
                            {statistics.thisMonth || 0}
                          </div>
                          <div className="text-xs text-gray-500">This Month</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {statistics.totalVisits || 0}
                          </div>
                          <div className="text-xs text-gray-500">Total Visits</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDashBoard;