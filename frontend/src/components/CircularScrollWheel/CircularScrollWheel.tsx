// import { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import "../../style/CircularScrollWheel.scss";

// const mediasSrc = [
//   "assets/medias/alive.png",
//   "assets/medias/beatles.png",
//   "assets/medias/civilisation.png",
//   "assets/medias/da-funk.png",
//   "assets/medias/la-fuite-en-avant.png",
//   "assets/medias/pulsar.png",
//   "assets/medias/random-access-memories.png",
// ];

// function CircularScrollWheel() {
//   const repetitionNb = 14;
//   const containerRef = useRef<HTMLDivElement>(null);
  
//   const rotationRef = useRef(0);
//   const [centerIndex, setCenterIndex] = useState<number>(0);

//   useEffect(() => {
//     if (!containerRef.current) return;
//     const container = containerRef.current;
    
//     const medias = Array.from(container.querySelectorAll<HTMLElement>(".inner-media"));
//     const total = medias.length;
//     const anglePerItem = 360 / total;

//     let snapTimeout: ReturnType<typeof setTimeout>;

//     medias.forEach((el, index) => {
//       gsap.set(el, { rotation: anglePerItem * index });
//       const img = el.querySelector(".media");
//       if (img) gsap.set(img, { yPercent: -50, transformOrigin: "50% 50%" });
//     });

//     const rotTo = gsap.quickTo(container, "rotation", {
//       duration: 0.5,
//       ease: "power3.out"
//     });

//     const updateIndex = () => {
//       const currentRot = rotationRef.current;
//       const rawIndex = Math.round(-currentRot / anglePerItem);
//       const normalizedIndex = ((rawIndex % total) + total) % total;
//       setCenterIndex(normalizedIndex);
//     };

//     const snapToClosest = () => {
//       const currentRot = rotationRef.current;
//       const snapRot = Math.round(currentRot / anglePerItem) * anglePerItem;

//       gsap.to(container, {
//         rotation: snapRot,
//         duration: 0.5,
//         ease: "power3.out",
//         onUpdate: () => {
//           rotationRef.current = gsap.getProperty(container, "rotation") as number;
//           updateIndex();
//         },
//         onComplete: () => {
//           rotationRef.current = snapRot;
//           updateIndex();
//         }
//       });
//     };

//     const onWheel = (e: WheelEvent) => {
//       rotationRef.current -= e.deltaY / 20;
//       rotTo(rotationRef.current);
//       updateIndex();

//       if (snapTimeout) clearTimeout(snapTimeout);
//       snapTimeout = setTimeout(snapToClosest, 150);
//     };

//     window.addEventListener("wheel", onWheel, { passive: true });

//     return () => {
//       window.removeEventListener("wheel", onWheel);
//       if (snapTimeout) clearTimeout(snapTimeout);
//       gsap.killTweensOf(container);
//     };

//   }, []);

//   // --- NOUVELLE FONCTION DE CLICK ---
//   const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, index: number) => {
//     console.log("Index de l'image :", index);
//     console.log("Élément DOM :", e.currentTarget);
//     // Vous pouvez récupérer d'autres données ici (src, dataset, etc.)
//   };

//   return (
//     <section className="circular-scroll-wheel">
//       <div className="container" ref={containerRef}>
//         {[...Array(repetitionNb)].map((_, i) => {
//            // Calcul des index réels pour chaque paire
//            const index1 = i * 2;
//            const index2 = i * 2 + 1;

//            return (
//             <div className="group" key={i}>
//               <div className="inner-media">
//                 <img 
//                   className={`media ${centerIndex === index1 ? 'active' : ''}`} 
//                   src="assets/medias/01.png" 
//                   alt={`Media ${index1}`}
//                   // Ajout de l'événement onClick
//                   onClick={(e) => handleImageClick(e, index1)}
//                 />
//               </div>
//               <div className="inner-media">
//                 <img 
//                   className={`media ${centerIndex === index2 ? 'active' : ''}`} 
//                   src="assets/medias/02.png" 
//                   alt={`Media ${index2}`}
//                   // Ajout de l'événement onClick
//                   onClick={(e) => handleImageClick(e, index2)}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// export default CircularScrollWheel;


import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../../style/CircularScrollWheel.scss";

const mediasSrc = [
  "assets/medias/alive.png",
  "assets/medias/beatles.png",
  "assets/medias/civilisation.png",
  "assets/medias/da-funk.png",
  "assets/medias/la-fuite-en-avant.png",
  "assets/medias/pulsar.png",
  "assets/medias/random-access-memories.png",
];

function CircularScrollWheel() {
const repetitionNb = 14; // 14 * 2 = 28 images au total dans la roue
  const containerRef = useRef<HTMLDivElement>(null);
  
  const rotationRef = useRef(0);
  const [centerIndex, setCenterIndex] = useState<number>(0);

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
      const img = el.querySelector(".media");
      if (img) gsap.set(img, { yPercent: -50, transformOrigin: "50% 50%" });
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, globalIndex: number) => {
    // Récupération du nom du fichier pour log
    const sourceIndex = globalIndex % mediasSrc.length;
    console.log(`Click sur l'emplacement : ${globalIndex}`);
    console.log(`Image source : ${mediasSrc[sourceIndex]}`);
  };

  return (
    <section className="circular-scroll-wheel">
      <div className="container" ref={containerRef}>
        {[...Array(repetitionNb)].map((_, i) => {
           const index1 = i * 2;
           const index2 = i * 2 + 1;

           // Utilisation du Modulo (%) pour boucler sur le tableau mediasSrc
           const src1 = mediasSrc[index1 % mediasSrc.length];
           const src2 = mediasSrc[index2 % mediasSrc.length];

           return (
            <div className="group" key={i}>
              <div className="inner-media">
                <img 
                  className={`media ${centerIndex === index1 ? 'active' : ''}`} 
                  src={src1} 
                  alt={`Album ${index1}`}
                  onClick={(e) => handleImageClick(e, index1)}
                />
              </div>
              <div className="inner-media">
                <img 
                  className={`media ${centerIndex === index2 ? 'active' : ''}`} 
                  src={src2} 
                  alt={`Album ${index2}`}
                  onClick={(e) => handleImageClick(e, index2)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CircularScrollWheel;
