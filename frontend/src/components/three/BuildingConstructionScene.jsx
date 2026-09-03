import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/*
 * ============================================================
 * INSULOG - BUILDING CONSTRUCTION SCENE
 * ============================================================
 */

// ------------------------------------------------------------
// COLORES DE MARCA
// ------------------------------------------------------------

const COLORS = {
    bodyMain: '#15609F',
    bodyTop: '#3FA1C8',
    trimDark: '#0A3D73',
    frame: '#071B33',
    glass: '#5DCBE8',
    accent: '#0EA5C4',
    signal: '#E8590C',
    white: '#F5FBFF',
};

// ------------------------------------------------------------
// CONFIGURACION DE ANIMACION
// ------------------------------------------------------------

const CYCLE_SECONDS = 12;
const RISE_START = 0.1;
const RISE_END = 0.7;
const TOP_PAUSE_END = 0.84;

// ------------------------------------------------------------
// FUNCIONES DE ANIMACION
// ------------------------------------------------------------

function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    if (t < 0.5) {
        return 4 * t * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getConstructionProgress(time) {
    const cycle = time % CYCLE_SECONDS;
    const normalized = cycle / CYCLE_SECONDS;

    if (normalized < RISE_START) {
        return 0;
    }

    if (normalized < RISE_END) {
        const progress = (normalized - RISE_START) / (RISE_END - RISE_START);

        return easeInOutCubic(progress);
    }

    if (normalized < TOP_PAUSE_END) {
        return 1;
    }

    const resetProgress = (normalized - TOP_PAUSE_END) / (1 - TOP_PAUSE_END);

    return 1 - easeInOutCubic(resetProgress);
}

// ============================================================
// VIDRIO
// ============================================================

function GlassPanel({ width, height, position = [0, 0, 0], rotation = [0, 0, 0] }) {
    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[width, height]} />

            <meshPhysicalMaterial
                color={COLORS.glass}
                metalness={0.2}
                roughness={0.1}
                transparent
                opacity={0.78}
                clearcoat={0.8}
                clearcoatRoughness={0.08}
                reflectivity={0.8}
                ior={1.45}
            />
        </mesh>
    );
}

// ============================================================
// VENTANA
// ============================================================

function WindowWithFrame({ x, y, z, width, height, rotation = [0, 0, 0] }) {
    const frameThickness = 0.025;

    const glassWidth = Math.max(0.05, width - frameThickness * 2);

    const glassHeight = Math.max(0.05, height - frameThickness * 2);

    return (
        <group position={[x, y, z]} rotation={rotation}>
            {/* Marco */}
            <mesh>
                <planeGeometry args={[width, height]} />

                <meshStandardMaterial color={COLORS.frame} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Vidrio */}
            <GlassPanel width={glassWidth} height={glassHeight} position={[0, 0, 0.008]} />

            {/* Division vertical */}
            <mesh position={[0, 0, 0.014]}>
                <planeGeometry args={[width * 0.045, height * 0.92]} />

                <meshStandardMaterial color={COLORS.frame} metalness={0.8} roughness={0.25} />
            </mesh>

            {/* Division horizontal */}
            <mesh position={[0, 0, 0.014]}>
                <planeGeometry args={[width * 0.94, height * 0.045]} />

                <meshStandardMaterial color={COLORS.frame} metalness={0.8} roughness={0.25} />
            </mesh>
        </group>
    );
}

// ============================================================
// BALCON
// ============================================================

function Balcony({ width, depth, y, side }) {
    return (
        <group position={[side * width * 0.22, y, depth * 0.54]}>
            {/* Plataforma */}
            <mesh castShadow>
                <boxGeometry args={[width * 0.46, 0.045, depth * 0.28]} />

                <meshStandardMaterial color={COLORS.trimDark} metalness={0.35} roughness={0.45} />
            </mesh>

            {/* Baranda */}
            <mesh position={[0, 0.1, depth * 0.11]}>
                <boxGeometry args={[width * 0.42, 0.025, 0.025]} />

                <meshStandardMaterial color={COLORS.accent} metalness={0.7} roughness={0.22} />
            </mesh>

            {/* Soporte izquierdo */}
            <mesh position={[-width * 0.2, 0.05, depth * 0.11]}>
                <boxGeometry args={[0.02, 0.12, 0.02]} />

                <meshStandardMaterial color={COLORS.accent} metalness={0.7} roughness={0.22} />
            </mesh>

            {/* Soporte derecho */}
            <mesh position={[width * 0.2, 0.05, depth * 0.11]}>
                <boxGeometry args={[0.02, 0.12, 0.02]} />

                <meshStandardMaterial color={COLORS.accent} metalness={0.7} roughness={0.22} />
            </mesh>
        </group>
    );
}

