import React, { useRef, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import music from "../assets/music.mp3";
import catGif from "../assets/cat.gif";

const SomethingInteresting = observer(() => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        if (audio) {
            audio.addEventListener("play", handlePlay);
            audio.addEventListener("pause", handlePause);
        }

        return () => {
            if (audio) {
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("pause", handlePause);
            }
        };
    }, []);

    return (
        <div className="flex h-max p-4 relative">
            {/* Background cat gif */}
            {isPlaying && (
                <img
                    src={catGif}
                    alt="Cat Dancing"
                    className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-50"
                />
            )}

            {/* Content */}
            <div className="w-full relative z-10">
                <div className="flex flex-col flex-1 items-center w-full">
                    <h1 className="text-3xl mb-5">play it</h1>
                    <div className="justify-center">
                        <audio ref={audioRef} controls loop>
                            <source src={music} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            </div>
        </div>

    );
});

export default Main;
