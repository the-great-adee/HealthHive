import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
export default function PendingCard({ index, data, status }) {
	const [showModal, setShowModal] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [isPrescript, setIsPrescript] = useState(true);
	const [isReject, setIsReject] = useState(false);
	const [isFeedback, setIsFeedback] = useState(false);
	const [reject_reason, Setreject_reason] = useState('');
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
			return (window.location.href = '/doctor-login');
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
		setIsPrescript(true);
		setIsReject(false);
		setIsFeedback(false);
	};

	const handleRejctModal = () => {
		setShowModal(true);
		setIsPrescript(false);
		setIsReject(true);
		setIsFeedback(false);
	};

	const handlefeedback = () => {
		if (data.feedback === '' || !data.feedback) {
			return toast.error('No feedback from the patient yet');
		}
		setShowModal(true);
		setIsPrescript(false);
		setIsReject(false);
		setIsFeedback(true);
	};

	const handleOpenapppointModal = async () => {
		setIsPrescript(false);
		setIsReject(false);
		setIsFeedback(false);
		let flag = true;
		const patientEmail = data.email;
		const doctorEmail = localStorage.getItem('userEmail');
		const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: doctorEmail }),
		});
		const doc_data_to_update = await doc_data_to_update_response.json();
		const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.email === patientEmail && patient.status === 'appointment');
		if (pait_ind !== -1) flag = false;
		if (flag) {
			setShowModal(true);
			setIsPrescript(false);
			return;
		} else {
			return toast.error('You already have a pending appointment with the given patient');
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	const handlerejectreason = (event) => {
		Setreject_reason(event.target.value);
	};

	const windowReload = () => {
		window.location.reload();
	};

	// Functon to handle the reject option. It will send an email to the patient with the reason for rejection
	const handlerejectsubmit = async () => {
		console.log(reject_reason);
		const patientEmail = data.email;
		const doctorEmail = localStorage.getItem('userEmail');
		const req_id = data.id;
		console.log(req_id);
		try {
			const response = await authFetch('http://localhost:6969/patient/getByEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: patientEmail }),
			});
			if (response.ok) {
				console.log('Patient obtained successfully:', response);
			} else {
				const errorMessage = await response.text();
				console.error('Error obtaining patient:', errorMessage);
				toast.error('Internal server error');
				return;
			}

			const patient_to_upd = await response.json();
			const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.email === doctorEmail && doctor.status === 'consultation');
			console.log(req_id);
			console.log(patient_to_upd.doctor[doct_ind].id);

			if (doct_ind === -1) {
				throw new Error('Doctor not found for the patient in appointment list');
			}
			patient_to_upd.doctor.splice(doct_ind, 1);

			try {
				const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(patient_to_upd),
				});

				if (updateResponse.ok) {
					try {
						const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ email: doctorEmail }),
						});
						const doc_data_to_update = await doc_data_to_update_response.json();
						const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.email === patientEmail && patient.status === 'consultation');
						if (pait_ind === -1) {
							throw new Error('Doctor not found for the patient');
						}
						doc_data_to_update.patients.splice(pait_ind, 1);
						const updateDoctorResponse = await authFetch('http://localhost:6969/doctor/updateDoctor', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(doc_data_to_update),
						});

						if (updateDoctorResponse.ok) {
							const updated_doc = await updateDoctorResponse.json();
							console.log('Doctor updated successfully:', updated_doc);
						} else {
							const errorMessage = await updateDoctorResponse.text();
							console.error('Error updating doctor:', errorMessage);
							toast.error('Internal server error');
						}

						try {
							const emailResponse = await authFetch('http://localhost:6969/email/sendMail', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									to: patientEmail,
									from: doctorEmail,
									context: 'rejection',
									receiver_name: patient_to_upd.name,
									sender_name: doc_data_to_update.name,
									reason: reject_reason,
								}),
							});
							if (emailResponse.ok) {
								console.log('Email sent successfully:', emailResponse);
								toast.success('Consultation rejected successfully. An email has been sent to the patient');
								setTimeout(() => {
									handleCloseModal();
									windowReload();
								}, 2000);
							} else {
								const errorMessage = await emailResponse.text();
								console.error('Error sending email:', errorMessage);
								toast.error('Internal server error');
							}
						} catch (error) {
							console.error(error);
							toast.error('Internal server error');
							return;
						}
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
						return;
					}
				} else {
					const errorMessage = await updateResponse.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error(error);
			toast.error('Internal server error');
			return;
		}
	};

	// Function to handle the completion of the consultation. It will send an email to the patient with the completion details
	const handlecomplete = async () => {
		const patientEmail = data.email;
		const doctorEmail = localStorage.getItem('userEmail');
		// Cancellation before booking date-time prevention
		// const date = document.getElementById('date_val').textContent;
		// const time = document.getElementById('time_val').textContent;
		// const currDate = new Date().toISOString().split('T')[0];
		// const currTime = new Date().toISOString().split('T')[1];
		// if (currDate < date) return toast.error('Appointment cannot be cancelled before the booked date!');
		// if (currDate === date && currTime < time) return toast.error('Appointment cannot be cancelled before the booked date!');
		try {
			const response = await authFetch('http://localhost:6969/patient/getByEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: patientEmail }),
			});
			if (response.ok) {
				console.log('Patient obtained successfully:', response);
			} else {
				const errorMessage = await response.text();
				console.error('Error obtaining patient:', errorMessage);
				toast.error('Internal server error');
				return;
			}

			const patient_to_upd = await response.json();
			console.log(patient_to_upd);
			const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.email === doctorEmail && doctor.status === 'appointment');
			if (doct_ind === -1) {
				throw new Error('Doctor not found for the patient in appointment list');
			}
			patient_to_upd.doctor[doct_ind].status = 'completed';
			patient_to_upd.doctor[doct_ind].completionDate = new Date().toISOString().split('T')[0];

			try {
				const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(patient_to_upd),
				});

				if (updateResponse.ok) {
					const updatedPatient = await updateResponse.json();
					console.log('Patient updated successfully:', updatedPatient);
					setTimeout(() => {
						handleCloseModal();
					}, 2000);
				} else {
					const errorMessage = await updateResponse.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}
				try {
					const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ email: doctorEmail }),
					});
					const doc_data_to_update = await doc_data_to_update_response.json();
					const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.email === patientEmail && patient.status === 'appointment');
					if (pait_ind === -1) {
						throw new Error('Doctor not found for the patient');
					}
					doc_data_to_update.patients[pait_ind].status = 'completed';
					doc_data_to_update.patients[pait_ind].completionDate = new Date().toISOString().split('T')[0];
					const updateDoctorResponse = await authFetch('http://localhost:6969/doctor/updateDoctor', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(doc_data_to_update),
					});

					if (updateDoctorResponse.ok) {
						const updated_doc = await updateDoctorResponse.json();
						console.log('Doctor updated successfully:', updated_doc);
					} else {
						const errorMessage = await updateDoctorResponse.text();
						console.error('Error updating doctor:', errorMessage);
						toast.error('Internal server error');
					}
					const response = await authFetch('http://localhost:6969/appointment/deleteAppointment', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ id: patient_to_upd.doctor[doct_ind].id }),
					});
					if (!response.ok) {
						throw new Error('Failed to delete appointment');
					}

					try {
						const emailResponse = await authFetch('http://localhost:6969/email/sendMail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								to: patientEmail,
								from: doctorEmail,
								context: 'completion',
								receiver_name: patient_to_upd.name,
								sender_name: doc_data_to_update.name,
								completion_id: patient_to_upd.doctor[doct_ind].id,
							}),
						});
						if (emailResponse.ok) {
							console.log('Email sent successfully:', emailResponse);
							toast.success('Appointment marked as completed successfully.');
							setTimeout(() => {
								handleCloseModal();
								windowReload();
							}, 2000);
						} else {
							const errorMessage = await emailResponse.text();
							console.error('Error sending email:', errorMessage);
							toast.error('Internal server error');
						}
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
						return;
					}
				} catch (error) {
					console.error(error);
					toast.error('Internal server error');
					return;
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error(error);
			toast.error('Internal server error');
			return;
		}
	};

	// Function to handle the deletion of the completed appointment. It will remove the appointment from the patient and doctor's appointment list
	const handledelete = async () => {
		const patientEmail = data.email;
		const doctorEmail = localStorage.getItem('userEmail');
		const req_id = data.id;
		try {
			const response = await authFetch('http://localhost:6969/patient/getByEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: patientEmail }),
			});
			if (response.ok) {
				console.log('Patient obtained successfully:', response);
			} else {
				const errorMessage = await response.text();
				console.error('Error obtaining patient:', errorMessage);
				toast.error('Internal server error');
				return;
			}

			const patient_to_upd = await response.json();
			const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.id === req_id && doctor.status === 'completed');
			console.log(data.id);
			if (doct_ind === -1) {
				throw new Error('Doctor not found for the patient in appointment list');
			}

			// Prevention of deletion of completed consultation within 7 days of completion
			// const completeDate = patient_to_upd.doctor[doct_ind].completionDate;
			// const currDate = new Date().toISOString().split('T')[0];
			// const oneWeekAfter = new Date(new Date(completeDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

			// if (currDate < oneWeekAfter) {
			// 	return toast.error('Consultation cannot be deleted within 7 days of completion');
			// }

			patient_to_upd.doctor.splice(doct_ind, 1);

			try {
				const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(patient_to_upd),
				});

				if (updateResponse.ok) {
					const updatedPatient = await updateResponse.json();
					console.log('Patient updated successfully:', updatedPatient);
				} else {
					const errorMessage = await updateResponse.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}
				try {
					const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ email: doctorEmail }),
					});
					const doc_data_to_update = await doc_data_to_update_response.json();
					const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.id === req_id && patient.status === 'completed');
					if (pait_ind === -1) {
						throw new Error('Doctor not found for the patient');
					}
					doc_data_to_update.patients.splice(pait_ind, 1);
					const updateDoctorResponse = await authFetch('http://localhost:6969/doctor/updateDoctor', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(doc_data_to_update),
					});

					if (updateDoctorResponse.ok) {
						const updated_doc = await updateDoctorResponse.json();
						console.log('Doctor updated successfully:', updated_doc);
						toast.success('Completed appointment removed successfully');
						setTimeout(() => {
							handleCloseModal();
							windowReload();
						}, 2000);
					} else {
						const errorMessage = await updateDoctorResponse.text();
						console.error('Error updating doctor:', errorMessage);
						toast.error('Internal server error');
					}
				} catch (error) {
					console.error(error);
					toast.error('Internal server error');
					return;
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error(error);
			toast.error('Internal server error');
			return;
		}
	};

	// Function to handle the prescription. It will send an email to the patient with the prescription details
	const handle_online_prescription = async () => {
		const patientEmail = data.email;
		const doctorEmail = localStorage.getItem('userEmail');
		try {
			try {
				const cont = inputValue;
				const prescriptionData = {
					patientEmail: patientEmail,
					doctorEmail: doctorEmail,
					content: cont, //need to change by the input
				};
				const response = await authFetch('http://localhost:6969/prescription/createPrescription', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(prescriptionData),
				});

				if (!response.ok) {
					throw new Error('Failed to create prescription');
				}

				const prescrip_data = await response.json();
				console.log('Prescription created successfully:', prescrip_data);
				setShowModal(true);

				const patient_response = await authFetch('http://localhost:6969/patient/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: patientEmail }),
				});
				if (patient_response.ok) {
					console.log('Patient obtained successfully:', response);
				} else {
					const errorMessage = await response.text();
					console.error('Error obtaining patient:', errorMessage);
					toast.error('Internal server error');
					return;
				}
				const patient_to_upd = await patient_response.json();
				const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.email === doctorEmail && doctor.status === 'consultation');
				if (doct_ind === -1) {
					throw new Error('Doctor not found for the patient');
				}
				patient_to_upd.doctor[doct_ind].status = 'completed';
				patient_to_upd.doctor[doct_ind].completionDate = new Date().toISOString().split('T')[0];
				patient_to_upd.doctor[doct_ind].id = prescrip_data._id;

				try {
					const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(patient_to_upd),
					});

					if (updateResponse.ok) {
						const updatedPatient = await updateResponse.json();
						console.log('Patient updated successfully:', updatedPatient);
					} else {
						const errorMessage = await updateResponse.text();
						console.error('Error updating patient:', errorMessage);
						toast.error('Internal server error');
					}
					try {
						const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ email: doctorEmail }),
						});
						const doc_data_to_update = await doc_data_to_update_response.json();
						const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.email === patientEmail && patient.status === 'consultation');
						if (pait_ind === -1) {
							throw new Error('Doctor not found for the patient');
						}
						doc_data_to_update.patients[pait_ind].status = 'completed';
						doc_data_to_update.patients[pait_ind].id = prescrip_data._id;
						doc_data_to_update.patients[pait_ind].completionDate = new Date().toISOString().split('T')[0];
						const updateDoctorResponse = await authFetch('http://localhost:6969/doctor/updateDoctor', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(doc_data_to_update),
						});

						if (updateDoctorResponse.ok) {
							const updated_doc = await updateDoctorResponse.json();
							console.log('Doctor updated successfully:', updated_doc);
						} else {
							const errorMessage = await updateDoctorResponse.text();
							console.error('Error updating doctor:', errorMessage);
							toast.error('Internal server error');
						}

						try {
							const emailResponse = await authFetch('http://localhost:6969/email/sendMail', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									to: patientEmail,
									from: doctorEmail,
									context: 'prescription',
									receiver_name: patient_to_upd.name,
									sender_name: doc_data_to_update.name,
									prescription: cont,
									completion_id: patient_to_upd.doctor[doct_ind].id,
								}),
							});
							if (emailResponse.ok) {
								console.log('Email sent successfully:', emailResponse);
								toast.success('Online Prescription sent successfully');
								setTimeout(() => {
									handleCloseModal();
									windowReload();
								}, 2000);
							} else {
								const errorMessage = await emailResponse.text();
								console.error('Error sending email:', errorMessage);
								toast.error('Internal server error');
							}
						} catch (error) {
							console.error(error);
							toast.error('Internal server error');
							return;
						}
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
						return;
					}
				} catch (error) {
					console.error(error);
					toast.error('Internal server error');
					return;
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error('Error creating prescription:', error.message);
		}

		setInputValue(' ');
	};

	// Function to handle the appointment. It will send an email to the patient with the appointment details
	const handleappointment = async () => {
		const patientEmail = data.email;
		const date = document.getElementById('date').value;
		const time = document.getElementById('time').value;
		if (date === '') return toast.error("Date field can't be empty");
		if (time === '') return toast.error("Time field can't be empty");
		const doctorEmail = localStorage.getItem('userEmail');
		const dateObject = new Date(date);
		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const day = days[dateObject.getDay()];
		try {
			try {
				const doc_data_to_update_response = await authFetch('http://localhost:6969/doctor/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: doctorEmail }),
				});
				const doc_data_to_update = await doc_data_to_update_response.json();
				let flag = 0;
				if (date < new Date().toISOString().split('T')[0]) return toast.error('Appointment date cannot be in the past');
				doc_data_to_update.workingHours.map((workingHour) => {
					if (!flag) {
						if (workingHour.day === day) {
							console.log(workingHour);
							const start = workingHour.from;
							const end = workingHour.to;

							if (start === '') {
								flag = 1;
								return toast.error('The appointment falls outside your working hours');
							}

							let hour = parseInt(time.split(':')[0]);
							let min = parseInt(time.split(':')[1]);

							let startHour = parseInt(start.split(':')[0]);
							let startMin = parseInt(start.split(':')[1]);

							let endHour = parseInt(end.split(':')[0]);
							let endMin = parseInt(end.split(':')[1]);

							if (hour < startHour || hour > endHour) {
								flag = 1;
								return toast.error('The appointment falls outside your working hours');
							} else {
								if (hour === startHour) {
									if (min < startMin) {
										flag = 1;
										return toast.error('The appointment falls outside your working hours');
									}
								} else if (hour === endHour) {
									if (min > endMin) {
										flag = 1;
										return toast.error('The appointment falls outside your working hours');
									}
								}
							}
						}
					}
					return null;
				});
				if (flag === 1) return;
				console.log(flag);
				const appointmentData = {
					patient: {
						email: patientEmail,
					},
					doctor: {
						email: doctorEmail,
					},
					date: date,
					time: time,
				};
				const response = await authFetch('http://localhost:6969/appointment/createAppointment', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(appointmentData),
				});

				if (!response.ok) {
					throw new Error('Failed to create appointment');
				}

				const apt_data = await response.json();
				console.log('Appointment created successfully:', apt_data);

				const pait_ind = doc_data_to_update.patients.findIndex((patient) => patient.email === patientEmail && patient.status === 'consultation');
				if (pait_ind === -1) {
					throw new Error('Doctor not found for the patient');
				}
				doc_data_to_update.patients[pait_ind].status = 'appointment';
				doc_data_to_update.patients[pait_ind].id = apt_data._id;
				const responseForDoctorUpdate = await authFetch('http://localhost:6969/doctor/updateDoctor', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(doc_data_to_update),
				});

				if (responseForDoctorUpdate.ok) {
					const updated_doc = await responseForDoctorUpdate.json();
					console.log('Doctor updated successfully:', updated_doc);
				} else {
					const errorMessage = await responseForDoctorUpdate.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}

				try {
					const response = await authFetch('http://localhost:6969/patient/getByEmail', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ email: patientEmail }),
					});
					console.log(response);
					if (response.ok) {
						console.log('Patient obtained successfully:', response);
					} else {
						const errorMessage = await response.text();
						console.error('Error obtaining patient:', errorMessage);
						toast.error('Internal server error');
						return;
					}
					const patient_to_upd = await response.json();
					const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.email === doctorEmail && doctor.status === 'consultation');
					if (doct_ind === -1) {
						throw new Error('Doctor not found for the patient');
					}
					patient_to_upd.doctor[doct_ind].status = 'appointment';
					patient_to_upd.doctor[doct_ind].id = apt_data._id;
					try {
						const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(patient_to_upd),
						});

						if (updateResponse.ok) {
							const updatedPatient = await updateResponse.json();
							console.log('Patient updated successfully:', updatedPatient);
						} else {
							const errorMessage = await updateResponse.text();
							console.error('Error updating patient:', errorMessage);
							toast.error('Internal server error');
						}

						try {
							const emailResponse = await authFetch('http://localhost:6969/email/sendMail', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									to: patientEmail,
									from: doctorEmail,
									context: 'appointment',
									receiver_name: patient_to_upd.name,
									sender_name: doc_data_to_update.name,
									date: date,
									time: time,
									clinic: doc_data_to_update.clinic,
									location: doc_data_to_update.location,
								}),
							});
							if (emailResponse.ok) {
								console.log('Email sent successfully:', emailResponse);
								toast.success('Appointment booked successfully');
								setTimeout(() => {
									handleCloseModal();
									windowReload();
								}, 2000);
							} else {
								const errorMessage = await emailResponse.text();
								console.error('Error sending email:', errorMessage);
								toast.error('Internal server error');
							}
						} catch (error) {
							console.error(error);
							toast.error('Internal server error');
							return;
						}
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
						return;
					}
				} catch (error) {
					console.error(error);
					toast.error('Internal server error');
					return;
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error('Error creating appointment:', error.message);
		}
	};

	// Function to handle the reply being sent by the doctor in lieu of the patient's feedback. It will send an email to the patient with the reply details
	const handlereplysubmit = async () => {
		if (new Date(new Date(data.completed).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] < new Date().toISOString().split('T')[0]) {
			return toast.error('7 days have passed since the completion of the appointment. Please click remove to delete the consultation');
		}
		const patientEmail = data.email;
		const feedback = document.getElementById('reply-text').value;
		if (feedback === '') return toast.error('Reply cannot be empty');
		try {
			const response = await authFetch('http://localhost:6969/patient/getByEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: patientEmail }),
			});
			if (response.ok) {
				console.log('Patient obtained successfully:', response);
			} else {
				const errorMessage = await response.text();
				console.error('Error obtaining patient:', errorMessage);
				toast.error('Internal server error');
				return;
			}

			const patient_to_upd = await response.json();
			const doct_ind = patient_to_upd.doctor.findIndex((doctor) => doctor.id === data.id);
			if (doct_ind === -1) {
				throw new Error('Doctor not found for the patient in appointment list');
			}
			patient_to_upd.doctor[doct_ind].feedback = feedback;
			let doctorData;

			try {
				const doctorResponse = await authFetch('http://localhost:6969/doctor/getByEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: localStorage.getItem('userEmail') }),
				});
				if (doctorResponse.ok) {
					console.log('Doctor obtained successfully:', doctorResponse);
					doctorData = await doctorResponse.json();
				} else {
					const errorMessage = await doctorResponse.text();
					console.error('Error obtaining doctor:', errorMessage);
					toast.error('Internal server error');
					return;
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}

			try {
				const updateResponse = await authFetch('http://localhost:6969/patient/updatePatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(patient_to_upd),
				});

				if (updateResponse.ok) {
					const updatedPatient = await updateResponse.json();
					console.log('Patient updated successfully:', updatedPatient);
					toast.success('Reply sent successfully');
					try {
						const emailResponse = await authFetch('http://localhost:6969/email/sendMail', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								to: patientEmail,
								from: localStorage.getItem('userEmail'),
								context: 'reply',
								receiver_name: patient_to_upd.name,
								sender_name: doctorData.name,
								feedback: feedback,
							}),
						});

						if (emailResponse.ok) {
							console.log('Email sent successfully:', emailResponse);
						}
					} catch (error) {
						console.error(error);
						toast.error('Internal server error');
						return;
					}
					setTimeout(() => {
						handleCloseModal();
						setInputValue('');
					}, 2000);
				} else {
					const errorMessage = await updateResponse.text();
					console.error('Error updating patient:', errorMessage);
					toast.error('Internal server error');
				}
			} catch (error) {
				console.error(error);
				toast.error('Internal server error');
				return;
			}
		} catch (error) {
			console.error(error);
			toast.error('Internal server error');
			return;
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
												{isReject && 'Reject Consultation'}
												{isPrescript && 'Online Prescription'}
												{isFeedback && 'Reply to Feedback'}
												{!isPrescript && !isReject && !isFeedback && 'Book Appointment'}
											</h1>
											<div className='absolute right-5'>
												<button onClick={handleCloseModal} className=' hover:bg-gray-100 transition-all rounded' style={{ right: '0' }}>
													&#10060;
												</button>
											</div>
										</div>
										<div className='mt-10'>
											<div className='text-md font-bold text-left'>
												Patient - <span className='text-gray-600 font-semibold text-sm '>{data.name}</span>
											</div>
											<div className='text-md font-bold text-left'>
												Age - <span className='text-gray-600 font-semibold text-sm '>{data.age}</span>
											</div>
											<div className='text-md font-bold text-left'>
												Symptoms - <span className='text-gray-600 font-semibold text-sm'>{data.symptoms}</span>
											</div>
										</div>
										{isReject && (
											<>
												<div className='mt-2'>
													<div className='text-md font-bold text-left'>State your reasons for rejection:</div>
													<textarea type='text' value={reject_reason} onChange={handlerejectreason} className='min-h-20 w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Reasons for rejection' />
												</div>
												<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
													<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handlerejectsubmit}>
														Submit
													</button>
												</div>
											</>
										)}
										{isPrescript && (
											<>
												<div className='mt-2'>
													<div className='text-md font-bold text-left'>Prescription-</div>
													<textarea type='text' value={inputValue} onChange={handleInputChange} className='min-h-20 w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Prescribe the medicines here' />
												</div>
												<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
													<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handle_online_prescription}>
														Submit
													</button>
												</div>
											</>
										)}
										{isFeedback && (
											<>
												<div className='mt-2'>
													<div className='text-md font-bold text-left mb-2'>
														Feedback from patient- <span className='text-gray-600 font-semibold text-sm '>{data.feedback}</span>
													</div>
													<div className='text-md font-bold text-left'>Reply:</div>
													<textarea type='text' id='reply-text' className='min-h-20 w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Your Reply' />
												</div>
												<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
													<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handlereplysubmit}>
														Submit
													</button>
												</div>
											</>
										)}
										{!isPrescript && !isReject && !isFeedback && (
											<>
												<div className='mt-2'>
													<div className='text-md font-bold text-left'>Appointment date</div>
													<input id='date' type='date' className=' w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
													<div className='text-md font-bold text-left'>Appointment time</div>
													<input id='time' type='time' className=' w-full px-3 py-2 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
												</div>
												<div className='flex justify-center bg-gray-50 px-4 py-3 sm:px-6'>
													<button className=' inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm' onClick={handleappointment}>
														Submit
													</button>
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className='p-5 m-2 w-full border-solid border-2 border-green-600  rounded-lg shadow-md bg-stone-100 hover:scale-105 transition-all 	'>
				<div className='flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row'>
					<div className=''>
						<h4 className='text-lg font-bold text-left mx-2'>{data.name}</h4>
						<div className='flex'>
							<div className='mx-2'>
								<div className='text-md font-bold text-left'>
									Age - <span className='text-gray-600 font-semibold text-sm'>{data.age}</span>
								</div>
								<div className='text-md font-bold text-left'>
									Symptoms - <span className='text-gray-600 font-semibold text-sm '>{data.symptoms}</span>
								</div>
								<div className='text-md font-bold text-left'>
									Status - <span className='text-gray-600 font-semibold text-sm '>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
								</div>
								{status === 'appointment' && (
									<>
										<div className='text-md font-bold text-left'>
											Date -{' '}
											<span className='text-gray-600 font-semibold text-sm ' id='date_val'>
												{data.date}
											</span>
										</div>
										<div className='text-md font-bold text-left'>
											Time -{' '}
											<span className='text-gray-600 font-semibold text-sm ' id='time_val'>
												{data.time}
											</span>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className='mx-2'>
					<div className='text-md font-bold text-left'>
						Location - <span className='text-gray-600 font-semibold text-sm'>{data.location}</span>
					</div>
				</div>
				<div className='flex'>
					{status === 'consultation' ? (
						<>
							<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handleOpenModal}>
								Online Prescription
							</button>
							<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handleOpenapppointModal}>
								Book Appointment
							</button>
							<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handleRejctModal}>
								Reject
							</button>
						</>
					) : status === 'appointment' ? (
						<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handlecomplete}>
							Completed
						</button>
					) : (
						<>
							<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handlefeedback}>
								Feedback from Patient
							</button>
							<button className='m-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' onClick={handledelete}>
								Remove
							</button>
						</>
					)}
				</div>
			</div>
		</>
	);
}
