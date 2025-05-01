import Swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    const onClick = () => {
        Swal.fire('Wtf?', "Don't be a freak. It's a nice theme...")
    }

    return (
        <button
            onClick={onClick}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
            {theme === 'dark' ? (
                <FaMoon className="h-5 w-5 text-gray-400" />
            ) : (
                <FaSun className="h-5 w-5 text-yellow-700" />
            )}
        </button>
    );
};

export default ThemeToggleButton;
