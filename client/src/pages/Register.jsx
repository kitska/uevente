import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { userStore } from '../store/userStore'; // Импортируйте userStore
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Tooltip from '@mui/material/Tooltip';
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
// import Notification from '../components/Notification';
// import { createUser } from '../services/userService';

function Register() {
    const [email, setEmail] = useState('');
    const [login, setlogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (userStore.user) {
            navigate('/');
        }
    }, [navigate]);

    const validate = () => {
        const errors = {};
        if (!fullName) errors.fullName = "Full name is required";
        // if (!username) errors.username = "Username is required";
        if (fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
        // if (username.length < 2) errors.username = "Username must be at least 2 characters";
        if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid Email is required";
        if (password.length < 6) errors.password = "Password must be at least 6 characters";
        if (password !== confirmPassword) errors.confirmPassword = "Passwords must match";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        setServerError('');
        setLoading(true);
        if (Object.keys(validationErrors).length === 0) {
            try {
                const message = await userStore.register(fullName, email, password, login);
                if (message) {
                    toast('ℹ️ Confirm your email!');
                    navigate('/login');
                }
            } catch (error) {
                // console.log(error);
                // setServerError(error.message);
                setServerError(error.response?.data?.message || 'Registration failed');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    return (
        loading ? (<LoadingSpinner />) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="px-8 pt-8 pb-4 bg-white rounded shadow-md w-96">
                    <h1 className="mb-6 text-2xl font-semibold text-center">Register</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="col-span-1">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                            </div>
                            <div className="col-span-1">
                                <input
                                    type="text"
                                    value={login}
                                    onChange={(e) => setlogin(e.target.value)}
                                    placeholder="Login"
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.login && <p className="text-sm text-red-500">{errors.login}</p>}
                            </div>
                        </div>
                        <div className='mb-4'>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className='mb-4'>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className='mb-4'>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>

                        <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                            Register
                        </button>
                    </form>
                    {serverError && <div className="p-3 mt-5 text-white bg-red-500 rounded">{serverError}</div>}
                    <div className="mt-4 text-center">
                        <a href="/login" className="text-sm text-blue-500 hover:underline">Already have an account?</a>
                    </div>
                    <div className="flex gap-4 justify-center mt-2">
                        <Tooltip title="Login with Google">
                            <button onClick={() => { }} className="text-red-500 text-2xl">
                                <FaGoogle />
                            </button>
                        </Tooltip>
                        <Tooltip title="Login with GitHub">
                            <button onClick={() => { }} className="text-gray-800 text-2xl">
                                <FaGithub />
                            </button>
                        </Tooltip>
                        <Tooltip title="Login with Discord">
                            <button onClick={() => { }} className="text-indigo-500 text-2xl">
                                <FaDiscord />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        ))
};

export default Register;