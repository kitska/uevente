import { FaTrash } from "react-icons/fa";

const Comment = ({ id, content, isAdmin, onDelete }) => {
    return (
        <div data-aos="fade-up" className="flex justify-between p-4 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-800">{content}</p>

            {isAdmin && (
                <button onClick={() => onDelete(id)} className="ml-4 text-red-600 hover:text-red-800">
                    <FaTrash />
                </button>
            )}
        </div>
    );
};

export default Comment;