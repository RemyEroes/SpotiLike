import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MenuComponent from './components/Menu/MenuComponent'
import UserComponent from './components/User/UserComponent'
import AlbumList from './pages/AlbumList'
import AlbumDetail from './pages/AlbumDetail'
import './style/App.css'
import Noise from './effects/Noise';

function App() {

  const location = useLocation();

  return (
    <>
      <MenuComponent />
      <UserComponent />
      <motion.div
        layout
        layoutId="light"
        // style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1, opacity: 1 }}>
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 38, opacity: 1, pointerEvents: 'none' }}>
        <Noise
          patternSize={250}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
    </motion.div >
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
