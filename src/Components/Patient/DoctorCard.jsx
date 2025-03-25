import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function DoctorCard(props) {
	const renderableWorkingHours = props.workingHours.filter((workingHour) => workingHour.from !== '' && workingHour.to !== '');

	const [showModal, setShowModal] = useState(false);
	const [inputValue, setInputValue] = useState('');

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
		if (!token) {
			toast.error('Session expired. Please login again');
			return window.location.href('/patient-login');
		}

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

	const handleOpenModal = () => {
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	const handlePrescriptionSubmit = async () => {
		const doctorEmail = props.email;
		const patientEmail = localStorage.getItem('userEmail');
		const symptoms = inputValue;
		let dupFlag = false;
		try {
			const patientResponse = await authFetch('http://localhost:6969/patient/getByEmail', {
				// API endpoint to get patient by email
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: patientEmail,
				}),
			});
			if (patientResponse.status === 500) {
				return toast.error('Internal server error');
			}
			const patient = await patientResponse.json();
			patient.doctor.map((doctor) => {
				// Check if a previous consultation request already exists
				if (!dupFlag) {
					if (doctor.email === doctorEmail) {
						if (doctor.status === 'consultation') {
							dupFlag = true;
							return toast.error('A previous consultation request already exists. Please wait for the Doctor to respond.');
						}
					}
				}
				return null;
			});

			if (!dupFlag) {
				const patientDataToUpdate = {
					// Update patient data with new consultation request
					email: patientEmail,
					$push: {
						doctor: {
							email: doctorEmail,
							status: 'consultation',
							symptoms: symptoms,
						},
					},
				};

				const response = await authFetch('http://localhost:6969/patient/updatePatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(patientDataToUpdate),
				});
				if (response.ok) {
					const updatedPatient = await response.json();
					console.log('Patient updated successfully:', updatedPatient);
					toast.success('Consultation request sent successfully');
					setTimeout(() => {
						handleCloseModal();
					}, 2000);
				} else {
					const errorMessage = await response.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}
			}
		} catch (error) {
			console.error(error);
			toast.error('Internal server error');
			return;
		}
		let dupFlag2 = false;
		if (!dupFlag) {
			try {
				const doctorResponse = await authFetch('http://localhost:6969/doctor/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: doctorEmail,
					}),
				});
				if (doctorResponse.status === 500) {
					return toast.error('Internal server error');
				}
				const doctor = await doctorResponse.json();
				doctor.patients.map((patient) => {
					// Check if a previous consultation request already exists
					if (!dupFlag2) {
						if (patient.email === patientEmail) {
							if (patient.status === 'consultation') {
								dupFlag2 = true;
								return toast.error('A previous consultation request already exist. Please wait for the Doctor to respond.');
							}
						}
					}
					return null;
				});

				if (!dupFlag2) {
					const doctorResponse2 = await authFetch('http://localhost:6969/doctor/updateDoctor', {
						// Update doctor data with new consultation request
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: doctorEmail,
							$push: {
								patients: {
									email: patientEmail,
									status: 'consultation',
									symptoms: symptoms,
								},
							},
						}),
					});

					if (doctorResponse2.ok) {
						const updatedDoctor = await doctorResponse2.json();
						console.log('Doctor updated successfully:', updatedDoctor);
					} else if (doctorResponse2.status === 500) {
						return toast.error('Internal server error');
					}
				}
			} catch (e) {
				console.error(e);
			}
		}
		setInputValue('');
	};

	return (
		<>
			<Toaster />
			{showModal && ( // Modal for consultation form
				<div className='fixed inset-0 z-10 overflow-y-auto ' aria-labelledby='modal-title' role='dialog' aria-modal='true'>
					<div className='flex flex-col items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
						<div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' aria-hidden='true'></div>
						<span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
							&#8203;
						</span>
						<div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full'>
							<div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
								<div className=' sm:items-start text-center'>
									<div className='mt-3 text-center sm:mt-0  sm:text-left'>
										<div className='flex flex-row justify-center'>
											<h1 className='text-2xl leading-6 font-medium text-gray-900' id='modal-title'>
												Consultation Form
											</h1>
											<div className='absolute right-5'>
												<button onClick={handleCloseModal} className=' hover:bg-gray-100 transition-all rounded' style={{ right: '0' }}>
													&#10060;
												</button>
											</div>
										</div>
										<div className='mt-10'>
											<div className='text-md font-bold text-left'>
												Doctor - <span className='text-gray-600 font-semibold text-sm '>{props.name}</span>
											</div>
											<div className='text-md font-bold text-left'>
												Specialisation - <span className='text-gray-600 font-semibold text-sm '>{props.specialisation}</span>
											</div>
											<div className='text-md font-bold md:text-left'>
												Clinic - <span className='text-gray-600 font-semibold text-sm'>{props.clinic}</span>
											</div>
											<div>
												<div className='text-md font-bold md:text-left mb-2'>Please fill your symptoms-</div>
												<textarea type='text' value={inputValue} onChange={handleInputChange} className='min-h-20 w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='List your symptoms separated by commas' />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
								<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handlePrescriptionSubmit}>
									Submit {/* Submit button  which calls a function to handle consultation request*/}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}{' '}
			{/* Modal ends here */}
			<div className='p-5 m-2 w-full border-solid border-2 border-green-600  rounded-lg shadow-md bg-stone-100 hover:scale-105 transition-all 	'>
				<div className='flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row'>
					<div className=''>
						<h4 className='text-lg font-bold text-left mx-2'>Dr. {props.name}</h4>
						<div className='flex'>
							<div className='mx-2'>
								<div className='text-md font-bold text-left'>
									Specialisation - <span className='text-gray-600 font-semibold text-sm '>{props.specialisation}</span>
								</div>
								<div className='text-md font-bold md:text-left'>
									Clinic - <span className='text-gray-600 font-semibold text-sm'>{props.clinic}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='mx-2'>
					<div className='text-md font-bold text-left'>
						Working Hours -
						<span className='text-gray-600 font-semibold text-sm ml-1'>
							{renderableWorkingHours.map((workingHour, index) => (
								<span key={index}>
									{workingHour.day} - {workingHour.from} to {workingHour.to}
									{index !== renderableWorkingHours.length - 1 && ', '}
								</span>
							))}
						</span>
					</div>
					<div className='text-md font-bold text-left'>
						Location - <span className='text-gray-600 font-semibold text-sm'>{props.location}</span>
					</div>
				</div>
				<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handleOpenModal}>
					Book
				</button>
			</div>
		</>
	);
}
