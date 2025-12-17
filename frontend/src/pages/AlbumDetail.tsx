import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../style/AlbumDetail.scss';

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

    const indexParsed = parseInt(albumId || "0", 10);
    const albumImg = mediasSrc[indexParsed % 24];

    return (
        <div className='album-detail-container'>
            <div className='album-detail-left'>
                <div className='album-detail-title'>
                    <h2>Album Detail</h2>
                    <h4>12/12/2025</h4>
                </div>

                <h3>Artist Name</h3>

                <motion.img
                    src={`/${albumImg}`}
                    alt="Album cover"

                    layoutId={`album-cover-${albumId}`}
                    layout

                    transition={{
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
                    }}
                />
                <span className='album-detail-copyright'>© 2025 SpotiLike. All rights reserved.</span>
            </div>
            <div className='album-detail-right'>
                <div className='album-detail-genres-container'>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                    <div className='album-detail-genre-item'>
                        <img src="/assets/genres/rock.svg" alt="Rock" />
                        <span>Rock</span>
                    </div>
                </div>
                <h3>About this album</h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <h3>Tracks</h3>
                <div className='album-detail-tracks-container'>
                    <div className='album-detail-track-item'>
                        <span className='title'>Track One</span>
                        <span>3:45</span>
                    </div>
                    <div className='track-separator'/>
                    <div className='album-detail-track-item'>
                        <span className='title'>Track Two</span>
                        <span>feat: artist, artist</span>
                        <span>4:20</span>
                    </div>
                    <div className='track-separator'/>
                    <div className='album-detail-track-item'>
                        <span className='title'>Track Three</span>
                        <span>feat: artist</span>
                        <span>5:10</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlbumDetail;
