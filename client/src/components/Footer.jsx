import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Social media icons
import { SiStripe, SiPaypal, SiVisa, SiMastercard } from 'react-icons/si'; // Payment method icons
import ThemeToggleButton from './ThemeToggleButton';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="max-w-screen-xl mx-auto px-6">
                {/* Footer Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
                    {/* Contacts Section */}
                    <div data-aos="fade-up">
                        <h3 className="text-xl font-semibold mb-4">Contacts</h3>
                        <ul className="text-sm space-y-2">
                            <li><a href="/contact" className="hover:underline opacity-70">Contact Us</a></li>
                            <li><a href="mailto:support@goevent.com" className="hover:underline opacity-70">support@goevent.com</a></li>
                            <li><a href="tel:+123456789" className="hover:underline opacity-70">+1 234 567 89</a></li>
                        </ul>
                    </div>

                    {/* Categories Section */}
                    <div data-aos="fade-up">
                        <h3 className="text-xl font-semibold mb-4">Categories</h3>
                        <ul className="text-sm space-y-2">
                            <li><a href="/category/music" className="hover:underline opacity-70">Music</a></li>
                            <li><a href="/category/arts" className="hover:underline opacity-70">Arts</a></li>
                            <li><a href="/category/tech" className="hover:underline opacity-70">Tech</a></li>
                            <li><a href="/category/sports" className="hover:underline opacity-70">Sports</a></li>
                            <li><a href="/category/food" className="hover:underline opacity-70">Food</a></li>
                            <li><a href="/category/business" className="hover:underline opacity-70">Business</a></li>
                        </ul>
                    </div>

                    {/* About Us Section */}
                    <div data-aos="fade-up">
                        <h3 className="text-xl font-semibold mb-4">About Us</h3>
                        <ul className="text-sm space-y-2">
                            <li><a href="/about" className="hover:underline opacity-70">Our Story</a></li>
                            <li><a href="/team" className="hover:underline opacity-70">Our Team</a></li>
                            <li><a href="/careers" className="hover:underline opacity-70">Careers</a></li>
                            <li><a href="/privacy" className="hover:underline opacity-70">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:underline opacity-70">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <ThemeToggleButton />
                    </div>
                </div>

                {/* Payment Methods Section */}
                <div className="flex justify-center items-center mb-6">
                    <h3 className="text-xl font-semibold mr-6">Payment Methods</h3>
                    <div className="flex space-x-4">
                        <SiStripe className="text-2xl" />
                        <SiPaypal className="text-2xl" />
                        <SiVisa className="text-2xl" />
                        <SiMastercard className="text-2xl" />
                    </div>
                </div>

                {/* Horizontal Line */}
                <hr className="border-gray-600 mb-6" />

                {/* Bottom Section */}
                <div className="flex justify-between items-center">
                    {/* Left: Copyright */}
                    <div className="text-sm opacity-70">
                        <p>© {new Date().getFullYear()} Go Event — All rights reserved.</p>
                    </div>

                    {/* Right: Social Media Icons */}
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-500">
                            <FaFacebookF />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-400">
                            <FaTwitter />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-pink-500">
                            <FaInstagram />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-700">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
