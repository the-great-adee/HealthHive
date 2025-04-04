import React from 'react';

const Footer = () => {
  return (
    <div className="bg-[#273c54] text-white py-12 mt-auto border-t border-[#3A4A75]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="min-w-[250px]">
            <a href="/" className="text-white text-lg font-bold mb-4">
              HealthHive
            </a>
            <p className="text-gray-300">
              Your Trusted Online Pharmacy
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Links</h4>
              <div className="flex flex-col gap-3">
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">About Us</a>
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">Contact</a>
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">Blog</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <div className="flex flex-col gap-3">
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">Privacy</a>
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">Terms</a>
                <a href="/" className="text-gray-300 hover:text-[#38BDF8]">Security</a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-400 mt-10">
          <p>© {new Date().getFullYear()} HealthHive. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