// ============================================================
// PISO
// ============================================================

function BuildingFloor({ baseY, height, width, depth, revealStart, revealEnd, floorIndex, totalFloors }) {
    const groupRef = useRef(null);

    const isTopFloor = floorIndex === totalFloors - 1;

    // --------------------------------------------------------
    // ANIMACION DEL PISO
    // --------------------------------------------------------

    useFrame(({ clock }) => {
        if (!groupRef.current) {
            return;
        }

        const time = clock.elapsedTime % CYCLE_SECONDS;

        const constructionProgress = getConstructionProgress(time);

        const floorProgress = clamp01((constructionProgress - revealStart) / (revealEnd - revealStart));

        const eased = easeOutCubic(floorProgress);

        // Entrada desde abajo
        const offsetY = (1 - eased) * 0.2;

        // Pequeño rebote
        const bounce = Math.sin(floorProgress * Math.PI) * 0.025;

        groupRef.current.position.y = baseY - offsetY + bounce;

        // Escala sutil
        const scaleY = 0.95 + eased * 0.05;

        groupRef.current.scale.set(1, scaleY, 1);

        // Pequeña vibracion mientras se construye
        if (floorProgress > 0.05 && floorProgress < 0.95) {
            groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 5 + floorIndex) * 0.001;
        } else {
            groupRef.current.rotation.z = 0;
        }
    });

    // --------------------------------------------------------
    // DISTRIBUCION DE VENTANAS
    // --------------------------------------------------------

    const columns = Math.max(3, Math.round(width * 3));

    const windows = useMemo(() => {
        const result = [];

        const margin = width * 0.08;

        const usableWidth = width - margin * 2;

        const cellWidth = usableWidth / columns;

        for (let i = 0; i < columns; i += 1) {
            const x = -width / 2 + margin + cellWidth * (i + 0.5);

            result.push({
                x,
            });
        }

        return result;
    }, [width, columns]);

    const windowWidth = ((width * 0.84) / columns) * 0.78;

    const windowHeight = height * 0.58;

    return (
        <group ref={groupRef} position={[0, baseY, 0]}>
            {/* =================================================
                CUERPO
            ================================================= */}

            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />

                <meshPhysicalMaterial
                    color={isTopFloor ? COLORS.bodyTop : COLORS.bodyMain}
                    roughness={0.48}
                    metalness={0.14}
                    clearcoat={0.25}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            {/* =================================================
                LOSA INFERIOR
            ================================================= */}

            <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[width * 1.03, 0.045, depth * 1.03]} />

                <meshStandardMaterial color={COLORS.trimDark} metalness={0.4} roughness={0.42} />
            </mesh>

            {/* =================================================
                LOSA SUPERIOR
            ================================================= */}

            <mesh position={[0, height - 0.015, 0]}>
                <boxGeometry args={[width * 1.035, 0.055, depth * 1.035]} />

                <meshStandardMaterial color={COLORS.trimDark} metalness={0.4} roughness={0.4} />
            </mesh>

            {/* =================================================
                VENTANAS FRONTALES
            ================================================= */}

            <group>
                {windows.map((window, index) => (
                    <WindowWithFrame
                        key={`front-${floorIndex}-${index}`}
                        x={window.x}
                        y={height * 0.52}
                        z={depth / 2 + 0.012}
                        width={windowWidth}
                        height={windowHeight}
                        rotation={[0, 0, 0]}
                    />
                ))}
            </group>

            {/* =================================================
                VENTANAS TRASERAS
            ================================================= */}

            <group>
                {windows.map((window, index) => (
                    <WindowWithFrame
                        key={`back-${floorIndex}-${index}`}
                        x={window.x}
                        y={height * 0.52}
                        z={-depth / 2 - 0.012}
                        width={windowWidth}
                        height={windowHeight}
                        rotation={[0, Math.PI, 0]}
                    />
                ))}
            </group>

            {/* =================================================
                VENTANAS LATERALES
            ================================================= */}

            <group>
                <WindowWithFrame
                    x={-width / 2 - 0.012}
                    y={height * 0.52}
                    z={-depth * 0.22}
                    width={depth * 0.3}
                    height={windowHeight}
                    rotation={[0, -Math.PI / 2, 0]}
                />

                <WindowWithFrame
                    x={-width / 2 - 0.012}
                    y={height * 0.52}
                    z={depth * 0.22}
                    width={depth * 0.3}
                    height={windowHeight}
                    rotation={[0, -Math.PI / 2, 0]}
                />
            </group>

            <group>
                <WindowWithFrame
                    x={width / 2 + 0.012}
                    y={height * 0.52}
                    z={-depth * 0.22}
                    width={depth * 0.3}
                    height={windowHeight}
                    rotation={[0, Math.PI / 2, 0]}
                />

                <WindowWithFrame
                    x={width / 2 + 0.012}
                    y={height * 0.52}
                    z={depth * 0.22}
                    width={depth * 0.3}
                    height={windowHeight}
                    rotation={[0, Math.PI / 2, 0]}
                />
            </group>

            {/* =================================================
                COLUMNA VERTICAL FRONTAL
            ================================================= */}

            <mesh position={[width * 0.36, height / 2, depth / 2 + 0.025]}>
                <boxGeometry args={[0.035, height * 0.88, 0.035]} />

                <meshStandardMaterial color={COLORS.accent} metalness={0.65} roughness={0.25} />
            </mesh>

            {/* =================================================
                COLUMNAS ESTRUCTURALES
            ================================================= */}

            {[
                [-width * 0.43, -depth * 0.43],
                [width * 0.43, -depth * 0.43],
                [-width * 0.43, depth * 0.43],
                [width * 0.43, depth * 0.43],
            ].map(([cx, cz], index) => (
                <mesh key={`column-${floorIndex}-${index}`} position={[cx, height / 2, cz]}>
                    <boxGeometry args={[0.05, height, 0.05]} />

                    <meshStandardMaterial color={COLORS.trimDark} metalness={0.55} roughness={0.3} />
                </mesh>
            ))}

            {/* =================================================
                BALCONES
            ================================================= */}

            {floorIndex > 0 && floorIndex % 2 === 1 && (
                <Balcony width={width} depth={depth} y={height * 0.18} side={floorIndex % 4 === 1 ? -1 : 1} />
            )}
        </group>
    );
}

