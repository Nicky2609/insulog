import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/*
 * ============================================================
 * INSULOG - BUILDING CONSTRUCTION & INFRASTRUCTURE 3D SCENE
 * ============================================================
 * Versión mejorada con maquinaria pesada y logística de obra:
 * - Volqueta dobletroque con volcó basculante y acopio de material
 * - Excavadora hidráulica con brazo articulado en posición de cargue
 * - Balizas estroboscópicas viales, conos y señalización reflectiva
 * - Edificio corporativo con curtain-wall, losas vistas y grúa torre
 */

// ------------------------------------------------------------
// PALETA DE MATERIALES Y MARCA (Ingeniería & Maquinaria)
// ------------------------------------------------------------
const COLORS = {
    slabConcrete: '#1E293B',     // Concreto estructural oscuro refinado
    steelFrame: '#0F172A',       // Acero naval base
    beamAccent: '#334155',       // Perfiles metálicos IPE/HEA
    pillarMetallic: '#475569',   // Columnas tubulares de soporte
    glassReflect: '#38BDF8',     // Vidrio templado cielo / cian
    signalOrange: '#EA580C',     // Naranja institucional de seguridad / Insulog
    craneYellow: '#F59E0B',      // Amarillo CAT / maquinaria pesada
    heavyTire: '#090D16',        // Caucho de llanta todoterreno
    metalChassis: '#111827',     // Chasis de acero
    aggregateSand: '#D97706',    // Material pétreo / agregado en volco
    lightWarm: '#FFFBEB',        // Luz cenital solar
    lightSky: '#E0F2FE',         // Luz ambiental de cielo
};

const CYCLE_SECONDS = 14;
const RISE_START = 0.08;
const RISE_END = 0.72;
const TOP_PAUSE_END = 0.88;

