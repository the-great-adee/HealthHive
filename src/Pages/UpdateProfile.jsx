import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function UpdateProfile() {
  const navigator = useNavigate();
  const [doctor, setDoctor] = useState({});
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

  const isDoctor = localStorage.getItem('isDoctor') === 'true';
  const email = localStorage.getItem('userEmail');

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
    const jwtToken = getJwtToken();
    if (!jwtToken) {
      console.log('You are not logged in. Please login to continue!');
      toast.error('You are not logged in. Please login to continue!');
      setTimeout(() => (isDoctor ? navigator('/doctor-login') : navigator('/patient-login')), 2000);
    }
    async function fetchData() {
      if (isDoctor) {
        const response = await authFetch('http://localhost:6969/doctor/getByEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        if (response.status === 404) setDoctor({});
        if (response.status === 500) alert('Internal server error');
        const data = await response.json();
        return setDoctor(data);
      } else {
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
      }
    }
    fetchData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      if (isDoctor) {
        const _id = doctor._id;
        const name = document.getElementById('name').value;
        if (name === '') return toast.error('Name cannot be empty');
        const specialisation = document.getElementById('specialisation').value;
        if (specialisation === '') return toast.error('Specialisation cannot be empty');
        const certification = document.getElementById('certification').value;
        const clinic = document.getElementById('clinic').value;
        if (clinic === '') return toast.error('Clinic name cannot be empty');
        const location = document.getElementById('countries').value;
        if (location === 'Choose a location') return toast.error('Please select a location');
        const workingHours = [
          {
            day: 'Monday',
            from: document.getElementById('monday-from').value === '' ? (document.getElementById('monday-from-span').innerText.includes(': ') ? document.getElementById('monday-from-span').innerText.split(': ')[1] : '') : document.getElementById('monday-from').value,
            to: document.getElementById('monday-to').value === '' ? (document.getElementById('monday-to-span').innerText.includes(': ') ? document.getElementById('monday-to-span').innerText.split(': ')[1] : '') : document.getElementById('monday-to').value,
          },
          {
            day: 'Tuesday',
            from: document.getElementById('tuesday-from').value === '' ? (document.getElementById('tuesday-from-span').innerText.includes(': ') ? document.getElementById('tuesday-from-span').innerText.split(': ')[1] : '') : document.getElementById('tuesday-from').value,
            to: document.getElementById('tuesday-to').value === '' ? (document.getElementById('tuesday-to-span').innerText.includes(': ') ? document.getElementById('tuesday-to-span').innerText.split(': ')[1] : '') : document.getElementById('tuesday-to').value,
          },
          {
            day: 'Wednesday',
            from: document.getElementById('wednesday-from').value === '' ? (document.getElementById('wednesday-from-span').innerText.includes(': ') ? document.getElementById('wednesday-from-span').innerText.split(': ')[1] : '') : document.getElementById('wednesday-from').value,
            to: document.getElementById('wednesday-to').value === '' ? (document.getElementById('wednesday-to-span').innerText.includes(': ') ? document.getElementById('wednesday-to-span').innerText.split(': ')[1] : '') : document.getElementById('wednesday-to').value,
          },
          {
            day: 'Thursday',
            from: document.getElementById('thursday-from').value === '' ? (document.getElementById('thursday-from-span').innerText.includes(': ') ? document.getElementById('thursday-from-span').innerText.split(': ')[1] : '') : document.getElementById('thursday-from').value,
            to: document.getElementById('thursday-to').value === '' ? (document.getElementById('thursday-to-span').innerText.includes(': ') ? document.getElementById('thursday-to-span').innerText.split(': ')[1] : '') : document.getElementById('thursday-to').value,
          },
          {
            day: 'Friday',
            from: document.getElementById('friday-from').value === '' ? (document.getElementById('friday-from-span').innerText.includes(': ') ? document.getElementById('friday-from-span').innerText.split(': ')[1] : '') : document.getElementById('friday-from').value,
            to: document.getElementById('friday-to').value === '' ? (document.getElementById('friday-to-span').innerText.includes(': ') ? document.getElementById('friday-to-span').innerText.split(': ')[1] : '') : document.getElementById('friday-to').value,
          },
          {
            day: 'Saturday',
            from: document.getElementById('saturday-from').value === '' ? (document.getElementById('saturday-from-span').innerText.includes(': ') ? document.getElementById('saturday-from-span').innerText.split(': ')[1] : '') : document.getElementById('saturday-from').value,
            to: document.getElementById('saturday-to').value === '' ? (document.getElementById('saturday-to-span').innerText.includes(': ') ? document.getElementById('saturday-to-span').innerText.split(': ')[1] : '') : document.getElementById('saturday-to').value,
          },
          {
            day: 'Sunday',
            from: document.getElementById('sunday-from').value === '' ? (document.getElementById('sunday-from-span').innerText.includes(': ') ? document.getElementById('sunday-from-span').innerText.split(': ')[1] : '') : document.getElementById('sunday-from').value,
            to: document.getElementById('sunday-to').value === '' ? (document.getElementById('sunday-to-span').innerText.includes(': ') ? document.getElementById('sunday-to-span').innerText.split(': ')[1] : '') : document.getElementById('sunday-to').value,
          },
        ];

        console.log(workingHours);
        let flag = false;

        workingHours.forEach((workingHour) => {
          // Checking if all working hours are filled
          if (workingHour.from !== '' || workingHour.to !== '') {
            if (workingHour.from === '' || workingHour.to === '') {
              flag = true;
              return toast.error('Please fill all the working hours for ' + workingHour.day);
            }
          }

          const fromArr = workingHour.from.split(':');
          const toArr = workingHour.to.split(':');

          // Checking if from time is later than to time
          if (parseInt(fromArr[0]) > parseInt(toArr[0])) {
            flag = true;
            return toast.error('From time cannot be later than To time for ' + workingHour.day);
          }

          if (parseInt(fromArr[0]) === parseInt(toArr[0])) {
            if (parseInt(fromArr[1]) >= parseInt(toArr[1])) {
              flag = true;
              return toast.error('From time cannot be later than To time for ' + workingHour.day);
            }
          }
        });

        if (flag === true) return;

        const updatedDoctor = {
          _id,
          name,
          email,
          specialisation,
          certification,
          clinic,
          location,
          workingHours,
        };

        const response = await authFetch('http://localhost:6969/doctor/updateDoctor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDoctor),
        });

        if (response.status === 500) return alert('Internal server error');
        if (response.status === 404) return alert('Doctor not found');
        if (response.status === 200) {
          toast.success('Doctor updated successfully');
          setTimeout(() => {
            navigator('/doctor-dashboard');
            return;
          }, 2000);
        }
      } else {
        const _id = patient._id;
        const name = document.getElementById('name').value;
        if (name === '') return toast.error('Name cannot be empty');
        const age = document.getElementById('age').value;
        if (age === '') return toast.error('Age cannot be empty');
        const location = document.getElementById('countries').value;
        if (location === 'Choose a location') return toast.error('Please select a location');

        const updatedPatient = {
          _id,
          name,
          email,
          age,
          location,
        };

        const response = await authFetch('http://localhost:6969/patient/updatePatient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPatient),
        });

        if (response.status === 500) return alert('Internal server error');
        if (response.status === 404) return alert('Patient not found');
        if (response.status === 200) {
          toast.success('Patient updated successfully');
          setTimeout(() => {
            navigator('/patient-dashboard');
            return;
          }, 2000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="container mx-auto mt-20 px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-green-50 flex items-center justify-center flex-col">
            <img className="h-12 w-auto mb-3" src="/logo.png" alt="OMCS" />
            <h3 className="text-2xl font-semibold text-gray-800">Update Your Profile</h3>
            <p className="mt-1 text-sm text-gray-600">
              {isDoctor ? "Update your doctor information" : "Update your patient information"}
            </p>
          </div>
          
          <div className="p-6">
            {isDoctor ? (
              /* Doctor Form */
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      defaultValue={doctor.name} 
                      autoComplete="name" 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="specialisation" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialisation
                    </label>
                    <input 
                      id="specialisation" 
                      name="specialisation" 
                      type="text" 
                      defaultValue={doctor.specialisation} 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                      placeholder="Specialisations separated by commas, if more than one." 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                      Certification
                    </label>
                    <input 
                      id="certification" 
                      name="certification" 
                      type="text" 
                      defaultValue={doctor.certification} 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clinic" className="block text-sm font-medium text-gray-700 mb-1">
                      Clinic Name
                    </label>
                    <input 
                      id="clinic" 
                      name="clinic" 
                      type="text" 
                      defaultValue={doctor.clinic} 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="countries" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select 
                    id="countries" 
                    className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  >
                    {doctor.location === '' ? <option selected>Choose a location</option> : <option selected>{doctor.location}</option>}
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Kharagpur">Kharagpur</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Srinagar</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Bhopal">Bhopal</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Working Hours</h4>
                  
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                      <div className="flex flex-wrap items-center mb-2">
                        <span className="w-full sm:w-auto font-medium text-gray-800 mr-4 mb-2 sm:mb-0">
                          {day}
                        </span>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mr-4">
                          <span id={`${day.toLowerCase()}-from-span`}>
                            From: {doctor.workingHours && doctor.workingHours[index] ? doctor.workingHours[index].from : ''}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mr-4">
                          <span id={`${day.toLowerCase()}-to-span`}>
                            To: {doctor.workingHours && doctor.workingHours[index] ? doctor.workingHours[index].to : ''}
                          </span>
                        </div>
                        
                        <button
                          id={`${day.toLowerCase()}-remove`}
                          type="button"
                          className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                          onClick={() => {
                            document.getElementById(`${day.toLowerCase()}-from-span`).innerText = 'From:';
                            document.getElementById(`${day.toLowerCase()}-to-span`).innerText = 'To:';
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-600">Edit:</span>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-500">From</label>
                          <input 
                            id={`${day.toLowerCase()}-from`}
                            name={`${day.toLowerCase()}-from`}
                            type="time"
                            className="block rounded-md px-2 py-1 border border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-500">To</label>
                          <input 
                            id={`${day.toLowerCase()}-to`}
                            name={`${day.toLowerCase()}-to`}
                            type="time"
                            className="block rounded-md px-2 py-1 border border-gray-300 text-sm focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        
                        <button
                          id={`${day.toLowerCase()}-reset`}
                          type="button"
                          className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                          onClick={() => {
                            document.getElementById(`${day.toLowerCase()}-from`).value = '';
                            document.getElementById(`${day.toLowerCase()}-to`).value = '';
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            ) : (
              /* Patient Form */
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      defaultValue={patient.name} 
                      autoComplete="name" 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input 
                      id="age" 
                      name="age" 
                      type="number" 
                      defaultValue={patient.age} 
                      className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="countries" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select 
                    id="countries" 
                    className="block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  >
                    {patient.location === '' ? <option selected>Choose a location</option> : <option selected>{patient.location}</option>}
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Kharagpur">Kharagpur</option>
                  </select>
                </div>
              </form>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
            <button 
              type="button" 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              onClick={() => navigator(isDoctor ? '/doctor-dashboard' : '/patient-dashboard')}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              onClick={handleUpdate}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateProfile;