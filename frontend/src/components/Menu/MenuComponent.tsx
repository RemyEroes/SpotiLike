import { useState } from 'react';
import '../../style/Menu.scss'
import { motion, AnimatePresence } from 'framer-motion';

function MenuComponent() {
  const [showMenu, setShowMenu] = useState(false);

  const initialStyle = { opacity: 0, y: -10, scale: 0.8 };
  const animateStyle = { opacity: 1, y: 0, scale: 1 };
  const exitStyle = { opacity: 0, y: -10, scale: 0.8 };

  return (
    <nav>
      <motion.div
        className='logo'
        onClick={() => setShowMenu(!showMenu)}
        whileTap={{ scale: 0.95 }}

      >
        <img src="/spotilike.svg" alt="spotilike" />
        <h1>SpotiLike</h1>
      </motion.div>
      {showMenu && (
        <AnimatePresence>
          <motion.a
            href="/albums"
            initial={initialStyle}
            animate={animateStyle}
            exit={exitStyle}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >Albums</motion.a>

          <motion.a
            href="/artists"
            initial={initialStyle}
            animate={animateStyle}
            exit={exitStyle}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1], delay: 0.05 }}
          >Artists</motion.a>

        </AnimatePresence>
      )}
    </nav>
  )
}

export default MenuComponent
