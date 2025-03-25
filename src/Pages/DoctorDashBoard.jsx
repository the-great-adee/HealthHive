import React from 'react';
import DoctorProfile from '../Components/Doctor/DoctorProfile';
import PendingData from '../Components/Doctor/PendingData';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const DoctorDashBoard = () => {
	const navigator = useNavigate();

	const isDoctor = localStorage.getItem('isDoctor');
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
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			<Toaster />
			<div className='flex relative'>
				<div className='flex flex-col justify-center w-full md:w-[calc(100%-32rem)]'>
					<h2 class='pt-24 m-auto font-bold my-2 uppercase text-xl'>Pending Consultations</h2>
					<PendingData status='consultation' />

					<h2 class='pt-12 text-xl m-auto font-bold my-2 uppercase'>Booked Appointments</h2>
					<PendingData status='appointment' />
					<h2 class='pt-12 text-xl m-auto font-bold my-2 uppercase'>Completed</h2>
					<PendingData status='completed' />
				</div>
				<div className='hidden md:block fixed right-0 top-16'>
					<DoctorProfile />
				</div>
			</div>
		</div>
	);
};

export default DoctorDashBoard;
