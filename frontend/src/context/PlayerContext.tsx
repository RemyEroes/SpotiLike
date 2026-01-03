import React, { useState, createContext } from 'react';


type PlayerContextType = {
    isPlaying: boolean;
    currentTrack: string | null;
    position: string | null;
    setIsPlaying: (value: boolean) => void;
    setCurrentTrack: (value: string | null) => void;
    setPosition: (value: string) => void;
    closePlayer: () => void;
};

export const PlayerContext = createContext<PlayerContextType>(
    {} as PlayerContextType
);

export function PlayerProvider({ children }: { children: React.ReactNode }) {

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTrack, setCurrentTrack] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('player-currentTrack');
            return saved || null;
        }
        return null;
    });
    const [position, setPosition] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('player-position');
            return saved || 'center';
        }
        return 'center';
    });


    const closePlayer = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
        localStorage.removeItem('player-currentTrack');
        localStorage.removeItem('player-isPlaying');
    };



    const value = { isPlaying, setIsPlaying, currentTrack, setCurrentTrack, position, setPosition, closePlayer };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}
