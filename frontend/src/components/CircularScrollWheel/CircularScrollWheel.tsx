// import { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import "../../style/CircularScrollWheel.scss";
// import { useNavigate } from "react-router-dom";
// import {motion} from 'framer-motion';


// const mediasSrc = [
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
//      "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
//      "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/random-access-memories.png",
//      "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",

// ];

// function CircularScrollWheel() {
//     const containerRef = useRef<HTMLDivElement>(null);

//     const rotationRef = useRef(0);
//     const [centerIndex, setCenterIndex] = useState<number>(0);

//     const [clickedUniqueIndex, setClickedUniqueIndex] = useState<number | null>(null);

//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!containerRef.current) return;
//         const container = containerRef.current;

//         const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
//         const total = medias.length;
//         const anglePerItem = 360 / total;

//         let snapTimeout: ReturnType<typeof setTimeout>;

//         // Setup initial
//         medias.forEach((el, index) => {
//             // On stocke l'angle de base pour le calcul du Z-Index
//             el.dataset.angle = String(anglePerItem * index);

//             gsap.set(el, { rotation: anglePerItem * index });
//             // const img = el.querySelector(".media");
//             // if (img) gsap.set(img, { yPercent: -50, transformOrigin: "50% 50%" });
//         });

//         const rotTo = gsap.quickTo(container, "rotation", {
//             duration: 0.5,
//             ease: "power3.out"
//         });

//         // --- MISE À JOUR (Index + Z-Index) ---
//         // Le Z-index est crucial pour que le clic fonctionne sur l'élément visuellement au premier plan
//         const updateState = () => {
//             const currentRot = rotationRef.current;

//             // 1. Calcul de l'index actif
//             const rawIndex = Math.round(-currentRot / anglePerItem);
//             const normalizedIndex = ((rawIndex % total) + total) % total;

//             setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

//             // 2. Calcul dynamique du Z-Index
//             medias.forEach((el) => {
//                 const baseAngle = parseFloat(el.dataset.angle || "0");

//                 // Calcul de la distance angulaire par rapport au centre (0°)
//                 let angleDiff = Math.abs((baseAngle + currentRot) % 360);
//                 if (angleDiff > 180) angleDiff = 360 - angleDiff;

//                 // L'élément le plus proche de 0° a le plus grand z-index
//                 const zIndex = Math.round(1000 - angleDiff);
//                 el.style.zIndex = String(zIndex);
//             });
//         };

//         const snapToClosest = () => {
//             const currentRot = rotationRef.current;
//             const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

//             gsap.to(container, {
//                 rotation: snapRot,
//                 duration: 0.5,
//                 ease: "power3.out",
//                 onUpdate: () => {
//                     rotationRef.current = gsap.getProperty(container, "rotation") as number;
//                     updateState();
//                 },
//                 onComplete: () => {
//                     rotationRef.current = snapRot;
//                     updateState();
//                 }
//             });
//         };

//         const onWheel = (e: WheelEvent) => {
//             rotationRef.current -= e.deltaY / 20;
//             rotTo(rotationRef.current);
//             updateState();

//             if (snapTimeout) clearTimeout(snapTimeout);
//             snapTimeout = setTimeout(snapToClosest, 150);
//         };

//         window.addEventListener("wheel", onWheel, { passive: true });

//         // Premier appel pour fixer les z-index initiaux
//         updateState();

//         return () => {
//             window.removeEventListener("wheel", onWheel);
//             if (snapTimeout) clearTimeout(snapTimeout);
//             gsap.killTweensOf(container);
//         };

//     }, []);

//     const handleImageClick = (globalIndex: number) => {
//         const sourceIndex = globalIndex % mediasSrc.length;

//         // 1. On active le layoutId uniquement pour cet élément
//         setClickedUniqueIndex(globalIndex);

//         // 2. On attend 1 seconde avant de naviguer
//         setTimeout(() => {
//             navigate(`/albums/${sourceIndex}`);
//         }, 200);
//     };


//     return (
//         <section className="circular-scroll-wheel">
//             <div className="container" ref={containerRef}>
//                 {mediasSrc.map((src, index) => { // J'ai remis mediasSrc.map car c'est plus simple si pas de clone
//                      // ... logique index ...
//                     const sourceIndex = index % mediasSrc.length;
//                     const targetLayoutId = `album-cover-${sourceIndex}`;

