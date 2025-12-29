import { useContext } from 'react'
import { PlayerContext } from '../../context/PlayerContext';
import '../../style/Player.scss'
import { motion, type Variants } from 'framer-motion';


function PlayPauseButton() {
    const { isPlaying, setIsPlaying } = useContext(PlayerContext);

    const buttonVariants: Variants = {
        initial: {
            backgroundColor: "transparent",
        },
        hover: {
            backgroundColor: "#1cc557ff",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        tap: {
            scale: 0.9,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    };

    const iconVariants = {
        hover: { scale: 1.05 },
        initial: { scale: 1 }
    };

    return (
        <motion.button
            className="play-pause-button"
            onClick={() => setIsPlaying(!isPlaying)}
            initial="initial"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
        >
            <motion.img
                src={isPlaying ? "/assets/icons/pause.svg" : "/assets/icons/play.svg"}
                alt={isPlaying ? "Pause" : "Play"}
                variants={iconVariants}
                id={isPlaying ? "pause-icon" : "play-icon"}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
        </motion.button>
    )
}

export default PlayPauseButton
