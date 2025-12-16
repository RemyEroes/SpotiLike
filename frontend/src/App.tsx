import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuComponent from './components/Menu/MenuComponent'
import UserComponent from './components/User/UserComponent'
import AlbumList from './pages/AlbumList'
import './style/App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <MenuComponent />
        <UserComponent />
        <Routes>
          <Route path="/" element={<AlbumList />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
