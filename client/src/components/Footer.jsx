import React, {useEffect, useState} from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Social media icons
import { SiStripe, SiPaypal, SiVisa, SiMastercard } from 'react-icons/si'; // Payment method icons
import ThemeToggleButton from './ThemeToggleButton';
import { fetchThemes } from '../services/eventService';

const Footer = () => {
    const [themes, setThemes] = useState([]);

	useEffect(() => {
		const loadThemes = async () => {
			try {
				const data = await fetchThemes();
				setThemes(data.slice(0, 6)); // максимум 6 тем
			} catch (error) {
				console.error('Failed to load themes:', error);
			}
		};
		loadThemes();
	}, []);

    return (
        <footer className="py-8 text-white bg-gray-900">
            <div className="max-w-screen-xl px-6 mx-auto">
                <div className="grid grid-cols-1 gap-12 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Contacts */}
                    <div data-aos="fade-up">
                        <h3 className="mb-4 text-xl font-semibold">Contacts</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/contact" className="hover:underline opacity-70">Contact Us</a></li>
                            <li><a href="mailto:support@goevent.com" className="hover:underline opacity-70">support@goevent.com</a></li>
                            <li><a href="tel:+123456789" className="hover:underline opacity-70">+1 234 567 89</a></li>
                        </ul>
                    </div>

                    {/* Themes instead of Categories */}
                    <div data-aos="fade-up">
                        <h3 className="mb-4 text-xl font-semibold">Themes</h3>
                        <ul className="space-y-2 text-sm">
                            {themes.map(theme => (
                                <li key={theme.id}>
                                    <a href={`/themes/${theme.id}/events`} className="hover:underline opacity-70">
                                        {theme.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Us */}
                    <div data-aos="fade-up">
                        <h3 className="mb-4 text-xl font-semibold">About Us</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/about" className="hover:underline opacity-70">Our Story</a></li>
                            <li><a href="/team" className="hover:underline opacity-70">Our Team</a></li>
                            <li><a href="/careers" className="hover:underline opacity-70">Careers</a></li>
                            <li><a href="/privacy" className="hover:underline opacity-70">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:underline opacity-70">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Theme Toggle */}
                    <div>
                        <ThemeToggleButton />
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="flex items-center justify-center mb-6">
                    <h3 className="mr-6 text-xl font-semibold">Payment Methods</h3>
                    <div className="flex space-x-4">
                        <SiStripe className="text-2xl" />
                        <SiPaypal className="text-2xl" />
                        <SiVisa className="text-2xl" />
                        <SiMastercard className="text-2xl" />
                    </div>
                </div>

                <hr className="mb-6 border-gray-600" />

                <div className="flex items-center justify-between">
                    <p className="text-sm opacity-70">© {new Date().getFullYear()} Go Event — All rights reserved.</p>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-500"><FaFacebookF /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-400"><FaTwitter /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-pink-500"><FaInstagram /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-700"><FaLinkedin /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
