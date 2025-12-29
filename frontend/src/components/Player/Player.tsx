import React, { use, useContext, useEffect } from 'react'
import { AnimatePresence, motion, scale, type Variants } from 'framer-motion'
import { PlayerContext } from '../../context/PlayerContext.tsx'
import '../../style/Player.scss'
import PlayPauseButton from './PlayPauseButton.tsx';

function Player() {

    const { isPlaying, setIsPlaying, currentTrack, setCurrentTrack, position, setPosition, closePlayer } = useContext(PlayerContext);

    const initial = {
        left: '50%',
        bottom: '3%',
        y: 100,
        x: position === 'center' ? '-50%' : 0,
        scaleX: 0,
        scaleY: 0,
    };
    const animate = {
        left: position === 'center' ? '50%' : '5%',
        bottom: '3%',
        y: 0,
        x: position === 'center' ? '-50%' : 0,
        scaleX: 1,
        scaleY: 1,
    };
    const exit = {
        left: position === 'center' ? '50%' : '5%',
        bottom: '3%',
        y: 100,
        x: position === 'center' ? '-50%' : 0,
        scaleX: 0,
        scaleY: 0,
    };

    return (
        <AnimatePresence>
            {currentTrack &&
                <motion.div
                    className="player"
                    layoutId="player-component"
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <PlayPauseButton />
                    <div className="player-track-info">
                        <h4>{currentTrack}</h4>
                    </div>
                    <div className="player-buttons">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            src={'/assets/icons/play-next.svg'}
                            alt=""
                            // TODO : implement next track functionality
                        />
                        <motion.img
                            initial={{ opacity: 0.7 }}
                            whileHover={{ scale: 1.05, opacity: 1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            src={'/assets/icons/close.svg'}
                            alt=""
                            id='player-close'
                            onClick={closePlayer}
                        />
                    </div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default Player
