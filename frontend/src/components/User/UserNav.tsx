import { useContext } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { LoggedContext } from '../../context/LoggedContext.tsx'
import '../../style/User.scss'

function UserNav({ showNav, setShowNav }: { showNav: boolean; setShowNav: (show: boolean) => void }) {
    const { isLoggedIn, setIsLoggedIn } = useContext(LoggedContext);

    const initialStyle = { opacity: 0, y: -10, scale: 0.8 };
    const animateStyle = { opacity: 1, y: 0, scale: 1 };
    const exitStyle = { opacity: 0, y: -10, scale: 0.8 };

    return (
        <AnimatePresence>
            {showNav && (
            <motion.div className='user-nav'>
                {isLoggedIn ? (
                    <>
                        <motion.a
                            href="/profile"
                            initial={initialStyle}
                            animate={animateStyle}
                            exit={exitStyle}
                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        >Profile</motion.a>
                        <motion.a
                            href="/logout"
                            onClick={() => setIsLoggedIn(false)}
                            initial={initialStyle}
                            animate={animateStyle}
                            exit={exitStyle}
                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1], delay: 0.05 }}
                        >Logout</motion.a>
                    </>
                ) : (
                    <>
                        <motion.a href="/login" onClick={() => setIsLoggedIn(true)}>Login</motion.a>
                        <motion.a href="/register">Register</motion.a>
                    </>
                )}


            </motion.div>)}
        </AnimatePresence>
    )
}

export default UserNav
