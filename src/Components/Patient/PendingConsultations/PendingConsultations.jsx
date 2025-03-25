import React from 'react';
import TableCard from './CardforPending';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

function PendingData() {
	const [Data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [isData, setIsData] = useState(false);
	const email = localStorage.getItem('userEmail');

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
			return window.location.href('/patient-login');
		}
		const fetchPatient = async () => {
			try {
				const response = await fetch('http://localhost:6969/patient/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${jwtToken}`,
					},
					body: JSON.stringify({ email }),
				});
				if (response.status === 404) {
					toast.error('Patient not found');
				}
				if (response.status === 500) {
					toast.error('Internal server error');
				}
				const patient = await response.json();
				let srno = 0;
				patient.doctor.map(async (doctor) => {
					if (doctor.status !== 'consultation') {
						return null;
					}
					try {
						const response = await fetch('http://localhost:6969/doctor/getByEmail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${jwtToken}`,
							},
							body: JSON.stringify({ email: doctor.email }),
						});

						if (response.status === 404) {
							toast.error('Doctor not found');
							return null;
						}

						if (response.status === 500) {
							toast.error('Internal server error');
							return null;
						}

						const doctorData = await response.json();
						srno++;
						setData((prevData) => [
							...prevData,
							{
								sr: srno,
								name: doctorData.name,
								specialisation: doctorData.specialisation,
								clinic: doctorData.clinic,
								location: doctorData.location,
								symptoms: doctor.symptoms,
							},
						]);
						console.log(srno);
						setIsData(true);
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
					}
				});
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
			}
		};
		fetchPatient();
		setLoading(false);
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jwtToken]);
	return (
		<>
			<Toaster />
			{isLoading ? (
				<div className='flex justify-center items-center h-screen'>Loading...</div>
			) : (
				<>
					{isData ? (
						<>
							<div class='flex flex-col overflow-x-auto'>
								<div class='sm:-mx-6 lg:-mx-8'>
									<div class='inline-block min-w-full py-2 sm:px-6 lg:px-8 '>
										<div class='overflow-x-auto'>
											<table class='min-w-full text-left text-sm font-light'>
												<thead class='border-b text-white text-base font-medium dark:border-neutral-500 bg-green-600'>
													<tr>
														<th scope='col' class='px-6 py-4'>
															#
														</th>
														<th scope='col' class='px-6 py-4'>
															Name
														</th>
														<th scope='col' class='px-6 py-4'>
															Specialisation
														</th>
														<th scope='col' class='px-6 py-4'>
															Clinic
														</th>
														<th scope='col' class='px-6 py-4'>
															Location
														</th>
														<th scope='col' class='px-6 py-4'>
															Symptoms
														</th>
													</tr>
												</thead>
												<tbody>
													{Data.map((data, index) => (
														<TableCard key={index} sr={data.sr} name={data.name} specialisation={data.specialisation} clinic={data.clinic} location={data.location} symptoms={data.symptoms} />
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</>
					) : (
						<div className='p-5 m-2 border-solid border-2 border-red-600 rounded-lg shadow-md bg-stone-100 hover:scale-105 transition-all m-auto'>
							<div className='flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row'>
								<div className=''>
									<h4 className='text-lg font-bold text-left mx-2 text-red-700'>No Pending Consultations</h4>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}

export default PendingData;
