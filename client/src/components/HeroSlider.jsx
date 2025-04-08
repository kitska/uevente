import React, { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        image: 'https://esportsinsider.com/wp-content/uploads/2025/01/the-international-2025-location-revealed.jpg',
        title: 'The International 2025',
        description: "That's right. The stars have aligned and the stage is once again being set for cosmic battle. And this time, that battle has returned to where it all began: Germany, the site of The International's humble debut on the world stage, where it was watched in person by many tens of people. Now, fourteen years later, The International returns to Germany, to Hamburg's Barclays Arena September 11 - 14 — in front of, we trust, a slightly bigger crowd this time around.",
        price: '$199'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cG9yc2NoZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Porsche Exhibition',
        description: 'Yeah some dudes bring their porsches and we are going to look at them. Have fun...',
        price: '$200'
    },
    {
        id: 3,
        image: 'https://i.pinimg.com/1200x/64/1e/9b/641e9ba2ae6f6ba9585365d30efa09b4.jpg',
        title: 'Chemistry Lecture',
        description: "Jesse we need to cook. Let dive deeply in the world of chemistry and learn a couple of nice things...",
        price: '$9.99'
    },
    {
        id: 4,
        image: 'https://i.pinimg.com/1200x/0e/10/35/0e1035e4818ce2f47d09bea3bf95af41.jpg',
        title: 'Psycho Evening',
        description: 'Spend time watching the one of the best movies in the world',
        price: '$20'
    },
    {
        id: 5,
        image: 'https://wallpapersok.com/images/hd/digital-illustration-of-fast-and-furious-dubzjas3amqndn86.jpg',
        title: 'Fast & Furious Street Racing',
        description: 'Experience the thrill of underground racing in this high-octane event where speed, style, and skill collide. Compete against top drivers in intense street circuits, show off your customized ride, and feel the adrenaline of pure street power. Only the fastest survive!',
        price: '$50'
    }
];

const HeroSlider = () => {
    const [current, setCurrent] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 15000); // Change slide every 5 seconds
        return () => clearInterval(interval); // Cleanup interval on component unmount
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
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover brightness-[0.3]"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-6 text-center">
                        <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                        <p className="text-lg max-w-xl mb-4">{slide.description}</p>
                        <p className="text-xl font-semibold mb-6">{slide.price}</p>
                        <button className="bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200 transition">
                            Buy Ticket
                        </button>
                    </div>
                </div>
            ))}

            {/* Round Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full ${current === index ? 'bg-white' : 'bg-white/50'
                            } hover:scale-110 transition`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
