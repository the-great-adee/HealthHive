import React, { useState, useEffect } from 'react';
import PendingData from '../Components/Doctor/PendingData';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; // Make sure axios is installed

const DoctorDashBoard = () => {
  const navigator = useNavigate();
  const isDoctor = localStorage.getItem('isDoctor');
  const [statistics, setStatistics] = useState({
    todayAppointments: 0,
    pendingConsultations: 0,
    thisWeek: 0,
    totalCompleted: 0,
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

        console.log('Fetching statistics for doctor:', userEmail);

        const response = await axios.post('http://localhost:6969/appointment/getStatistics', 
            { doctor: userEmail }, 
            {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            }
        );

        console.log('Statistics Response:', response.data); // Log the response data for debugging

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
        toast.error('Failed to load statistics');
    }
};


  useEffect(() => {
    const jwtToken = getJwtToken();
    if (!jwtToken) {
      toast.error('Access denied. Please login first!');
      setTimeout(() => {
        return navigator('/doctor-login');
      }, 1500);
    } else if (isDoctor === 'false') {
      toast.error('Access denied. Please login as a doctor!');
      setTimeout(() => {
        return navigator('/doctor-login');
      }, 1500);
    } else {
      // Fetch statistics if authentication passes
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content Area */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
            
            <div className="space-y-8">
              {/* Pending Consultations Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                  <h2 className="text-lg font-semibold text-gray-800">Pending Consultations</h2>
                </div>
                <div className="p-4">
                  <PendingData status="consultation" />
                </div>
              </div>
              
              {/* Booked Appointments Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <h2 className="text-lg font-semibold text-gray-800">Booked Appointments</h2>
                </div>
                <div className="p-4">
                  <PendingData status="appointment" />
                </div>
              </div>
              
              {/* Completed Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Completed</h2>
                </div>
                <div className="p-4">
                  <PendingData status="completed" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Area - Profile */}
          <div className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-24 self-start">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigator('/doctor-profile')}
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
                    navigator('/doctor-login');
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
                <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>
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
                        {statistics.todayAppointments}
                      </div>
                      <div className="text-xs text-gray-500">Today's Appointments</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {statistics.pendingConsultations}
                      </div>
                      <div className="text-xs text-gray-500">Pending Consultations</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {statistics.thisWeek}
                      </div>
                      <div className="text-xs text-gray-500">This Week</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {statistics.totalCompleted}
                      </div>
                      <div className="text-xs text-gray-500">Total Completed</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashBoard;