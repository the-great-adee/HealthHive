import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function UpdateProfile() {
	// Component to update profile of doctor or patient, performs checks as to whether every field is filled or not, and some specific to doctors, as specified below
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
			{isDoctor ? (
				<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-24 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img className='mx-auto h-10 w-auto' src='/logo.png' alt='OMCS' />
						<h2 className='mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>Update Your Profile</h2>
					</div>

					<div className='mt-2 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form className='space-y-6'>
							<div>
								<label htmlFor='name' className='block text-sm font-medium leading-6 text-gray-900'>
									Name
								</label>
								<div className='mt-1'>
									<input id='name' name='name' type='name' defaultValue={doctor.name} autoComplete='name' required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' />
								</div>
							</div>
							<div>
								<label htmlFor='specialisation' className='block text-sm font-medium leading-6 text-gray-900'>
									Specialisation
								</label>
								<div className='mt-1'>
									<input id='specialisation' name='specialisation' type='specialisation' defaultValue={doctor.specialisation} autoComplete='specialisation' required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' placeholder='Specialisations separated by commas, if more than one.' />
								</div>
							</div>
							<div>
								<label htmlFor='certification' className='block text-sm font-medium leading-6 text-gray-900'>
									Certification
								</label>
								<div className='mt-1'>
									<input id='certification' name='certification' type='certification' autoComplete='certification' defaultValue={doctor.certification} required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' />
								</div>
							</div>
							<div>
								<label htmlFor='clinic' className='block text-sm font-medium leading-6 text-gray-900'>
									Clinic Name
								</label>
								<div className='mt-1'>
									<input id='clinic' name='clinic' type='clinic' autoComplete='clinic' defaultValue={doctor.clinic} required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' />
								</div>
							</div>
							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='workingHours' className='block mb-2 text-sm font-medium text-gray-900'>
										Working Hours
									</label>
								</div>
								<div className='mt-1'>
									{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
										<div key={index} className='grid grid-cols-4 gap-x-4 gap-y-2 mt-1 mb-5'>
											<label htmlFor={`${day.toLowerCase()}-from`} className='block text-sm font-medium leading-6 text-gray-900 underline mt-1'>
												{day}:
											</label>
											<span id={`${day.toLowerCase()}-from-span`} className='block text-sm font-medium leading-6 text-gray-900 ml-2 mt-1'>
												From: {doctor.workingHours && doctor.workingHours[index] ? doctor.workingHours[index].from : ''}{' '}
											</span>
											<span id={`${day.toLowerCase()}-to-span`} className='block text-sm font-medium leading-6 text-gray-900 ml-2 mt-1'>
												To: {doctor.workingHours && doctor.workingHours[index] ? doctor.workingHours[index].to : ''}{' '}
											</span>
											<button
												id={`${day.toLowerCase()}-remove`}
												type='button'
												className='rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
												onClick={(e) => {
													document.getElementById(`${day.toLowerCase()}-from-span`).innerText = 'From:';
													document.getElementById(`${day.toLowerCase()}-to-span`).innerText = 'To:';
												}}
											>
												Remove
											</button>
											<span className='block text-sm font-medium leading-6 text-gray-900 mt-1'>Edit Timings: </span>
											<input id={`${day.toLowerCase()}-from`} name={`${day.toLowerCase()}-from`} type='time' autoComplete={`${day.toLowerCase()}-from`} required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 mx-2' />
											<input id={`${day.toLowerCase()}-to`} name={`${day.toLowerCase()}-to`} type='time' autoComplete={`${day.toLowerCase()}-to`} required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 mx-2' />
											<button
												id={`${day.toLowerCase()}-reset`}
												type='button'
												className='rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
												onClick={(e) => {
													document.getElementById(`${day.toLowerCase()}-from`).value = '';
													document.getElementById(`${day.toLowerCase()}-to`).value = '';
												}}
											>
												Reset
											</button>
										</div>
									))}
								</div>
							</div>
							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='countries' className='block mb-2 text-sm font-medium text-gray-900'>
										Select Location
									</label>
								</div>
								<div className='mt-1'>
									<select id='countries' className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6'>
										{doctor.location === '' ? <option selected>Choose a location</option> : <option selected>{doctor.location}</option>}
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
								</div>
							</div>

							<div>
								<button type='submit' className='flex w-full justify-center  rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600' onClick={handleUpdate}>
									Update Now
								</button>
							</div>
						</form>
					</div>
				</div>
			) : (
				<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-24 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img className='mx-auto h-10 w-auto' src='/logo.png' alt='Your Company' />
						<h2 className='mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>Update Your Profile</h2>
					</div>

					<div className='mt-2 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form className='space-y-6'>
							<div>
								<label htmlFor='name' className='block text-sm font-medium leading-6 text-gray-900'>
									Name
								</label>
								<div className='mt-1'>
									<input id='name' name='name' defaultValue={patient.name} type='name' autoComplete='name' required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' />
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='age' className='block text-sm font-medium leading-6 text-gray-900'>
										Age
									</label>
								</div>
								<div className='mt-1'>
									<input id='age' name='age' type='age' defaultValue={patient.age} autoComplete='current-age' required className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6' />
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='countries' className='block mb-2 text-sm font-medium text-gray-900'>
										Select Location
									</label>
								</div>
								<div className='mt-1'>
									<select id='countries' className='block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6'>
										{patient.location === '' ? <option selected>Choose a location</option> : <option selected>{patient.location}</option>}
										<option value='Jaipur'>Jaipur</option>
										<option value='Delhi'>Delhi</option>
										<option value='Bangalore'>Bangalore</option>
										<option value='Kharagpur'>Kharagpur</option>
									</select>
								</div>
							</div>

							<div>
								<button type='submit' className='flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600' onClick={handleUpdate}>
									Update Now
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default UpdateProfile;