// ============================================================
// TECHO
// ============================================================

function RoofBlock({ y, width, depth }) {
    const roofRef = useRef(null);

    useFrame(({ clock }) => {
        if (!roofRef.current) {
            return;
        }

        const time = clock.elapsedTime % CYCLE_SECONDS;

        const progress = getConstructionProgress(time);

        const roofProgress = clamp01((progress - 0.68) / 0.18);

        const eased = easeOutCubic(roofProgress);

        roofRef.current.scale.set(eased, eased, eased);

        roofRef.current.position.y = y + (1 - eased) * 0.12;
    });

    return (
        <group ref={roofRef} position={[0, y, 0]}>
            {/* Base del techo */}
            <mesh position={[0, 0.06, 0]} castShadow>
                <boxGeometry args={[width * 1.06, 0.12, depth * 1.06]} />

                <meshPhysicalMaterial color={COLORS.trimDark} roughness={0.4} metalness={0.3} />
            </mesh>

            {/* Acento naranja */}
            <mesh position={[0, 0.13, 0]}>
                <boxGeometry args={[width * 0.96, 0.025, depth * 0.96]} />

                <meshStandardMaterial color={COLORS.signal} metalness={0.5} roughness={0.28} />
            </mesh>

            {/* Volumen tecnico */}
            <mesh position={[width * 0.24, 0.31, -depth * 0.1]}>
                <boxGeometry args={[width * 0.24, 0.32, depth * 0.28]} />

                <meshPhysicalMaterial color={COLORS.bodyTop} roughness={0.42} metalness={0.18} clearcoat={0.3} />
            </mesh>

            {/* Antena */}
            <mesh position={[0, 0.48, 0]}>
                <cylinderGeometry args={[0.009, 0.014, 0.4, 8]} />

                <meshStandardMaterial color={COLORS.accent} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Punto naranja */}
            <mesh position={[0, 0.69, 0]}>
                <sphereGeometry args={[0.025, 12, 12]} />

                <meshStandardMaterial color={COLORS.signal} emissive={COLORS.signal} emissiveIntensity={0.7} />
            </mesh>
        </group>
    );
}

