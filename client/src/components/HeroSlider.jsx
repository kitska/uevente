import React, { useState, useEffect } from 'react';
import { api } from '../services';
import { Link } from 'react-router-dom';

// const slides = [
//     {
//         id: 1,
//         image: 'https://esportsinsider.com/wp-content/uploads/2025/01/the-international-2025-location-revealed.jpg',
//         title: 'The International 2025',
//         description: "That's right. The stars have aligned and the stage is once again being set for cosmic battle. And this time, that battle has returned to where it all began: Germany, the site of The International's humble debut on the world stage, where it was watched in person by many tens of people. Now, fourteen years later, The International returns to Germany, to Hamburg's Barclays Arena September 11 - 14 — in front of, we trust, a slightly bigger crowd this time around.",
//         price: '$199'
//     },
//     {
//         id: 2,
//         image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cG9yc2NoZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D',
//         title: 'Porsche Exhibition',
//         description: 'Yeah some dudes bring their porsches and we are going to look at them. Have fun...',
//         price: '$200'
//     },
//     {
//         id: 3,
//         image: 'https://i.pinimg.com/1200x/0c/6e/a5/0c6ea5eab1c1fe08bc820f03763782a7.jpg',
//         title: 'Chemistry Lecture',
//         description: "Jesse we need to cook. Let dive deeply in the world of chemistry and learn a couple of nice things...",
//         price: '$9.99'
//     },
//     {
//         id: 4,
//         image: 'https://i.pinimg.com/1200x/0e/10/35/0e1035e4818ce2f47d09bea3bf95af41.jpg',
//         title: 'Psycho Evening',
//         description: 'Spend time watching the one of the best movies in the world',
//         price: '$20'
//     },
//     {
//         id: 5,
//         image: 'https://wallpapersok.com/images/hd/digital-illustration-of-fast-and-furious-dubzjas3amqndn86.jpg',
//         title: 'Fast & Furious Street Racing',
//         description: 'Experience the thrill of underground racing in this high-octane event where speed, style, and skill collide. Compete against top drivers in intense street circuits, show off your customized ride, and feel the adrenaline of pure street power. Only the fastest survive!',
//         price: '$50'
//     }
// ];

const HeroSlider = () => {
    const [current, setCurrent] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await api.get('/events/first-five-events');

            const enrichedEvents = response.data.events.map((event, index) => ({
                ...event,
                eventId: event.id, // original database ID
                id: index          // index in the array
            }));

            setSlides(response.data.events);
        }

        fetchEvents();

        // const interval = setInterval(() => {
        //     setCurrent((prev) => (prev + 1) % slides.length);
        //     console.log(current);
        //     console.log(slides)
        // }, 5000); 
        // return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (!touchStartX) return;
        const touchEndX = e.touches[0].clientX;
        const distance = touchStartX - touchEndX;

        if (Math.abs(distance) > 50) {
            if (distance > 0) {
                // Swipe left
                setCurrent((prev) => (prev + 1) % slides.length);
            } else {
                // Swipe right
                setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
            }
            setTouchStartX(null); // Reset
        }
    };

    const goToSlide = (index) => {
        setCurrent(index);
    };

    return (
        <div
            data-aos="fade-up"
            className="relative h-screen overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100 z-20' : 'opacity-0 z-10'
                        }`}
                >
                    <img
                        src={slide.poster}
                        alt={slide.title}
                        className="w-full h-full object-cover brightness-[0.3]"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                        <h2 className="mb-4 text-4xl font-bold">{slide.title}</h2>
                        <p className="max-w-xl mb-4 text-lg">{slide.description}</p>
                        <p className="mb-6 text-xl font-semibold">${slide.price}</p>
                        <Link to={`/event/${slide.id}`}>
                            <button className="px-6 py-2 text-black transition bg-white rounded shadow hover:bg-gray-200">
                                Go to the event
                            </button>
                        </Link>
                    </div>
                </div>
            ))}

            {/* Round Dots */}
            <div className="absolute z-30 flex gap-2 transform -translate-x-1/2 bottom-6 left-1/2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-7 h-3 rounded-full ${current === index ? 'bg-white' : 'bg-white/50'
                            } hover:scale-110 transition`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
