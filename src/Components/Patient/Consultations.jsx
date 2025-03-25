import React from 'react';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Booked from './BookedConsultations/BookedAppointments';
import PendingConsulations from './PendingConsultations/PendingConsultations';
import CompletedConsultations from './CompletedConsultations/CompletedConsultation';
export default function Consultations() {
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
		if (!getJwtToken()) {
			toast.error('Session expired. Please login again.');
		}
	}, []);
	return (
		<>
			<Toaster />
			<PendingConsulations />
			<h2 className='m-auto pt-12 font-bold my-2 text-xl uppercase'>Booked Appointments</h2>
			<Booked />
			<h2 className='m-auto pt-12 font-bold my-2 text-xl uppercase'>Completed Consultations</h2>
			<CompletedConsultations />
		</>
	);
}
