import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTelegramPlane, FaTimes } from 'react-icons/fa';

const ChatWindow = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const sendMessage = async (customMessage) => {
        const msg = customMessage || message;
        if (msg.trim() === '') return;

        setChatHistory(prev => [...prev, { sender: 'user', text: msg }]);
        setMessage('');
        setLoading(true);

        const no_thinkking_message = msg + "\n/no_think";

        try {
            const response = await axios.post('http://localhost:5080/api/generate', {
                prompt: no_thinkking_message,
            });

            const cleanedString = response.data.trim();
            const withoutOuterQuotes = cleanedString.startsWith('"') ? cleanedString.slice(1, -1) : cleanedString;
            const unescapedString = withoutOuterQuotes.replace(/\\"/g, '"');
            const jsonStrings = unescapedString.split('\n');
            // const objectsArray = jsonStrings.map(str => JSON.parse(str));
            const objectsArray = [];
            for (const str of unescapedString.split('\n')) {
                try {
                    const obj = JSON.parse(str);
                    objectsArray.push(obj);
                } catch (err) {
                    console.error("Failed to parse line:", str);
                    console.error("Error:", err);
                }
            }

            const combinedString = objectsArray.map(item => item.response).join('');

            console.log(combinedString);

            simulateTyping(combinedString);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const simulateTyping = (fullText) => {
        const words = fullText.split(' ');
        let currentText = '';
        let index = 0;

        setChatHistory(prev => [...prev, { sender: 'bot', text: '' }]);

        const interval = setInterval(() => {
            if (index >= words.length) {
                clearInterval(interval);
                return;
            }

            currentText += (index > 0 ? ' ' : '') + words[index];
            index++;

            setChatHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { sender: 'bot', text: currentText };
                return updated;
            });
        }, 100);
    };

    const formatText = (text) => {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>');
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <FaTelegramPlane className="text-white text-2xl" />
                </button>
            )}

            {isOpen && (
                <div className="bg-white shadow-lg rounded-lg w-80 md:w-96 p-4 border border-gray-300 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold text-lg">Chat</h2>
                        <button onClick={() => setIsOpen(false)}>
                            <FaTimes className="text-gray-500 hover:text-gray-700 text-xl" />
                        </button>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto mb-2 border-b border-gray-200 p-2 space-y-2"
                    >
                        {chatHistory.length === 0 && !loading ? (
                            <div className="flex flex-col gap-3 items-center text-center text-gray-400 text-sm px-4">
                                <p>
                                    👋 Welcome to our Event Manager Assistant, <strong>Gayorgiy Eventovich</strong>!<br />
                                    What can I help you with?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { text: 'Show me the top 5 events', emoji: '✅' },
                                        { text: 'Give me a random event', emoji: '🎲' },
                                        { text: 'List all events under $50', emoji: '💸' },
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(item.text)}
                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded-full"
                                        >
                                            {item.emoji} {item.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            chatHistory.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[75%] p-2 rounded-xl text-sm
                                            ${msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                : 'bg-gray-100 text-black'
                                            }
                                        `}
                                        dangerouslySetInnerHTML={{
                                            __html: formatText(msg.text),
                                        }}
                                    ></div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-center">
                                <div className="text-gray-500 text-sm">Loading...</div>
                            </div>
                        )}
                    </div>

                    <div className="flex mt-2">
                        <input
                            type="text"
                            className="flex-grow p-2 border border-gray-300 rounded-l-lg"
                            placeholder="Type a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                        />
                        <button
                            className="p-2 bg-blue-500 text-white rounded-r-lg"
                            onClick={() => sendMessage()}
                            disabled={loading}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