//                     const isClicked = clickedUniqueIndex === index;

//                     return (
//                         <div className="group" key={index}>
//                             <div className="inner-media">
//                                 <motion.img
//                                     className={`media ${centerIndex === index ? 'active' : ''}`}
//                                     src={src}
//                                     alt={`Album ${index}`}
//                                     onClick={() => handleImageClick(index)}

//                                     // 1. LA CLEF DU SUCCÈS : LayoutId
//                                     layoutId={isClicked ? targetLayoutId : undefined}

//                                     // 2. AJOUT IMPORTANT : Props de transition
//                                     // Cela aide Framer à gérer le changement de border-radius et de taille
//                                     layout 

//                                     // 3. Transition précise
//                                     transition={{ 
//                                         type: "spring", 
//                                         stiffness: 300, 
//                                         damping: 30,
//                                         duration: 0.8
//                                     }}

//                                     // 4. Style pour écraser tout reste de conflit (optionnel mais prudent)
//                                     style={{ transformOrigin: "center center" }}
//                                 />
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </section>
//         // <section className="circular-scroll-wheel">
//         //     <div className="container" ref={containerRef}>
//         //         {mediasSrc.map((src, index) => {
//         //             const sourceIndex = index % mediasSrc.length;
//         //             const targetLayoutId = `album-cover-${sourceIndex}`;


//         //             const isClicked = clickedUniqueIndex === index;

//         //             return (
//         //                 <div className="group" key={index}>
//         //                     <div className="inner-media">
//         //                         <motion.img
//         //                             className={`media ${centerIndex === index ? 'active' : ''}`}
//         //                             src={src}
//         //                             alt={`Album ${index}`}
//         //                             onClick={() => handleImageClick(index)}
//         //                             // Le layoutId n'est présent QUE si c'est l'élément cliqué
//         //                             layoutId={isClicked ? targetLayoutId : undefined}
//         //                             transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
//         //                         />
//         //                     </div>
//         //                 </div>
//         //             );
//         //         })}
//         //     </div>
//         // </section>
//     );
// }

// export default CircularScrollWheel;


// import { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import "../../style/CircularScrollWheel.scss";
// import { useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';

// const mediasSrc = [
//     // ... ta liste de sources inchangée
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

// function CircularScrollWheel() {
//     const containerRef = useRef<HTMLDivElement>(null);
//     const rotationRef = useRef(0);
//     const [centerIndex, setCenterIndex] = useState<number>(0);

//     // État pour savoir quel index unique (0 à 23) a été cliqué
//     const [clickedUniqueIndex, setClickedUniqueIndex] = useState<number | null>(null);

//     // État pour bloquer le scroll pendant la transition
//     const [isNavigating, setIsNavigating] = useState(false);

//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!containerRef.current) return;
//         const container = containerRef.current;
//         const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
//         const total = medias.length;
//         const anglePerItem = 360 / total;
//         let snapTimeout: ReturnType<typeof setTimeout>;

//         // Setup initial
//         medias.forEach((el, index) => {
//             el.dataset.angle = String(anglePerItem * index);
//             gsap.set(el, { rotation: anglePerItem * index });
//         });

//         const rotTo = gsap.quickTo(container, "rotation", {
//             duration: 0.5,
//             ease: "power3.out"
//         });

//         const updateState = () => {
//             const currentRot = rotationRef.current;
//             const rawIndex = Math.round(-currentRot / anglePerItem);
//             const normalizedIndex = ((rawIndex % total) + total) % total;

//             setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

//             medias.forEach((el) => {
//                 const baseAngle = parseFloat(el.dataset.angle || "0");
//                 let angleDiff = Math.abs((baseAngle + currentRot) % 360);
//                 if (angleDiff > 180) angleDiff = 360 - angleDiff;
//                 const zIndex = Math.round(1000 - angleDiff);
//                 el.style.zIndex = String(zIndex);
//             });
//         };

//         const snapToClosest = () => {
//             const currentRot = rotationRef.current;
//             const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

//             gsap.to(container, {
//                 rotation: snapRot,
//                 duration: 0.5,
//                 ease: "power3.out",
//                 onUpdate: () => {
//                     rotationRef.current = gsap.getProperty(container, "rotation") as number;
//                     updateState();
//                 },
//                 onComplete: () => {
//                     rotationRef.current = snapRot;
//                     updateState();
//                 }
//             });
//         };