function clamp01(v) {
    return Math.min(1, Math.max(0, v));
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getConstructionProgress(time) {
    const cycle = time % CYCLE_SECONDS;
    const normalized = cycle / CYCLE_SECONDS;

    if (normalized < RISE_START) return 0;
    if (normalized < RISE_END) {
        return easeInOutCubic((normalized - RISE_START) / (RISE_END - RISE_START));
    }
    if (normalized < TOP_PAUSE_END) return 1;
    return 1 - easeInOutCubic((normalized - TOP_PAUSE_END) / (1 - TOP_PAUSE_END));
}

// ============================================================
// MODELO 3D: VOLQUETA DOBLETROQUE DE OBRA (DUMP TRUCK)
// ============================================================
function DumpTruck({ position, rotation }) {
    const truckRef = useRef(null);
    const bedRef = useRef(null);

    // Micro-animación: inclinación sutil del volco al descargar periódicamente
    useFrame(({ clock }) => {
        if (!bedRef.current) return;
        const t = clock.elapsedTime;
        const dumpPhase = Math.sin(t * 0.5);
        const tilt = dumpPhase > 0.6 ? (dumpPhase - 0.6) * 0.4 : 0;
        bedRef.current.rotation.x = -tilt;
    });

    return (
        <group ref={truckRef} position={position} rotation={rotation} scale={[0.85, 0.85, 0.85]}>
            {/* Chasis principal inferior */}
            <mesh position={[0, 0.08, 0]} castShadow>
                <boxGeometry args={[0.3, 0.06, 0.75]} />
                <meshStandardMaterial color={COLORS.metalChassis} roughness={0.6} metalness={0.8} />
            </mesh>

            {/* Cabina del conductor */}
            <group position={[0, 0.22, 0.22]}>
                <mesh castShadow>
                    <boxGeometry args={[0.28, 0.22, 0.24]} />
                    <meshStandardMaterial color={COLORS.craneYellow} metalness={0.4} roughness={0.3} />
                </mesh>
                {/* Parabrisas frontal */}
                <mesh position={[0, 0.03, 0.122]}>
                    <planeGeometry args={[0.24, 0.12]} />
                    <meshPhysicalMaterial color={COLORS.glassReflect} transparent opacity={0.85} roughness={0.1} />
                </mesh>
                {/* Ventanas laterales */}
                <mesh position={[0.141, 0.03, 0]}>
                    <planeGeometry args={[0.15, 0.1]} />
                    <meshPhysicalMaterial color={COLORS.glassReflect} transparent opacity={0.85} roughness={0.1} />
                </mesh>
                <mesh position={[-0.141, 0.03, 0]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.15, 0.1]} />
                    <meshPhysicalMaterial color={COLORS.glassReflect} transparent opacity={0.85} roughness={0.1} />
                </mesh>
                {/* Deflector de techo en naranja Insulog */}
                <mesh position={[0, 0.12, 0.02]}>
                    <boxGeometry args={[0.26, 0.025, 0.2]} />
                    <meshStandardMaterial color={COLORS.signalOrange} emissive={COLORS.signalOrange} emissiveIntensity={0.4} />
                </mesh>
                {/* Faros delanteros LED */}
                <mesh position={[0.09, -0.06, 0.125]}>
                    <boxGeometry args={[0.05, 0.03, 0.01]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[-0.09, -0.06, 0.125]}>
                    <boxGeometry args={[0.05, 0.03, 0.01]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
                </mesh>
            </group>

            {/* Volco basculante con carga de material pétreo */}
            <group ref={bedRef} position={[0, 0.16, -0.14]}>
                {/* Caja de tolva metálica reforzada */}
                <mesh castShadow position={[0, 0.08, 0]}>
                    <boxGeometry args={[0.29, 0.15, 0.44]} />
                    <meshStandardMaterial color={COLORS.signalOrange} roughness={0.4} metalness={0.5} />
                </mesh>
                {/* Carga de agregados pétreos triturados / arena */}
                <mesh position={[0, 0.15, 0]}>
                    <coneGeometry args={[0.13, 0.09, 6]} />
                    <meshStandardMaterial color={COLORS.aggregateSand} roughness={0.9} metalness={0.1} />
                </mesh>
            </group>

            {/* Conjunto de 6 Ruedas de Tracción 6x4 */}
            {[
                [-0.16, 0.07, 0.23],  // Delantera Izq
                [0.16, 0.07, 0.23],   // Delantera Der
                [-0.16, 0.07, -0.1],  // Eje Medio Izq
                [0.16, 0.07, -0.1],   // Eje Medio Der
                [-0.16, 0.07, -0.26], // Eje Trasero Izq
                [0.16, 0.07, -0.26],  // Eje Trasero Der
            ].map(([wx, wy, wz], i) => (
                <group key={`wheel-${i}`} position={[wx, wy, wz]}>
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.065, 0.065, 0.045, 12]} />
                        <meshStandardMaterial color={COLORS.heavyTire} roughness={0.8} />
                    </mesh>
                    {/* Rin de acero */}
                    <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.005 : -0.005, 0, 0]}>
                        <cylinderGeometry args={[0.035, 0.035, 0.046, 8]} />
                        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// ============================================================
// MODELO 3D: EXCAVADORA DE ORUGAS (HEAVY EXCAVATOR)
// ============================================================
function HeavyExcavator({ position, rotation }) {
    const armRef = useRef(null);

    // Micro-animación de excavación y cargue
    useFrame(({ clock }) => {
        if (!armRef.current) return;
        const t = clock.elapsedTime;
        armRef.current.rotation.z = Math.sin(t * 0.7) * 0.15 - 0.2;
    });

    return (
        <group position={position} rotation={rotation} scale={[0.8, 0.8, 0.8]}>
            {/* Tren de rodaje / Orugas metálicas */}
            {[-0.14, 0.14].map((tx, idx) => (
                <group key={`track-${idx}`} position={[tx, 0.05, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.07, 0.07, 0.52]} />
                        <meshStandardMaterial color="#0A0F1D" roughness={0.7} metalness={0.7} />
                    </mesh>
                    {/* Ruedas dentadas de la oruga */}
                    {[-0.18, 0, 0.18].map((rz, ri) => (
                        <mesh key={`sprocket-${ri}`} position={[0, 0, rz]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.072, 8]} />
                            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Cabina superior giratoria */}
            <group position={[0, 0.15, -0.02]}>
                {/* Cuerpo principal de maquinaria */}
                <mesh castShadow position={[0, 0.08, -0.04]}>
                    <boxGeometry args={[0.26, 0.16, 0.36]} />
                    <meshStandardMaterial color={COLORS.craneYellow} metalness={0.4} roughness={0.35} />
                </mesh>

                {/* Contrapeso trasero en acero naval oscuro */}
                <mesh position={[0, 0.08, -0.22]}>
                    <boxGeometry args={[0.26, 0.14, 0.08]} />
                    <meshStandardMaterial color={COLORS.slabConcrete} roughness={0.6} metalness={0.5} />
                </mesh>

                {/* Cabina de vidrio del operador */}
                <mesh position={[-0.07, 0.1, 0.08]} castShadow>
                    <boxGeometry args={[0.1, 0.15, 0.14]} />
                    <meshPhysicalMaterial color={COLORS.glassReflect} transparent opacity={0.85} roughness={0.1} />
                </mesh>

                {/* Brazo articulado hidráulico (Boom + Arm + Bucket) */}
                <group ref={armRef} position={[0.06, 0.12, 0.14]}>
                    {/* Brazo principal (Boom) */}
                    <mesh position={[0, 0.18, 0.15]} rotation={[-0.6, 0, 0]} castShadow>
                        <boxGeometry args={[0.04, 0.38, 0.05]} />
                        <meshStandardMaterial color={COLORS.craneYellow} metalness={0.5} roughness={0.3} />
                    </mesh>
                    {/* Cilindro hidráulico de elevación */}
                    <mesh position={[0, 0.11, 0.08]} rotation={[-0.5, 0, 0]}>
                        <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
                        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Balde / Cuchara de excavación */}
                    <mesh position={[0, 0.3, 0.32]} rotation={[0.4, 0, 0]} castShadow>
                        <boxGeometry args={[0.12, 0.09, 0.1]} />
                        <meshStandardMaterial color={COLORS.steelFrame} metalness={0.8} roughness={0.3} />
                    </mesh>
                </group>
            </group>
        </group>
    );
}

// ============================================================
// ELEMENTOS DE SEGURIDAD VIAL: CONOS Y BARRERAS DE OBRA
// ============================================================
function SafetyZone({ position }) {
    return (
        <group position={position}>
            {/* Conos de tránsito reflectivos con bandas blancas */}
            {[
                [-0.4, 0.05, 0],
                [-0.15, 0.05, 0],
                [0.1, 0.05, 0],
            ].map(([cx, cy, cz], idx) => (
                <group key={`cone-${idx}`} position={[cx, cy, cz]}>
                    <mesh>
                        <coneGeometry args={[0.04, 0.1, 10]} />
                        <meshStandardMaterial color={COLORS.signalOrange} emissive={COLORS.signalOrange} emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[0, 0.01, 0]}>
                        <cylinderGeometry args={[0.026, 0.03, 0.02, 10]} />
                        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
                    </mesh>
                </group>
            ))}

            {/* Montículo de grava / acopio en zona de descarga */}
            <mesh position={[0.42, 0.04, 0.05]} castShadow>
                <coneGeometry args={[0.22, 0.09, 8]} />
                <meshStandardMaterial color="#94A3B8" roughness={0.95} />
            </mesh>
        </group>
    );
}

// ============================================================
// PANEL DE VIDRIO ARQUITECTÓNICO CON CORTINA FLOTANTE
// ============================================================
function CurtainWallPanel({ width, height, position, rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial color={COLORS.steelFrame} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
                <planeGeometry args={[width * 0.94, height * 0.92]} />
                <meshPhysicalMaterial
                    color={COLORS.glassReflect}
                    roughness={0.08}
                    metalness={0.3}
                    transparent
                    opacity={0.82}
                    reflectivity={0.9}
                    clearcoat={1.0}
                    clearcoatRoughness={0.05}
                    ior={1.52}
                />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[width * 0.04, height * 0.92]} />
                <meshStandardMaterial color={COLORS.pillarMetallic} metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}

// ============================================================
// PISO CON ESTRUCTURA VIAL / EDIFICIO CORPORATIVO
// ============================================================
function BuildingFloor({ baseY, height, width, depth, revealStart, revealEnd, floorIndex, totalFloors }) {
    const groupRef = useRef(null);
    const isTopFloor = floorIndex === totalFloors - 1;

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.elapsedTime % CYCLE_SECONDS;
        const globalProgress = getConstructionProgress(time);
        const floorProgress = clamp01((globalProgress - revealStart) / (revealEnd - revealStart));
        const eased = easeOutCubic(floorProgress);

        const offsetY = (1 - eased) * 0.35;
        const scale = 0.92 + eased * 0.08;
        groupRef.current.position.y = baseY - offsetY;
        groupRef.current.scale.set(scale, scale, scale);

        if (floorProgress > 0.1 && floorProgress < 0.9) {
            groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 6 + floorIndex) * 0.003;
        } else {
            groupRef.current.rotation.y = 0;
        }
    });

    const cols = 4;
    const colWidth = (width * 0.88) / cols;
    const winHeight = height * 0.65;

    return (
        <group ref={groupRef} position={[0, baseY, 0]}>
            {/* Núcleo estructural de concreto */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width * 0.98, height * 0.96, depth * 0.98]} />
                <meshPhysicalMaterial
                    color={isTopFloor ? '#1E3A8A' : COLORS.slabConcrete}
                    roughness={0.4}
                    metalness={0.25}
                    clearcoat={0.3}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            {/* Losa inferior en voladizo */}
            <mesh position={[0, 0.02, 0]} castShadow>
                <boxGeometry args={[width * 1.08, 0.055, depth * 1.08]} />
                <meshStandardMaterial color={COLORS.steelFrame} metalness={0.65} roughness={0.35} />
            </mesh>

            {/* Losa superior divisoria */}
            <mesh position={[0, height - 0.025, 0]}>
                <boxGeometry args={[width * 1.06, 0.05, depth * 1.06]} />
                <meshStandardMaterial color={COLORS.beamAccent} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Columnas perimetrales de acero */}
            {[
                [-width * 0.49, -depth * 0.49],
                [width * 0.49, -depth * 0.49],
                [-width * 0.49, depth * 0.49],
                [width * 0.49, depth * 0.49],
            ].map(([cx, cz], i) => (
                <mesh key={`col-${floorIndex}-${i}`} position={[cx, height / 2, cz]} castShadow>
                    <cylinderGeometry args={[0.032, 0.032, height, 8]} />
                    <meshStandardMaterial color={COLORS.pillarMetallic} metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* Fachadas cortina frontales */}
            {Array.from({ length: cols }).map((_, i) => {
                const xPos = -width * 0.44 + (i + 0.5) * colWidth;
                return (
                    <CurtainWallPanel
                        key={`cw-f-${floorIndex}-${i}`}
                        width={colWidth * 0.88}
                        height={winHeight}
                        position={[xPos, height * 0.5, depth / 2 + 0.015]}
                    />
                );
            })}

            {/* Fachadas cortina traseras */}
            {Array.from({ length: cols }).map((_, i) => {
                const xPos = -width * 0.44 + (i + 0.5) * colWidth;
                return (
                    <CurtainWallPanel
                        key={`cw-b-${floorIndex}-${i}`}
                        width={colWidth * 0.88}
                        height={winHeight}
                        position={[xPos, height * 0.5, -depth / 2 - 0.015]}
                        rotation={[0, Math.PI, 0]}
                    />
                );
            })}

            {/* Laterales */}
            <CurtainWallPanel
                width={depth * 0.65}
                height={winHeight}
                position={[-width / 2 - 0.015, height * 0.5, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />
            <CurtainWallPanel
                width={depth * 0.65}
                height={winHeight}
                position={[width / 2 + 0.015, height * 0.5, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />

            {/* Balcones técnicos alternos con antepecho de seguridad naranja */}
            {floorIndex % 2 === 1 && (
                <group position={[0, height * 0.18, depth * 0.57]}>
                    <mesh castShadow>
                        <boxGeometry args={[width * 0.45, 0.04, depth * 0.22]} />
                        <meshStandardMaterial color={COLORS.steelFrame} metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 0.1, depth * 0.09]}>
                        <boxGeometry args={[width * 0.43, 0.02, 0.02]} />
                        <meshStandardMaterial color={COLORS.signalOrange} emissive={COLORS.signalOrange} emissiveIntensity={0.35} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

// ============================================================
// REMATE CON MINI GRÚA TORRE
// ============================================================
function RoofWithCrane({ y, width, depth }) {
    const roofRef = useRef(null);
    const craneRef = useRef(null);

    useFrame(({ clock }) => {
        if (!roofRef.current) return;
        const time = clock.elapsedTime % CYCLE_SECONDS;
        const progress = getConstructionProgress(time);
        const roofProgress = clamp01((progress - 0.68) / 0.2);
        const eased = easeOutCubic(roofProgress);

        roofRef.current.scale.set(eased, eased, eased);
        roofRef.current.position.y = y + (1 - eased) * 0.25;

        if (craneRef.current) {
            craneRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.65;
        }
    });

    return (
        <group ref={roofRef} position={[0, y, 0]}>
            {/* Cubierta */}
            <mesh position={[0, 0.06, 0]} castShadow>
                <boxGeometry args={[width * 1.1, 0.14, depth * 1.1]} />
                <meshStandardMaterial color={COLORS.steelFrame} metalness={0.6} roughness={0.35} />
            </mesh>

            {/* Borde perimetral naranja */}
            <mesh position={[0, 0.14, 0]}>
                <boxGeometry args={[width * 1.02, 0.03, depth * 1.02]} />
                <meshStandardMaterial color={COLORS.signalOrange} emissive={COLORS.signalOrange} emissiveIntensity={0.6} />
            </mesh>

            {/* Grúa Torre */}
            <group ref={craneRef} position={[width * 0.22, 0.14, depth * 0.12]}>
                <mesh position={[0, 0.45, 0]}>
                    <cylinderGeometry args={[0.025, 0.03, 0.9, 6]} />
                    <meshStandardMaterial color={COLORS.craneYellow} metalness={0.5} roughness={0.3} />
                </mesh>
                <mesh position={[0.32, 0.85, 0]}>
                    <boxGeometry args={[0.85, 0.03, 0.03]} />
                    <meshStandardMaterial color={COLORS.craneYellow} metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[-0.18, 0.85, 0]}>
                    <boxGeometry args={[0.36, 0.03, 0.03]} />
                    <meshStandardMaterial color={COLORS.craneYellow} metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Gancho y baliza roja */}
                <mesh position={[0.55, 0.55, 0]}>
                    <cylinderGeometry args={[0.003, 0.003, 0.58, 4]} />
                    <meshStandardMaterial color="#94A3B8" metalness={0.9} />
                </mesh>
                <mesh position={[0.55, 0.25, 0]}>
                    <sphereGeometry args={[0.025, 8, 8]} />
                    <meshStandardMaterial color={COLORS.signalOrange} emissive={COLORS.signalOrange} emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0, 0.94, 0]}>
                    <sphereGeometry args={[0.02, 10, 10]} />
                    <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
                </mesh>
            </group>
        </group>
    );
}

// ============================================================
// BASE AMPLIADA DE OBRA CON CALZADA, MAQUINARIA Y BALIZAS
// ============================================================
function FoundationBase({ width, depth }) {
    return (
        <group position={[0, -0.06, 0]}>
            {/* Plinto de cimentación estructural */}
            <mesh receiveShadow position={[0, -0.05, 0]}>
                <boxGeometry args={[width * 1.9, 0.1, depth * 2.2]} />
                <meshStandardMaterial color="#0B1329" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Vía / Calzada de acceso de camiones con asfalto técnico */}
            <mesh position={[0, 0.004, depth * 0.75]}>
                <planeGeometry args={[width * 1.85, depth * 0.65]} />
                <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>

            {/* Líneas de demarcación vial reflectivas */}
            <mesh position={[0, 0.006, depth * 0.75]}>
                <planeGeometry args={[width * 1.7, 0.025]} />
                <meshStandardMaterial color="#FCD34D" emissive="#FCD34D" emissiveIntensity={0.6} />
            </mesh>

            {/* Maquinaria 1: Volqueta Dobletroque de despacho en ruta */}
            <DumpTruck position={[-width * 0.45, 0.01, depth * 0.78]} rotation={[0, 0.25, 0]} />

            {/* Maquinaria 2: Excavadora hidráulica cargando material */}
            <HeavyExcavator position={[width * 0.52, 0.01, depth * 0.75]} rotation={[0, -0.4, 0]} />

            {/* Zona de conos y acopio de seguridad */}
            <SafetyZone position={[0, 0.01, depth * 0.95]} />
        </group>
    );
}

// ============================================================
// ESCENA COMPLETA
// ============================================================
function Scene() {
    const buildingRef = useRef(null);
    const floorCount = 8;
    const floorHeight = 0.44;
    const width = 1.6;
    const depth = 1.25;

    const totalHeight = floorCount * floorHeight;
    const roofTopExtra = 1.05;
    const baseBottomExtra = 0.14;
    const centerOffset = -(totalHeight + roofTopExtra - baseBottomExtra) / 2;

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
    }, [floorCount, floorHeight, width, depth]);

    useFrame(({ clock }) => {
        if (!buildingRef.current) return;
        const t = clock.elapsedTime;
        buildingRef.current.rotation.y = Math.sin(t * 0.12) * 0.2 + t * 0.02;
        buildingRef.current.position.y = centerOffset + Math.sin(t * 0.35) * 0.015;
    });

    return (
        <group ref={buildingRef} position={[0, centerOffset, 0]}>
            <FoundationBase width={width} depth={depth} />
            {floors.map((floor) => (
                <BuildingFloor key={floor.floorIndex} {...floor} />
            ))}
            <RoofWithCrane y={totalHeight} width={width} depth={depth} />
        </group>
    );
}

// ============================================================
// COMPONENTE PRINCIPAL EXPORTABLE
// ============================================================
export default function BuildingConstructionScene() {
    return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-auto">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{
                    position: [7.2, 5.2, 8.4],
                    fov: 32,
                    near: 0.1,
                    far: 50,
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
                <ambientLight intensity={0.9} color={COLORS.lightSky} />
                <hemisphereLight args={['#67E8F9', '#0F172A', 0.65]} position={[0, 8, 0]} />
                <directionalLight
                    position={[5.5, 9.5, 6.0]}
                    intensity={2.3}
                    color={COLORS.lightWarm}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <directionalLight position={[-6, 4.5, -4]} intensity={0.8} color="#38BDF8" />
                <pointLight position={[2.5, 3.0, 4.5]} intensity={0.5} distance={8} color={COLORS.signalOrange} />
                <Scene />
            </Canvas>
        </div>
    );
}