import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../../style/CircularScrollWheel.scss";
import { useNavigate } from "react-router-dom";
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

function CircularScrollWheel() {
    const containerRef = useRef<HTMLDivElement>(null);

    const rotationRef = useRef(0);
    const [centerIndex, setCenterIndex] = useState<number>(0);

    const [clickedUniqueIndex, setClickedUniqueIndex] = useState<number | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
        const total = medias.length;
        const anglePerItem = 360 / total;

        let snapTimeout: ReturnType<typeof setTimeout>;

        // Setup initial
        medias.forEach((el, index) => {
            // On stocke l'angle de base pour le calcul du Z-Index
            el.dataset.angle = String(anglePerItem * index);

            gsap.set(el, { rotation: anglePerItem * index });
            // const img = el.querySelector(".media");
            // if (img) gsap.set(img, { yPercent: -50, transformOrigin: "50% 50%" });
        });

        const rotTo = gsap.quickTo(container, "rotation", {
            duration: 0.5,
            ease: "power3.out"
        });

        // --- MISE À JOUR (Index + Z-Index) ---
        // Le Z-index est crucial pour que le clic fonctionne sur l'élément visuellement au premier plan
        const updateState = () => {
            const currentRot = rotationRef.current;

            // 1. Calcul de l'index actif
            const rawIndex = Math.round(-currentRot / anglePerItem);
            const normalizedIndex = ((rawIndex % total) + total) % total;

            setCenterIndex((prev) => (prev !== normalizedIndex ? normalizedIndex : prev));

            // 2. Calcul dynamique du Z-Index
            medias.forEach((el) => {
                const baseAngle = parseFloat(el.dataset.angle || "0");

                // Calcul de la distance angulaire par rapport au centre (0°)
                let angleDiff = Math.abs((baseAngle + currentRot) % 360);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;

                // L'élément le plus proche de 0° a le plus grand z-index
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
            rotationRef.current -= e.deltaY / 20;
            rotTo(rotationRef.current);
            updateState();

            if (snapTimeout) clearTimeout(snapTimeout);
            snapTimeout = setTimeout(snapToClosest, 150);
        };

        window.addEventListener("wheel", onWheel, { passive: true });

        // Premier appel pour fixer les z-index initiaux
        updateState();

        return () => {
            window.removeEventListener("wheel", onWheel);
            if (snapTimeout) clearTimeout(snapTimeout);
            gsap.killTweensOf(container);
        };

    }, []);

    const handleImageClick = (globalIndex: number) => {
        const sourceIndex = globalIndex % mediasSrc.length;
        
        // 1. On active le layoutId uniquement pour cet élément
        setClickedUniqueIndex(globalIndex);

        // 2. On attend 1 seconde avant de naviguer
        setTimeout(() => {
            navigate(`/albums/${sourceIndex}`);
        }, 200);
    };


    return (
        <section className="circular-scroll-wheel">
            <div className="container" ref={containerRef}>
                {mediasSrc.map((src, index) => { // J'ai remis mediasSrc.map car c'est plus simple si pas de clone
                     // ... logique index ...
                    const sourceIndex = index % mediasSrc.length;
                    const targetLayoutId = `album-cover-${sourceIndex}`;

                    const isClicked = clickedUniqueIndex === index;

                    return (
                        <div className="group" key={index}>
                            <div className="inner-media">
                                <motion.img
                                    className={`media ${centerIndex === index ? 'active' : ''}`}
                                    src={src}
                                    alt={`Album ${index}`}
                                    onClick={() => handleImageClick(index)}
                                    
                                    // 1. LA CLEF DU SUCCÈS : LayoutId
                                    layoutId={isClicked ? targetLayoutId : undefined}
                                    
                                    // 2. AJOUT IMPORTANT : Props de transition
                                    // Cela aide Framer à gérer le changement de border-radius et de taille
                                    layout 
                                    
                                    // 3. Transition précise
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 300, 
                                        damping: 30,
                                        duration: 0.8
                                    }}
                                    
                                    // 4. Style pour écraser tout reste de conflit (optionnel mais prudent)
                                    style={{ transformOrigin: "center center" }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
        // <section className="circular-scroll-wheel">
        //     <div className="container" ref={containerRef}>
        //         {mediasSrc.map((src, index) => {
        //             const sourceIndex = index % mediasSrc.length;
        //             const targetLayoutId = `album-cover-${sourceIndex}`;


        //             const isClicked = clickedUniqueIndex === index;

        //             return (
        //                 <div className="group" key={index}>
        //                     <div className="inner-media">
        //                         <motion.img
        //                             className={`media ${centerIndex === index ? 'active' : ''}`}
        //                             src={src}
        //                             alt={`Album ${index}`}
        //                             onClick={() => handleImageClick(index)}
        //                             // Le layoutId n'est présent QUE si c'est l'élément cliqué
        //                             layoutId={isClicked ? targetLayoutId : undefined}
        //                             transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        //                         />
        //                     </div>
        //                 </div>
        //             );
        //         })}
        //     </div>
        // </section>
    );
}

export default CircularScrollWheel;