//         const onWheel = (e: WheelEvent) => {
//             // Si on navigue, on interdit le mouvement pour ne pas casser les coordonnées de Framer
//             if (isNavigating) return;

//             rotationRef.current -= e.deltaY / 20;
//             rotTo(rotationRef.current);
//             updateState();

//             if (snapTimeout) clearTimeout(snapTimeout);
//             snapTimeout = setTimeout(snapToClosest, 150);
//         };

//         window.addEventListener("wheel", onWheel, { passive: true });
//         updateState();

//         return () => {
//             window.removeEventListener("wheel", onWheel);
//             if (snapTimeout) clearTimeout(snapTimeout);
//             gsap.killTweensOf(container);
//         };

//     }, [isNavigating]); // Dépendance ajoutée pour bloquer le scroll

//     const handleImageClick = (globalIndex: number) => {
//         if (isNavigating) return; // Anti-double click

//         setIsNavigating(true);
//         setClickedUniqueIndex(globalIndex);

//         // On tue les animations GSAP en cours pour stabiliser le DOM
//         if (containerRef.current) {
//             gsap.killTweensOf(containerRef.current);
//         }

//         const sourceIndex = globalIndex % mediasSrc.length;

//         // ajouter l'image cliquée dans la meme position avant de naviguer en position absolue
//         let origianlImg = document.querySelectorAll('.circular-scroll-wheel .media')[globalIndex] as HTMLImageElement;
//         let imgRect = origianlImg.getBoundingClientRect();

//         const floatingImg = document.createElement('img');
//         floatingImg.src = origianlImg.src;
//         floatingImg.style.position = 'fixed';
//         floatingImg.style.left = `${imgRect.left}px`;
//         floatingImg.style.top = `${imgRect.top}px`;
//         floatingImg.style.width = `${imgRect.width}px`;
//         floatingImg.style.height = `${imgRect.height}px`;
//         floatingImg.style.objectFit = 'cover';
//         floatingImg.style.zIndex = '10000';
//         floatingImg.style.borderRadius = '12px';
//         floatingImg.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
//         floatingImg.style.rotate = '345deg'

//         const framerImage = () => {
//             return (
//                 <motion.img
//                     className={`media`}
//                     src={origianlImg.src}
//                     alt={`Album ${globalIndex}`}

//                     layoutId={`album-cover-${sourceIndex}`}

//                     // Z-Index boost pour passer au dessus des autres pendant la transition
//                     style={{
//                         position: 'fixed',
//                         left: `${imgRect.left}px`,
//                         top: `${imgRect.top}px`,
//                         width: `${imgRect.width}px`,
//                         height: `${imgRect.height}px`,
//                         objectFit: 'cover',
//                         borderRadius: '12px',
//                         boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
//                         zIndex:  9999,
//                         cursor: 'pointer'
//                     }}

//                     transition={{
//                         duration: 0.6,
//                         ease: [0.43, 0.13, 0.23, 0.96] // Easing sophistiqué
//                     }}
//                 />
//             )
//         }

//         document.body.appendChild(framerImage);


//         // Petit délai pour laisser React appliquer le layoutId avant de changer de route
//         // C'est crucial pour que Framer "capture" l'état de départ
//         // setTimeout(() => {
//         //     navigate(`/albums/${sourceIndex}`);
//         // }, 100); 
//     };

//     return (
//         <section className="circular-scroll-wheel">
//             <div className="container" ref={containerRef}>
//                 {mediasSrc.map((src, index) => {
//                     const sourceIndex = index % mediasSrc.length;

//                     // On construit l'ID qui sera partagé avec la page de détail
//                     // Exemple : "album-cover-3"
//                     const sharedLayoutId = `album-cover-${sourceIndex}`;

//                     // Est-ce que c'est L'ÉLÉMENT exact sur lequel on a cliqué ?
//                     const isTheClickedOne = clickedUniqueIndex === index;

//                     return (
//                         <div className="group" key={index}>
//                             <div className="inner-media">
//                                 <motion.img
//                                     className={`media ${centerIndex === index ? 'active' : ''}`}
//                                     src={src}
//                                     alt={`Album ${index}`}
//                                     onClick={() => handleImageClick(index)}

//                                     // LA LOGIQUE CRITIQUE :
//                                     // Seul l'élément cliqué reçoit le layoutId.
//                                     // Les autres copies du même album restent des images statiques.

