import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ isDoctor }) => {
	const [isLogin, setLogin] = useState(true);
	const [showpassword, setshowpassword] = useState(false);
	const navigator = useNavigate();

	const handleLogin = async (event) => {
		event.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		const loginData = {
			email: email,
			password: password,
		};
		if (isDoctor) {
			try {
				const response = await fetch('http://localhost:6969/doctor/loginDoctor', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(loginData),
				});
				if (response.status === 404) {
					toast.error('No account found with this email address. Please sign up!');
					return;
				} else if (response.status === 400) {
					toast.error('Incorrect password');
					return;
				} else if (response.status === 500) {
					toast.error('Internal server error');
					return;
				} else {
					toast.success('Logged in successfully');
					const { token } = await response.json();

					document.cookie = `jwtToken=${token}; expires=${new Date(new Date().getTime() + 3600000).toUTCString()}; path=/`;

					localStorage.setItem('userEmail', email);
					localStorage.setItem('isDoctor', true);
					setTimeout(() => navigator('/doctor-dashboard'), 2000);
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			try {
				const response = await fetch('http://localhost:6969/patient/loginPatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(loginData),
				});
				if (response.status === 404) {
					toast.error('No account found with this email address. Please sign up!');
					return;
				} else if (response.status === 400) {
					toast.error('Incorrect password');
					return;
				} else if (response.status === 500) {
					toast.error('Internal server error');
					return;
				} else {
					toast.success('Logged in successfully');
					const { token } = await response.json();
					document.cookie = `jwtToken=${token}; expires=${new Date(new Date().getTime() + 3600000).toUTCString()}; path=/`;

					localStorage.setItem('userEmail', email);
					localStorage.setItem('isDoctor', false);
					setTimeout(() => navigator('/patient-dashboard'), 2000);
				}
			} catch (error) {
				toast.error('Internal server error');
				console.log(error);
			}
		}
	};

	const handleSignup = async (event) => {
		event.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		if (email === '' || password === '') {
			toast.error('Please fill all the fields');
			return;
		}
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			toast.error('Invalid email');
			return;
		}
		if (password.length < 6) {
			toast.error('Password must be at least 6 characters long');
			return;
		}
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
		if (!passwordRegex.test(password)) {
			toast.error('Password must have an upper case letter, a lower case letter, a number and a special character');
			return;
		}

		const signupData = {
			email: email,
			password: password,
		};

		try {
			if (isDoctor) {
				const response = await fetch('http://localhost:6969/doctor/createDoctor', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(signupData),
				});
				if (response.status === 400) {
					toast.error('Email already in use!');
					return;
				} else if (response.status === 500) {
					toast.error('Internal server error');
					return;
				} else {
					toast.success('Account created succesfully!');
					const data = await response.json();
					document.cookie = `jwtToken=${data.token}; expires=${new Date(new Date().getTime() + 3600000).toUTCString()}; path=/`;

					localStorage.setItem('userEmail', email);
					localStorage.setItem('isDoctor', true);
					setTimeout(() => navigator(`/update-profile?isDoctor=${isDoctor}`), 2000);
				}
			} else {
				const response = await fetch('http://localhost:6969/patient/createPatient', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(signupData),
				});
				if (response.status === 400) {
					toast.error('Email already in use!');
					return;
				} else if (response.status === 500) {
					toast.error('Internal server error');
					return;
				} else {
					toast.success('Account created succesfully!');
					const data = await response.json();
					document.cookie = `jwtToken=${data.token}; expires=${new Date(new Date().getTime() + 3600000).toUTCString()}; path=/`;
					localStorage.setItem('userEmail', email);
					localStorage.setItem('isDoctor', false);
					setTimeout(() => navigator(`/update-profile?isDoctor=${isDoctor}`), 2000);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};
	const Handleshowpassword = () => {
		setshowpassword(!showpassword);
	};

	return (
		<>
			<Toaster />
			{isLogin ? (
				<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-24 lg:px-8 '>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img className='mx-auto h-10 w-auto' src='./logo.png' alt='Your Company' />
						<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>{isDoctor ? 'Doctor Login' : 'Patient Login'}</h2>
					</div>

					<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
						<form className='space-y-6' action='/' method='POST' id='loginForm'>
							<div>
								<label htmlFor='email' className='block text-sm font-medium leading-6 text-gray-900'>
									Email address
								</label>
								<div className='mt-2'>
									<input id='email' name='email' type='email' autoComplete='email' required placeholder='Email' className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 ' />
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>
										Password
									</label>
								</div>
								<div className='mt-2'>
									<input id='password' name='password' type={showpassword ? 'text' : 'password'} autoComplete='current-password' required placeholder='Password' className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 ' />
								</div>
							</div>
							<div className='mt-2 flex items-center'>
								<input id='showPassword' name='showPassword' type='checkbox' checked={showpassword} onChange={Handleshowpassword} className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded' />
								<label htmlFor='showPassword' className='ml-2 block text-sm text-gray-900'>
									Show Password
								</label>
							</div>

							<div>
								<button type='submit' className='flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' onClick={handleLogin}>
									Log in
								</button>
							</div>
						</form>

						<p className='mt-10 text-center text-sm text-gray-500'>
							Not a member?{' '}
							<Link className='font-semibold leading-6 text-green-600 hover:text-green-500' onClick={() => setLogin(false)}>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			) : (
				<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-24 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img className='mx-auto h-10 w-auto' src='./logo.png' alt='Your Company' />
						<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>{isDoctor ? 'Doctor Sign Up' : 'Patient Sign Up'}</h2>
					</div>

					<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm signupForm'>
						<form className='space-y-6' action='/' method='POST'>
							<div>
								<label htmlFor='email' className='block text-sm font-medium leading-6 text-gray-900'>
									Email address
								</label>
								<div className='mt-2'>
									<input id='email' name='email' type='email' autoComplete='email' required placeholder='Email' className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 ' />
								</div>
							</div>

							<div>
								<div className='flex items-center justify-between'>
									<label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>
										Password
									</label>
								</div>
								<div className='mt-2'>
									<input id='password' name='password' type={showpassword ? 'text' : 'password'} autoComplete='current-password' required placeholder='Password' className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2 ' />
								</div>
							</div>
							<div className='mt-2 flex items-center'>
								<input id='showPassword' name='showPassword' type='checkbox' checked={showpassword} onChange={Handleshowpassword} className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded' />
								<label htmlFor='showPassword' className='ml-2 block text-sm text-gray-900'>
									Show Password
								</label>
							</div>
							<div>
								<button type='submit' className='flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' onClick={handleSignup}>
									Sign up
								</button>
							</div>
						</form>

						<p className='mt-10 text-center text-sm text-gray-500'>
							Already a Member?{' '}
							<Link className='font-semibold leading-6 text-green-600 hover:text-green-500' onClick={() => setLogin(true)}>
								Log in
							</Link>
						</p>
					</div>
				</div>
			)}
		</>
	);
};

export default Login;
