import React from 'react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function TableCard(data) {
	const [showModal, setShowModal] = useState(false);
	const handleCloseModal = () => {
		setShowModal(false);
	};
	const handleFeedback = () => {
		setShowModal(true);
	};

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

	const windowReload = () => {
		window.location.reload();
	};

	const jwtToken = getJwtToken();
	const patientEmail = localStorage.getItem('userEmail');

	// Function to handle feedback submission from patient's side
	const handleFeedbackSubmit = async () => {
		if (!jwtToken) {
			toast.error('Session expired. Please login again');
			return window.location.href('/patient-login');
		}
		const feedback = document.getElementById('feedback-text').value;
		if (feedback === '') {
			toast.error('Feedback cannot be empty');
			return;
		}

		try {
			const response = await fetch('http://localhost:6969/patient/getByEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${jwtToken}`,
				},
				body: JSON.stringify({ email: patientEmail }),
			});
			if (response.status === 500) {
				return toast.error('Internal server error');
			}
			const patient = await response.json();
			const doctorEmail = data.email;

			let bound = false;
			let id;
			patient.doctor.map((doctor) => {
				if (bound) return null;
				if (doctor.status === 'completed') {
					if (doctor.email === doctorEmail) {
						if (new Date(new Date(doctor.completionDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]) {
							toast.error('Feedback can only be given within 7 days of consultation completion');
							bound = true;
							id = doctor.id;
							setTimeout(async () => {
								toast.error('Deleting completed consultation...');
								const doctor_to_remove = patient.doctor.findIndex((doctor) => doctor.id === id);
								if (doctor_to_remove === -1) {
									throw new Error("Doctor not found in patient's doctor list");
								}
								patient.doctor.splice(doctor_to_remove, 1);

								try {
									const updatePatientResponse = await fetch('http://localhost:6969/patient/updatePatient', {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
											Authorization: `Bearer ${jwtToken}`,
										},
										body: JSON.stringify(patient),
									});
									if (updatePatientResponse.status === 500) {
										return toast.error('Internal server error');
									} else {
										const updatePatient = await updatePatientResponse.json();
										if (updatePatient) {
											console.log('Doctor removed: ', updatePatient);
										}
									}

									try {
										const doctorResponse = await fetch('http://localhost:6969/doctor/getByEmail', {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
												Authorization: `Bearer ${jwtToken}`,
											},
											body: JSON.stringify({ email: doctorEmail }),
										});
										if (doctorResponse.status === 500) {
											return toast.error('Internal server error');
										}
										const doctor = await doctorResponse.json();
										const patient_to_remove = doctor.patients.findIndex((patient) => patient.id === data.id);

										if (patient_to_remove === -1) {
											throw new Error("Patient not found in doctor's patient list");
										}
										doctor.patients.splice(patient_to_remove, 1);

										try {
											const updateDoctorResponse = await fetch('http://localhost:6969/doctor/updateDoctor', {
												method: 'POST',
												headers: {
													'Content-Type': 'application/json',
													Authorization: `Bearer ${jwtToken}`,
												},
												body: JSON.stringify(doctor),
											});
											if (updateDoctorResponse.status === 500) {
												return toast.error('Internal server error');
											} else {
												const updateDoctor = await updateDoctorResponse.json();
												if (updateDoctor) {
													console.log('Patient removed: ', updateDoctor);
												}
												windowReload();
											}
										} catch (error) {
											console.error(error);
										}
									} catch (error) {
										console.error(error);
									}
								} catch (error) {
									console.error(error);
								}
							}, 2000);
						} else {
							doctor.feedback = feedback;
						}
					}
				}
				return null;
			});

			if (bound) {
				return;
			}

			try {
				const doctorResponse = await fetch('http://localhost:6969/doctor/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${jwtToken}`,
					},
					body: JSON.stringify({ email: doctorEmail }),
				});
				if (doctorResponse.status === 500) {
					return toast.error('Internal server error');
				}
				const doctor = await doctorResponse.json();
				doctor.patients.map((patient) => {
					if (patient.id === data.id) {
						patient.feedback = feedback;
					}
					return null;
				});

				try {
					const updateDoctorResponse = await fetch('http://localhost:6969/doctor/updateDoctor', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${jwtToken}`,
						},
						body: JSON.stringify(doctor),
					});
					if (updateDoctorResponse.status === 500) {
						return toast.error('Internal server error');
					} else {
						const updateDoctor = await updateDoctorResponse.json();
						if (updateDoctor) {
							console.log('Feedback submitted: ', updateDoctor);
							toast.success('Feedback submitted successfully');
							try {
								const response = await fetch('http://localhost:6969/email/sendMail', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										Authorization: `Bearer ${jwtToken}`,
									},
									body: JSON.stringify({
										to: doctorEmail,
										from: patientEmail,
										context: 'feedback',
										receiver_name: data.name,
										sender_name: patient.name,
									}),
								});
								if (response.status === 500) {
									return toast.error('Internal server error');
								} else {
									const mail = await response.json();
									if (mail) {
										console.log('Mail sent: ', mail);
									}
								}
							} catch (error) {
								console.log(error);
							}
							setTimeout(() => {
								setShowModal(false);
								document.getElementById('feedback-text').value = '';
							});
						}
					}
				} catch (error) {
					console.error(error);
				}
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<>
			<Toaster />
			{showModal && (
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
												Feedback
											</h1>
											<div className='absolute right-5'>
												<button onClick={handleCloseModal} className=' hover:bg-gray-100 transition-all rounded' style={{ right: '0' }}>
													&#10060;
												</button>
											</div>
										</div>
										<div className='mt-10'>
											<div className='text-md font-bold text-left'>
												Doctor - <span className='text-gray-600 font-semibold text-sm '>{data.name}</span>
											</div>
											<div className='text-md font-bold text-left'>
												Specialisation - <span className='text-gray-600 font-semibold text-sm '>{data.specialisation}</span>
											</div>
											<div className='text-md font-bold text-left'>
												Symptoms - <span className='text-gray-600 font-semibold text-sm '>{data.symptoms}</span>
											</div>
											<div className='text-md font-bold md:text-left'>
												Clinic - <span className='text-gray-600 font-semibold text-sm'>{data.clinic}</span>
											</div>
											<div className='text-md font-bold md:text-left'>
												Location - <span className='text-gray-600 font-semibold text-sm'>{data.location}</span>
											</div>
											{data.feedback === '' || !data.feedback ? null : (
												<div className='text-md font-bold md:text-left mt-2'>
													Reply from Doctor - <span className='text-gray-600 font-semibold text-sm'>{data.feedback}</span>
												</div>
											)}
										</div>

										<>
											<div className='mt-2'>
												<div className='text-md font-bold md:text-left'>Feedback:</div>
												<textarea type='text' id='feedback-text' className='min-h-20 w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Feedback' />
											</div>
											<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
												<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handleFeedbackSubmit}>
													Submit
												</button>
											</div>
										</>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			<tr class='border-b hover:bg-gray-100'>
				<td class='whitespace-nowrap px-6 py-4 font-medium '>{data.sr}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>{data.name}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>{data.specialisation}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>{data.symptoms}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>{data.clinic}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>{data.location}</td>
				<td class='whitespace-nowrap px-6 py-4 font-normal'>
					<button className=' inline-flex justify-center rounded-md border border-transparent text-green-600 text-base font-medium hover:text-green-700 focus:outline-none sm:w-auto sm:text-sm' onClick={handleFeedback}>
						Feedback
					</button>
				</td>
			</tr>
		</>
	);
}
