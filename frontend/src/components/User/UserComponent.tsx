import { useContext, useState } from 'react'
import { motion } from "framer-motion";
import { LoggedContext } from '../../context/LoggedContext.tsx'
import '../../style/User.scss'
import UserNav from './UserNav.tsx';

function UserComponent() {
    const { isLoggedIn, username } = useContext(LoggedContext);
    const [showNav, setShowNav] = useState(false);
   
    return (
        <div className="user-container">
            <motion.div 
                className={`user-component ${isLoggedIn ? 'logged-in' : ''}`} 
                onClick={() => setShowNav(!showNav)}
                
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
                {!isLoggedIn && <img src="assets/user.svg" alt="User Icon" />}
                {isLoggedIn && <span className="username">{username?.[0] || "G"}</span>}
            </motion.div>

            <UserNav showNav={showNav} setShowNav={setShowNav} />
        </div>
    )
}

export default UserComponent
