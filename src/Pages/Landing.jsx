import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Landing = () => {
	const navigator = useNavigate();
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
	const isDoctor = localStorage.getItem('isDoctor');

	useEffect(() => {
		if (jwtToken) {
			if (isDoctor === 'true') {
				navigator('/doctor-dashboard');
			} else {
				navigator('/patient-dashboard');
			}
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			<div>
				<section>
					<section class='sticky py-24'>
						<div class='max-w-lg px-4 sm:pt-24 pt-12 sm:pb-8 mx-auto text-left md:max-w-none md:text-center'>
							<h1 class='font-extrabold  tracking-tight text-left text-[#201515] text-center sm:leading-none text-6xl sm:text-8xl'>
								<span class='inline md:block '>HealthHive - Connects to</span>
								<span class='relative mt-2 bg-clip-text text-[#201515] md:inline-block'>health vitality</span>
							</h1>
						</div>

						<div class='max-w-lg px-4 pb-24 mx-auto text-left md:max-w-none md:text-center'>
							<div class='text-center py-4'>
								<div class='backdrop-blur-sm transition duration-500 ease-in-out bg-green-600 border border-[#E2E8F0] translate-y-1 text-white  hover:text-white  text-lg font-semibold py-3 px-6 rounded-3xl inline-flex items-center m-2 hover:bg-indigo-600 hover:scale-105 hover:shadow-xl'>
									<Link to='/doctor-login'>Log in As a Doctor</Link>
								</div>

								<div class='backdrop-blur-sm transition duration-500 ease-in-out bg-green-600 border border-[#E2E8F0] translate-y-1 text-white  hover:text-white text-lg font-semibold py-3 px-6 rounded-3xl inline-flex items-center m-2 hover:bg-indigo-600 hover:scale-105 hover:shadow-xl'>
									<Link to='/patient-login'>Log in As a Patient</Link>
								</div>
							</div>
						</div>
					</section>
				</section>

				<div class='text-left'>
					<div class='sm:px-28'>
						<section class='relative flex items-center w-full'>
							<div class='relative items-center w-full px-5 mx-auto md:px-12 lg:px-16 max-w-7xl'>
								<div class='relative flex-col items-start m-auto align-middle'>
									<div class='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24'>
										<div class='relative items-center gap-12 m-auto lg:inline-flex md:order-first'>
											<div class='max-w-xl text-center lg:text-left'>
												<div>
													<p class='text-3xl font-semibold tracking-tight text-[#201515] sm:text-5xl'>Wellness, Now at Your Doorstep.</p>
													<p class='max-w-xl mt-4 text-base tracking-tight text-gray-600'>At HealthHive, we prioritize your well-being with a seamless online platform for prescriptions, OTC medications, and health consultations. Experience secure ordering, same-day delivery, and personalized care—all from the comfort of home.</p>
												</div>
											</div>
										</div>
										<div class='m-auto order-first block w-4/5 mt-12 aspect-square lg:mt-0'>
											<img class='object-cover rounded-3xl object-center w-full mx-auto lg:ml-auto ' alt='hero' src='./logo.png' />
										</div>
									</div>
								</div>
							</div>
						</section>
					</div>

					<div class='mt-32' />

					<section></section>
				</div>
			</div>
		</>
	);
};

export default Landing;
