// import { useParams } from 'react-router-dom';
// import { motion } from 'framer-motion';



// const mediasSrc = [
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/random-access-memories.png",
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",

// ];
// function AlbumDetail() {
//     // CORRECTION ICI : on déstructure albumId au lieu de id
//     const { albumId } = useParams();

//     // On utilise albumId ici
//     const albumIndex = parseInt(albumId || "0") % mediasSrc.length;
//     const albumImg = mediasSrc[albumIndex];

//     return (
//         <div className="album-detail-page" style={{ padding: '40px', textAlign: 'center' }}>
//             <div style={{ marginTop: '50px' }}>
//                 <motion.img
//                     src={`/${albumImg}`}
//                     alt="Album cover"
//                     style={{ width: '300px', height: '300px' }}
//                     // IMPORTANT : Le layoutId doit correspondre à celui de la liste
//                     layoutId={`album-cover-${albumId}`}
//                     layout
//                 />
//             </div>
//         </div>
//     );
// }

// export default AlbumDetail;


import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// On réimporte ou on déplace mediasSrc dans un fichier de config commun
// pour éviter les désynchronisations.
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
    const { albumId } = useParams();
    const navigate = useNavigate();

    // Conversion sécurisée
    const indexParsed = parseInt(albumId || "0", 10);
    // On s'assure de récupérer la bonne string
    const albumImg = mediasSrc[indexParsed % 24]; // ou mediasSrc.length si importé

    return (

        <>
            <div style={{ width: "100vw", height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <motion.img
                    // Attention : src doit être identique à la liste.
                    // Si dans la liste c'est "assets/...", ici aussi.
                    // Si tu mets un "/" devant dans l'un, mets-le dans l'autre.
                    src={`/${albumImg}`}
                    alt="Album cover"

                    style={{
                        width: '400px', // Plus grand que dans la roue
                        height: '400px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                    }}

                    // Doit matcher EXACTEMENT celui généré dans la liste
                    layoutId={`album-cover-${albumId}`}
                    layout

                    transition={{
                        duration: 0.6,
                        ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                />
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ color: 'white', marginTop: '20px' }}
            >
                Album {albumId}
            </motion.h1>
        </>
    );
}

export default AlbumDetail;
