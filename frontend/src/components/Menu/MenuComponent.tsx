import React from 'react'
import '../../style/Menu.scss'

function MenuComponent() {
  return (
    <nav>
      <div className='logo'>
        <img src="/spotilike.svg" alt="spotilike" />
        <h1>SpotiLike</h1>
      </div>
      <a href="/home">Home</a>
      <a href="/search">Search</a>
    </nav>
  )
}

export default MenuComponent