// ============================================================
// BASE
// ============================================================

function BuildingBase({ width, depth }) {
    return (
        <group position={[0, -0.04, 0]}>
            <mesh receiveShadow position={[0, -0.04, 0]}>
                <boxGeometry args={[width * 1.45, 0.08, depth * 1.45]} />

                <meshStandardMaterial color={COLORS.frame} metalness={0.4} roughness={0.45} />
            </mesh>

            {/* Linea de luz */}
            <mesh position={[0, 0.008, depth * 0.66]}>
                <boxGeometry args={[width * 1.12, 0.012, 0.025]} />

                <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.25} />
            </mesh>
        </group>
    );
}

// ============================================================
// ESCENA
// ============================================================

function Scene() {
    const buildingRef = useRef(null);

    const floorCount = 9;
    const floorHeight = 0.42;
    const width = 1.5;
    const depth = 1.15;

    const totalHeight = floorCount * floorHeight;

    // The roof (antenna + accent sphere) sticks up well above the last
    // floor, and the base slab sticks down below the first floor. To frame
    // the WHOLE piece (not just the floor stack) we center on the true top
    // and bottom, including those extras.
    const roofTopExtra = 0.715; // top of the roof's orange sphere accent
    const baseBottomExtra = 0.08; // bottom of the base slab
    const trueTop = totalHeight + roofTopExtra;
    const trueBottom = -baseBottomExtra;
    const centerOffset = -(trueTop + trueBottom) / 2;

    const floors = useMemo(() => {
        const revealRange = RISE_END - RISE_START;

        const perFloor = revealRange / floorCount;

        return Array.from({ length: floorCount }, (_, index) => ({
            baseY: index * floorHeight,

            height: floorHeight,

            width,

            depth,

            revealStart: RISE_START + index * perFloor,

            revealEnd: RISE_START + (index + 1) * perFloor,

            floorIndex: index,

            totalFloors: floorCount,
        }));
    }, []);

    // Rotacion del edificio
    useFrame(({ clock }) => {
        if (!buildingRef.current) {
            return;
        }

        buildingRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.18;

        // IMPORTANT: add the small bob to the centering offset, don't replace
        // it - otherwise this runs every frame and undoes the centering below.
        buildingRef.current.position.y = centerOffset + Math.sin(clock.elapsedTime * 0.35) * 0.012;
    });

    return (
        <group ref={buildingRef} position={[0, centerOffset, 0]}>
            <BuildingBase width={width} depth={depth} />

            {floors.map((floor) => (
                <BuildingFloor key={floor.floorIndex} {...floor} />
            ))}

            <RoofBlock y={totalHeight} width={width} depth={depth} />
        </group>
    );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function BuildingConstructionScene() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{
                    // This exact framing was confirmed to show the whole tower
                    // (roof + antenna to base) with no clipping. Do not zoom this
                    // in again without also growing the container - see PublicLanding.jsx.
                    position: [6.1, 4.2, 7.3],
                    fov: 32,
                    near: 0.1,
                    far: 40,
                }}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: 'high-performance',
                }}
                style={{
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                }}
            >
                {/* Luz ambiental */}
                <ambientLight intensity={0.7} color="#DCEBF5" />

                {/* Luz hemisferica */}
                <hemisphereLight args={['#7ADCF2', '#071B33', 0.55]} position={[0, 6, 0]} />

                {/* Luz principal */}
                <directionalLight position={[4, 8, 5]} intensity={2.0} color="#F7FCFF" castShadow />

                {/* Luz cian */}
                <directionalLight position={[-4, 4, -3]} intensity={0.6} color="#5DCBE8" />

                {/* Luz naranja */}
                <pointLight position={[2, 2, 4]} intensity={0.3} distance={7} color="#E8590C" />

                <Scene />
            </Canvas>
        </div>
    );
}