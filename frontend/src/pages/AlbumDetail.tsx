import { useParams } from 'react-router-dom';
import {motion} from 'framer-motion';



const mediasSrc = [
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/da-funk.png",
    "assets/medias/la-fuite-en-avant.png",
    "assets/medias/pulsar.png",
    "assets/medias/random-access-memories.png",
     "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/da-funk.png",
    "assets/medias/la-fuite-en-avant.png",
    "assets/medias/pulsar.png",
    "assets/medias/random-access-memories.png",
     "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/random-access-memories.png",
     "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",
    "assets/medias/alive.png",
    "assets/medias/beatles.png",
    "assets/medias/civilisation.png",

];
function AlbumDetail() {
  // CORRECTION ICI : on déstructure albumId au lieu de id
  const { albumId } = useParams(); 

  // On utilise albumId ici
  const albumIndex = parseInt(albumId || "0") % mediasSrc.length;
  const albumImg = mediasSrc[albumIndex];

  return (
    <div className="album-detail-page" style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ marginTop: '50px' }}>
        <motion.img 
          src={`/${albumImg}`} 
          alt="Album cover" 
          style={{ width: '300px', height: '300px', borderRadius: '15px' }} 
          // IMPORTANT : Le layoutId doit correspondre à celui de la liste
          layoutId={`album-cover-${albumId}`} 
          layout
        />
      </div>
    </div>
  );
}

export default AlbumDetail;