//                                     // layoutId={isTheClickedOne ? sharedLayoutId : undefined}

//                                     // Z-Index boost pour passer au dessus des autres pendant la transition
//                                     style={{
//                                         zIndex: isTheClickedOne ? 9999 : undefined,
//                                         cursor: 'pointer'
//                                     }}

//                                     transition={{
//                                         duration: 0.6,
//                                         ease: [0.43, 0.13, 0.23, 0.96] // Easing sophistiqué
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </section>
//     );
// }

// export default CircularScrollWheel;


// import { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import "../../style/CircularScrollWheel.scss";
// import { useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';

// const mediasSrc = [
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
//     // ... (reste de ta liste)
//     "assets/medias/alive.png",
//     "assets/medias/beatles.png",
//     "assets/medias/civilisation.png",
//     "assets/medias/da-funk.png",
//     "assets/medias/la-fuite-en-avant.png",
//     "assets/medias/pulsar.png",
//     "assets/medias/random-access-memories.png",
// ];

// // Interface pour stocker les infos de transition
// interface TransitionModel {
//     src: string;
//     index: number;
//     rect: DOMRect;
//     rotation: number; // On capture aussi la rotation visuelle approximative
// }

// function CircularScrollWheel() {
//     const containerRef = useRef<HTMLDivElement>(null);
//     const rotationRef = useRef(0);
//     const [centerIndex, setCenterIndex] = useState<number>(0);
//     const navigate = useNavigate();

//     // Au lieu de manipuler le DOM, on utilise un State pour l'image fantôme
//     const [transitionModel, setTransitionModel] = useState<TransitionModel | null>(null);

//     useEffect(() => {
//         if (!containerRef.current) return;

//         // --- Code GSAP inchangé pour la roue ---
//         const container = containerRef.current;
//         const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
//         const total = medias.length;
//         const anglePerItem = 360 / total;
//         let snapTimeout: ReturnType<typeof setTimeout>;

//         medias.forEach((el, index) => {
//             el.dataset.angle = String(anglePerItem * index);
//             gsap.set(el, { rotation: anglePerItem * index });
//         });

//         const rotTo = gsap.quickTo(container, "rotation", {
//             duration: 0.5,
//             ease: "power3.out"
//         });

//         const updateState = () => {
//             const currentRot = rotationRef.current;
//             const rawIndex = Math.round(-currentRot / anglePerItem);
//             const normalizedIndex = ((rawIndex % total) + total) % total;
//             setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

//             medias.forEach((el) => {
//                 const baseAngle = parseFloat(el.dataset.angle || "0");
//                 let angleDiff = Math.abs((baseAngle + currentRot) % 360);
//                 if (angleDiff > 180) angleDiff = 360 - angleDiff;
//                 const zIndex = Math.round(1000 - angleDiff);
//                 el.style.zIndex = String(zIndex);
//             });
//         };

//         const snapToClosest = () => {
//             const currentRot = rotationRef.current;
//             const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

//             gsap.to(container, {
//                 rotation: snapRot,
//                 duration: 0.5,
//                 ease: "power3.out",
//                 onUpdate: () => {
//                     rotationRef.current = gsap.getProperty(container, "rotation") as number;
//                     updateState();
//                 },
//                 onComplete: () => {
//                     rotationRef.current = snapRot;
//                     updateState();
//                 }
//             });
//         };

//         const onWheel = (e: WheelEvent) => {
//             if (transitionModel) return; // Stop wheel si transition en cours
//             rotationRef.current -= e.deltaY / 20;
//             rotTo(rotationRef.current);
//             updateState();
//             if (snapTimeout) clearTimeout(snapTimeout);
//             snapTimeout = setTimeout(snapToClosest, 150);
//         };

//         window.addEventListener("wheel", onWheel, { passive: true });
//         updateState();

//         return () => {
//             window.removeEventListener("wheel", onWheel);
//             if (snapTimeout) clearTimeout(snapTimeout);
//             gsap.killTweensOf(container);
//         };
//     }, [transitionModel]); // Dépendance importante

//     const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, globalIndex: number) => {
//         if (transitionModel) return;

//         // 1. Figer GSAP immédiatement
//         if (containerRef.current) gsap.killTweensOf(containerRef.current);

//         const target = e.currentTarget;
//         const rect = target.getBoundingClientRect();

