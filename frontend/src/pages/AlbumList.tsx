import { useContext, useEffect } from 'react'
import CircularScrollWheel from '../components/CircularScrollWheel/CircularScrollWheel'
import { PlayerContext } from '../context/PlayerContext';

function AlbumList() {
    const { setPosition } = useContext(PlayerContext);

    useEffect(() => {
        setPosition('center');
    }, []);

  return (
      <CircularScrollWheel type="album" />
  )
}

export default AlbumList
