import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MenuComponent from './components/Menu/MenuComponent'
import UserComponent from './components/User/UserComponent'
import AlbumList from './pages/AlbumList'
import AlbumDetail from './pages/AlbumDetail'
import './style/App.css'

function App() {

  const location = useLocation();

  return (
    <>
        <MenuComponent />
        <UserComponent />
        {/* <AnimatePresence> */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AlbumList />} />
            <Route path="/albums/:albumId" element={<AlbumDetail />} />
            <Route path="/albums" element={<AlbumList />} />
          </Routes>
        </AnimatePresence>
    </>
  )
}

export default App;