//         // Optionnel : Essayer de calculer la rotation actuelle de l'élément parent
//         // Pour simplifier, on part de 0 ou on lit le style transform si besoin.
//         // Ici, rect suffit souvent pour Framer Motion.

//         // 2. Définir le modèle de transition
//         setTransitionModel({
//             src: mediasSrc[globalIndex],
//             index: globalIndex,
//             rect: rect,
//             rotation: 0 // On laisse Framer gérer l'interpolation vers 0
//         });

//         // // 3. Naviguer après un court délai pour laisser le temps à React d'afficher l'image fantôme
//         setTimeout(() => {
//             const sourceIndex = globalIndex % mediasSrc.length;
//             navigate(`/albums/${sourceIndex}`);
//         }, 200);
//     };

//     return (
//         <section className="circular-scroll-wheel">
//             {/* CONTENEUR ROTATIF (GSAP)
//                Note: Les images ici n'ont PAS de layoutId pour ne pas troubler Framer
//             */}
//             <div className="container" ref={containerRef}>
//                 {mediasSrc.map((src, index) => {
//                     // Si une transition est en cours sur cet index, on cache l'original
//                     // pour ne voir que l'image fantôme
//                     const isTransitioning = transitionModel?.index === index;

//                     return (
//                         <div className="group" key={index}>
//                             <div className="inner-media">
//                                 <img 
//                                     className={`media ${centerIndex === index ? 'active' : ''}`}
//                                     src={src}
//                                     alt={`Album ${index}`}
//                                     onClick={(e) => handleImageClick(e, index)}
//                                     style={{
//                                         opacity: isTransitioning ? 0 : 1, // On cache l'original instantanément
//                                         cursor: 'pointer'
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* IMAGE FANTÔME (FRAMER MOTION)
//                Elle vit en dehors du container rotatif (en direct child de la section ou body)
//                Elle est en position fixed, isolée des transformations GSAP.
//             */}
//             {transitionModel && (
//                 <motion.img
//                     src={transitionModel.src}
//                     // C'est ICI qu'on met le layoutId magique
//                     layoutId={`album-cover-${transitionModel.index % mediasSrc.length}`}

//                     initial={{
//                         position: 'fixed',
//                         top: transitionModel.rect.top,
//                         left: transitionModel.rect.left,
//                         width: transitionModel.rect.width,
//                         height: transitionModel.rect.height,
//                         zIndex: 9999,
//                         objectFit: 'contain', // Important d'avoir le même objectFit que la destination
//                         borderRadius: '0px' // Ajuste selon ton CSS original
//                     }}
//                     // Pas d'animation "animate" ici, le layoutId s'occupe de la transition vers la page suivante
//                     transition={{
//                         duration: 0.6,
//                         ease: [0.43, 0.13, 0.23, 0.96]
//                     }}
//                 />
//             )}
//         </section>
//     );
// }

// export default CircularScrollWheel;


import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../../style/CircularScrollWheel.scss";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

// ... tes imports mediasSrc ...
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

interface TransitionModel {
    src: string;
    index: number;
    rect: DOMRect;
    rotation: number;
}

