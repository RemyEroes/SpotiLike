import { useState } from 'react'
import '../../style/User.scss'

function UserComponent() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [username, setUsername] = useState("Guest");
    
    return (
        <div className={`user-component ${isLoggedIn ? 'logged-in' : ''}`}>
            {!isLoggedIn && <img src="assets/user.svg" alt="User Icon" />}
            {isLoggedIn && <span className="username">{username[0]}</span>}
        </div>
    )
}

export default UserComponent
