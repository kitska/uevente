const Comment = ({ id, content }) => {
    return (
        <div data-aos="fade-up" className="p-4 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-800">{content}</p>
        </div>
    );
};

export default Comment;