function CircularScrollWheel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef(0);
    const [centerIndex, setCenterIndex] = useState<number>(0);
    const navigate = useNavigate();

    const [transitionModel, setTransitionModel] = useState<TransitionModel | null>(null);

    // --- SETUP GSAP (Inchangé) ---
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
        const total = medias.length;
        const anglePerItem = 360 / total;
        let snapTimeout: ReturnType<typeof setTimeout>;

        // Setup initial rotation
        medias.forEach((el, index) => {
            el.dataset.angle = String(anglePerItem * index);
            gsap.set(el, { rotation: anglePerItem * index });
        });

        const rotTo = gsap.quickTo(container, "rotation", {
            duration: 0.5,
            ease: "power3.out"
        });

        const updateState = () => {
            const currentRot = rotationRef.current;
            const rawIndex = Math.round(-currentRot / anglePerItem);
            const normalizedIndex = ((rawIndex % total) + total) % total;

            setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

            medias.forEach((el) => {
                const baseAngle = parseFloat(el.dataset.angle || "0");
                let angleDiff = Math.abs((baseAngle + currentRot) % 360);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;
                const zIndex = Math.round(1000 - angleDiff);
                el.style.zIndex = String(zIndex);
            });
        };

        const snapToClosest = () => {
            const currentRot = rotationRef.current;
            const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

            gsap.to(container, {
                rotation: snapRot,
                duration: 0.5,
                ease: "power3.out",
                onUpdate: () => {
                    rotationRef.current = gsap.getProperty(container, "rotation") as number;
                    updateState();
                },
                onComplete: () => {
                    rotationRef.current = snapRot;
                    updateState();
                }
            });
        };

        const onWheel = (e: WheelEvent) => {
            // Si on est en train de transitionner, on bloque le scroll
            if (transitionModel) return;

            rotationRef.current -= e.deltaY / 20;
            rotTo(rotationRef.current);
            updateState();

            if (snapTimeout) clearTimeout(snapTimeout);
            snapTimeout = setTimeout(snapToClosest, 150);
        };

        window.addEventListener("wheel", onWheel, { passive: true });
        updateState();

        return () => {
            window.removeEventListener("wheel", onWheel);
            if (snapTimeout) clearTimeout(snapTimeout);
            gsap.killTweensOf(container);
        };
    }, [transitionModel]);


    // --- GESTION DU CLIC ---
    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, globalIndex: number) => {
        if (transitionModel) return;

        // 1. On fige GSAP
        if (containerRef.current) gsap.killTweensOf(containerRef.current);

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();

        // 2. Calcul de la rotation visuelle actuelle
        // La rotation totale = rotation du conteneur + rotation de l'élément (inner-media)
        // Note: C'est une approximation, mais suffisante pour que Framer prenne le relais
        const anglePerItem = 360 / mediasSrc.length;
        const itemBaseAngle = anglePerItem * globalIndex;
        const containerRotation = gsap.getProperty(containerRef.current, "rotation") as number;
        const currentVisualRotation = containerRotation + itemBaseAngle;

        setTransitionModel({
            src: mediasSrc[globalIndex],
            index: globalIndex,
            rect: rect,
            rotation: currentVisualRotation
        });
        console.log('Transition model set:', {
            src: mediasSrc[globalIndex],
            index: globalIndex,
            rect: rect,
            rotation: currentVisualRotation
        });

        // 3. Navigation
        // On navigue quasi instantanément. Grâce à AnimatePresence, 
        // ce composant restera monté le temps que l'autre arrive.
        setTimeout(() => {
            // Assure-toi que c'est le même ID que dans AlbumDetail (modulo length)
            const sourceIndex = globalIndex % mediasSrc.length; // ou globalIndex si tu gères l'id unique
            navigate(`/albums/${sourceIndex}`);
        }, 50);
    };

    return (
        <section className="circular-scroll-wheel">
            {/* IMPORTANT: 
               On ajoute un exit opacity: 0 au conteneur GLOBAL de la roue 
               pour que tout disparaisse sauf l'image layoutId lors de la navigation 
            */}
            <motion.div
                className="container"
                ref={containerRef}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
                {mediasSrc.map((src, index) => {
                    const isTransitioning = transitionModel?.index === index;
                    return (
                        <div className="group" key={index}>
                            <div className="inner-media">
                                <img
                                    className={`media ${centerIndex === index ? 'active' : ''}`}
                                    src={src}
                                    alt={`Album ${index}`}
                                    onClick={(e) => handleImageClick(e, index)}
                                    style={{
                                        // On cache l'original dès qu'on clique
                                        opacity: isTransitioning ? 0 : 1,
                                        transition: 'opacity 0.2s',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* IMAGE FANTÔME (SHARED ELEMENT) */}
            {transitionModel && (
                <motion.img
                    src={transitionModel.src}
                    // Le layoutId magique
                    layoutId={`album-cover-${transitionModel.index}`}

                    className="media active"

                    initial={{
                        position: 'fixed',
                        top: `calc(${transitionModel.rect.top}px + 6vw)`, // Ajustement pour centrer
                        left: transitionModel.rect.left,
                        width: '20vw',
                        height: '20vw', //carree
                        transform: 'rotate(0deg)',
                        zIndex: 9999,
                    }}

                    style={{
                        // On écrase le margin du CSS .media pour éviter le décalage vers le bas
                        margin: 0,
                        transformOrigin: 'center center'
                    }}

                    transition={{
                        duration: 0.6,
                        ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                />
            )}
        </section>
    );
}

export default CircularScrollWheel;
