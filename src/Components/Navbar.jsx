import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';

const Navbar = () => {
  const navigator = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');

  // Function to log out
  const logout = () => {
    document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear(); // Clear user data from localStorage
    setIsAuthenticated(false);
    setUserType('');
  };

  // Function to get JWT token from cookies
  const getJwtToken = () => {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'jwtToken') {
        return value;
      }
    }
    return null;
  };

  // Function to check if JWT exists
  const JWT = () => {
    const jwtToken = getJwtToken();
    return jwtToken; // returns the JWT token if it exists, else null
  };

  // Function to check if user is logged in as a doctor
  const isDoctor = () => {
    const doctorFlag = localStorage.getItem('isDoctor'); // Assuming this flag is set during login
    return doctorFlag === 'true'; // Returns true if the user is a doctor
  };

  // Handle sign out and redirect to home page
  const handleSignout = () => {
    logout();
    navigator('/'); // Redirect to home or login page after logout
  };

  // Utility function for conditional classnames
  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  useEffect(() => {
    const jwtToken = JWT();
    setIsAuthenticated(!!jwtToken);
    setUserType(isDoctor() ? 'doctor' : 'patient');
  }, []);

  const navigationLinks = [
    { name: 'Home', href: '/', current: false },
    { name: 'Store', href: '/store', current: false },
  ];

  // Add additional links for logged-in users
  if (isAuthenticated) {
    if (userType === 'patient') {
      navigationLinks.push(
        { name: 'Dashboard', href: '/patient-dashboard', current: false },
        { name: 'Cart', href: '/cart', current: false },
        { name: 'Orders', href: '/orders', current: false }
      );
    } else if (userType === 'doctor') {
      navigationLinks.push(
        { name: 'Dashboard', href: '/doctor-dashboard', current: false }
      );
    }
  }

  return (
    <Disclosure as="nav" className="bg-[#1E2A47] fixed w-screen z-50 top-0">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="relative flex h-20 text-center justify-center">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-shrink-0 items-center">
                  <img className="h-8 w-auto" src="./logo.png" alt="HealthHive" />
                  <a href="/" className="m-2 text-white text-2xl font-bold">HealthHive</a>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                  {navigationLinks.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'px-3 py-2 rounded-md text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-[#1E2A47] text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E2A47]">
                        <img className="h-8 w-8 rounded-full" src="./profile.png" alt="" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none px-2">
                        {JWT() ? (
                          // If JWT exists (user is logged in)
                          <Menu.Item>
                            {({ active }) => (
                              <>
                                {isDoctor() ? (
                                  // If user is a doctor, show doctor profile
                                  <Link
                                    to="/doctor-profile"
                                    className={classNames(
                                      active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                      'block py-2 text-sm text-gray-700 m-auto w-full rounded'
                                    )}
                                  >
                                    Doctor Profile
                                  </Link>
                                ) : (
                                  <>
                                    {/* If user is a patient, show patient profile */}
                                    <Link
                                      to="/patient-profile"
                                      className={classNames(
                                        active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                        'block py-2 text-sm text-gray-700 m-auto w-full rounded'
                                      )}
                                    >
                                      Patient Profile
                                    </Link>
                                    {/* Patient specific links */}
                                    <Link
                                      to="/orders"
                                      className={classNames(
                                        active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                        'block py-2 text-sm text-gray-700 m-auto w-full rounded'
                                      )}
                                    >
                                      My Orders
                                    </Link>
                                  </>
                                )}
                                {/* Sign out button */}
                                <button
                                  className={classNames(
                                    active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                    'block px-4 py-2 text-sm text-gray-700 m-auto w-full rounded'
                                  )}
                                  onClick={handleSignout}
                                >
                                  Sign out
                                </button>
                              </>
                            )}
                          </Menu.Item>
                        ) : (
                          // If no JWT (user is not logged in), show login options
                          <Menu.Item>
                            {({ active }) => (
                              <>
                                <Link
                                  to="/doctor-login"
                                  className={classNames(
                                    active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                    'block py-2 text-sm text-gray-700 m-auto w-full rounded'
                                  )}
                                >
                                  Doctor Login
                                </Link>
                                <Link
                                  to="/patient-login"
                                  className={classNames(
                                    active ? 'bg-gray-100 m-auto w-full rounded' : '',
                                    'block py-2 text-sm text-gray-700 m-auto w-full rounded'
                                  )}
                                >
                                  Patient Login
                                </Link>
                              </>
                            )}
                          </Menu.Item>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigationLinks.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;