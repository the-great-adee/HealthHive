import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientProfile = () => {
  const navigator = useNavigate();
  const email = localStorage.getItem('userEmail');
  const [patient, setPatient] = useState({});

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

  const authFetch = async (url, options = {}) => {
    const token = getJwtToken();

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return await fetch(url, {
      ...options,
      headers: headers,
    });
  };

  useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      alert('Access denied. Please login first!');
      navigator('/patient-login');
    }

    const fetchPatient = async () => {
      try {
        const response = await authFetch('http://localhost:6969/patient/getByEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        if (response.status === 404) setPatient({});
        if (response.status === 500) alert('Internal server error');
        const data = await response.json();
        return setPatient(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPatient();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleEdit = () => {
    navigator('/update-profile');
  };

  const handleBack = () => {
    navigator('/patient-dashboard');
  };

  return (
    <div className="container mx-auto mt-20 px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-green-50">
          <h3 className="text-2xl font-semibold text-gray-800">Patient Information</h3>
          <p className="mt-1 text-sm text-gray-600">Your personal details</p>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="text-sm text-gray-900 col-span-2">{patient.name}</dd>
          </div>

          <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-gray-50">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="text-sm text-gray-900 col-span-2">{patient.email}</dd>
          </div>

          <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white">
            <dt className="text-sm font-medium text-gray-500">Age</dt>
            <dd className="text-sm text-gray-900 col-span-2">{patient.age}</dd>
          </div>

          <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-gray-50">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="text-sm text-gray-900 col-span-2">{patient.location}</dd>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <button
            className="px-5 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            onClick={handleBack}
          >
            Back to Dashboard
          </button>
          <button
            className="px-5 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            onClick={handleEdit}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
