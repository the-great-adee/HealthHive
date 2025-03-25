import React from 'react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import PendingCard from './PendingCard';
function PendingData({ status }) {
	const [Data, setData] = useState([]);
	const [isData, setIsData] = useState(false);
	const [isLoading, setLoading] = useState(true);

	const doctorEmail = localStorage.getItem('userEmail');
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

	const jwtToken = getJwtToken();

	useEffect(() => {
		if (!jwtToken) {
			toast.error('Session expired. Please login again');
			return window.location.href('/doctor-login');
		}

		const fetchData = async () => {
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
				console.log(doctor);
				const patients = doctor.patients;
				if (status === 'consultation') {
					patients.map(async (patient) => {
						if (patient.status === 'consultation') {
							const patientResponse = await fetch('http://localhost:6969/patient/getByEmail', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${jwtToken}`,
								},
								body: JSON.stringify({ email: patient.email }),
							});
							if (patientResponse.status === 500) {
								return toast.error('Internal server error');
							}
							const patientData = await patientResponse.json();
							console.log(patientData);
							const tempData = {
								name: patientData.name,
								age: patientData.age,
								symptoms: patient.symptoms,
								location: patientData.location,
								email: patientData.email,
							};
							setData((prevData) => [...prevData, tempData]);
							setIsData(true);
						}
					});
				} else if (status === 'completed') {
					patients.map(async (patient) => {
						if (patient.status === 'completed') {
							const patientResponse = await fetch('http://localhost:6969/patient/getByEmail', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${jwtToken}`,
								},
								body: JSON.stringify({ email: patient.email }),
							});
							if (patientResponse.status === 500) {
								return toast.error('Internal server error');
							}
							const patientData = await patientResponse.json();
							const tempData = {
								name: patientData.name,
								age: patientData.age,
								symptoms: patient.symptoms,
								location: patientData.location,
								email: patientData.email,
								id: patient.id,
								feedback: patient.feedback,
								completed: patient.completionDate,
							};
							console.log(tempData);
							setData((prevData) => [...prevData, tempData]);
							setIsData(true);
						}
					});
				} else if (status === 'appointment') {
					const doctorObject = {
						email: doctorEmail,
					};
					const appointmentsResponse = await fetch('http://localhost:6969/appointment/getAppointmentsByDoctor', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${jwtToken}`,
						},
						body: JSON.stringify({ doctor: doctorObject }),
					});
					if (appointmentsResponse.status === 500) {
						return toast.error('Internal server error');
					}
					const appointments = await appointmentsResponse.json();
					appointments.map(async (appointment) => {
						const patientResponse = await fetch('http://localhost:6969/patient/getByEmail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${jwtToken}`,
							},
							body: JSON.stringify({ email: appointment.patient.email }),
						});
						if (patientResponse.status === 500) {
							return toast.error('Internal server error');
						}
						const patientData = await patientResponse.json();
						const symptoms = patientData.doctor.map((doctor) => {
							if (doctor.email === doctorEmail && doctor.status === 'appointment') {
								return doctor.symptoms;
							}
							return null;
						});
						const tempData = {
							name: patientData.name,
							age: patientData.age,
							symptoms: symptoms,
							location: patientData.location,
							email: patientData.email,
							date: appointment.date.split('T')[0],
							time: appointment.time,
							id: appointment._id,
						};
						console.log(tempData);
						setData((prevData) => [...prevData, tempData]);
						setIsData(true);
					});
				}
				console.log(Data);
			} catch (e) {
				console.log(e);
			}
		};
		fetchData();
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			<Toaster />
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<div className={`flex flex-wrap max-w-screen-lg mx-auto px-5 w-full`}>
					{isData ? (
						Data.map((data, index) => <PendingCard key={index} data={data} status={status} />)
					) : (
						<div className='p-5 m-2 border-solid border-2 border-red-600 rounded-lg shadow-md bg-stone-100 hover:scale-105 transition-all m-auto'>
							<div className='flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row'>
								<div className=''>
									<h4 className='text-lg font-bold text-left mx-2 text-red-700'>{status === 'consultation' ? 'No Pending Consultations' : status === 'appointment' ? 'No Upcoming Appointments' : 'No Completed Appointments'}</h4>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}

export default PendingData;
