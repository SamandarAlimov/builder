import { useRef, Suspense, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Box, Cylinder, Html, Sphere, Cone } from "@react-three/drei";
import * as THREE from "three";

interface DesignParams {
  buildingType: string;
  style: string;
  roomsCount: number;
  floorsCount: number;
  colorScheme: string;
}

interface House3DModelProps {
  designParams: DesignParams;
}

// Color schemes mapping
const colorSchemeMap: Record<string, { walls: string; roof: string; windows: string; door: string; trim: string }> = {
  warm_neutral: { walls: "#E8DFD0", roof: "#8B4513", windows: "#87CEEB", door: "#5C4033", trim: "#D4C4B0" },
  white_modern: { walls: "#F5F5F5", roof: "#333333", windows: "#B8D4E8", door: "#2C2C2C", trim: "#FFFFFF" },
  earth_tones: { walls: "#C4A77D", roof: "#654321", windows: "#A7C7E7", door: "#3E2723", trim: "#9C7A4D" },
  bold_contrast: { walls: "#FFFFFF", roof: "#1A1A1A", windows: "#4FC3F7", door: "#E53935", trim: "#424242" },
  blue_grey: { walls: "#B0BEC5", roof: "#455A64", windows: "#81D4FA", door: "#263238", trim: "#78909C" },
};

// Floor component with grass texture
function Floor() {
  return (
    <group>
      {/* Main grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4A7C59" />
      </mesh>
      {/* Driveway/path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 12]} receiveShadow>
        <planeGeometry args={[4, 15]} />
        <meshStandardMaterial color="#8B8B8B" />
      </mesh>
      {/* Patio area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 8]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#A0826D" />
      </mesh>
    </group>
  );
}

// Tree component
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const treeRef = useRef<THREE.Group>(null);
  
  // Subtle wind sway animation
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <Cylinder args={[0.2, 0.35, 2, 8]} position={[0, 1, 0]} castShadow>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
      {/* Foliage layers */}
      <Cone args={[1.5, 2.5, 8]} position={[0, 3, 0]} castShadow>
        <meshStandardMaterial color="#2E7D32" />
      </Cone>
      <Cone args={[1.2, 2, 8]} position={[0, 4.2, 0]} castShadow>
        <meshStandardMaterial color="#388E3C" />
      </Cone>
      <Cone args={[0.8, 1.5, 8]} position={[0, 5.2, 0]} castShadow>
        <meshStandardMaterial color="#43A047" />
      </Cone>
    </group>
  );
}

// Round tree (deciduous)
function RoundTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const treeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.015;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <Cylinder args={[0.15, 0.25, 1.5, 8]} position={[0, 0.75, 0]} castShadow>
        <meshStandardMaterial color="#6D4C41" />
      </Cylinder>
      {/* Foliage */}
      <Sphere args={[1.2, 16, 16]} position={[0, 2.5, 0]} castShadow>
        <meshStandardMaterial color="#66BB6A" />
      </Sphere>
      <Sphere args={[0.9, 16, 16]} position={[0.5, 3, 0.3]} castShadow>
        <meshStandardMaterial color="#81C784" />
      </Sphere>
      <Sphere args={[0.7, 16, 16]} position={[-0.4, 3.2, -0.2]} castShadow>
        <meshStandardMaterial color="#4CAF50" />
      </Sphere>
    </group>
  );
}

// Bush component
function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Sphere args={[0.5, 12, 12]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#558B2F" />
      </Sphere>
      <Sphere args={[0.35, 12, 12]} position={[0.3, 0.4, 0.2]} castShadow>
        <meshStandardMaterial color="#689F38" />
      </Sphere>
      <Sphere args={[0.3, 12, 12]} position={[-0.25, 0.35, 0.15]} castShadow>
        <meshStandardMaterial color="#7CB342" />
      </Sphere>
    </group>
  );
}

// Flower bed component
function FlowerBed({ position }: { position: [number, number, number] }) {
  const flowerColors = ["#E91E63", "#FF5722", "#FFEB3B", "#9C27B0", "#F44336"];
  
  return (
    <group position={position}>
      {/* Soil bed */}
      <Box args={[3, 0.15, 1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#5D4037" />
      </Box>
      {/* Flowers */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} position={[(i - 3.5) * 0.4, 0.2, Math.sin(i) * 0.2]}>
          <Cylinder args={[0.02, 0.02, 0.3, 6]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#2E7D32" />
          </Cylinder>
          <Sphere args={[0.08, 8, 8]} position={[0, 0.35, 0]}>
            <meshStandardMaterial color={flowerColors[i % flowerColors.length]} />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

// Pool component
function SwimmingPool({ position, size = [6, 4] }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <group position={position}>
      {/* Pool deck */}
      <Box args={[size[0] + 2, 0.2, size[1] + 2]} position={[0, 0.1, 0]} receiveShadow>
        <meshStandardMaterial color="#E0E0E0" />
      </Box>
      {/* Pool walls */}
      <Box args={[size[0], 1, size[1]]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#0288D1" />
      </Box>
      {/* Water surface */}
      <Box args={[size[0] - 0.2, 0.1, size[1] - 0.2]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
      </Box>
      {/* Pool ladder */}
      <group position={[size[0] / 2 - 0.3, 0.4, 0]}>
        <Cylinder args={[0.03, 0.03, 0.8, 8]} position={[-0.15, 0, 0]}>
          <meshStandardMaterial color="#BDBDBD" metalness={0.8} />
        </Cylinder>
        <Cylinder args={[0.03, 0.03, 0.8, 8]} position={[0.15, 0, 0]}>
          <meshStandardMaterial color="#BDBDBD" metalness={0.8} />
        </Cylinder>
        {[0.1, 0.3, 0.5].map((y, i) => (
          <Cylinder key={i} args={[0.02, 0.02, 0.3, 8]} position={[0, y - 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#BDBDBD" metalness={0.8} />
          </Cylinder>
        ))}
      </group>
    </group>
  );
}

// Car component
function Car({ position, color = "#E53935", rotation = 0 }: { position: [number, number, number]; color?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Car body */}
      <Box args={[2, 0.6, 1]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </Box>
      {/* Car top */}
      <Box args={[1.2, 0.5, 0.9]} position={[0.1, 1, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </Box>
      {/* Windows */}
      <Box args={[0.5, 0.35, 0.85]} position={[0.5, 1, 0]}>
        <meshStandardMaterial color="#1A237E" transparent opacity={0.7} />
      </Box>
      <Box args={[0.5, 0.35, 0.85]} position={[-0.3, 1, 0]}>
        <meshStandardMaterial color="#1A237E" transparent opacity={0.7} />
      </Box>
      {/* Wheels */}
      {[
        [-0.6, 0.2, 0.5],
        [0.6, 0.2, 0.5],
        [-0.6, 0.2, -0.5],
        [0.6, 0.2, -0.5],
      ].map((pos, i) => (
        <Cylinder key={i} args={[0.2, 0.2, 0.15, 16]} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#212121" />
        </Cylinder>
      ))}
      {/* Headlights */}
      <Box args={[0.02, 0.15, 0.2]} position={[1, 0.5, 0.3]}>
        <meshStandardMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={0.3} />
      </Box>
      <Box args={[0.02, 0.15, 0.2]} position={[1, 0.5, -0.3]}>
        <meshStandardMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={0.3} />
      </Box>
    </group>
  );
}

// Garden furniture
function GardenFurniture({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table */}
      <Cylinder args={[0.8, 0.8, 0.05, 16]} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color="#8D6E63" />
      </Cylinder>
      <Cylinder args={[0.1, 0.15, 0.7, 8]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#6D4C41" />
      </Cylinder>
      {/* Chairs */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
        <group key={i} position={[Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3]} rotation={[0, -angle, 0]}>
          <Box args={[0.4, 0.05, 0.4]} position={[0, 0.4, 0]} castShadow>
            <meshStandardMaterial color="#A1887F" />
          </Box>
          <Box args={[0.4, 0.4, 0.05]} position={[0, 0.6, -0.17]} castShadow>
            <meshStandardMaterial color="#A1887F" />
          </Box>
          {[[-0.15, 0.2, -0.15], [0.15, 0.2, -0.15], [-0.15, 0.2, 0.15], [0.15, 0.2, 0.15]].map((legPos, j) => (
            <Cylinder key={j} args={[0.02, 0.02, 0.4, 6]} position={legPos as [number, number, number]}>
              <meshStandardMaterial color="#5D4037" />
            </Cylinder>
          ))}
        </group>
      ))}
      {/* Umbrella */}
      <Cylinder args={[0.03, 0.03, 2, 8]} position={[0, 1.7, 0]}>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
      <Cone args={[1.2, 0.4, 8]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#E64A19" side={THREE.DoubleSide} />
      </Cone>
    </group>
  );
}

// Fence component
function Fence({ startPos, length, rotation = 0 }: { startPos: [number, number, number]; length: number; rotation?: number }) {
  const posts = Math.floor(length / 1.5);
  
  return (
    <group position={startPos} rotation={[0, rotation, 0]}>
      {Array.from({ length: posts }).map((_, i) => (
        <group key={i} position={[i * 1.5, 0, 0]}>
          {/* Post */}
          <Box args={[0.1, 1, 0.1]} position={[0, 0.5, 0]} castShadow>
            <meshStandardMaterial color="#8D6E63" />
          </Box>
          {/* Top decoration */}
          <Sphere args={[0.08, 8, 8]} position={[0, 1.05, 0]}>
            <meshStandardMaterial color="#6D4C41" />
          </Sphere>
        </group>
      ))}
      {/* Horizontal bars */}
      <Box args={[length - 0.5, 0.08, 0.05]} position={[(length - 1.5) / 2, 0.3, 0]}>
        <meshStandardMaterial color="#A1887F" />
      </Box>
      <Box args={[length - 0.5, 0.08, 0.05]} position={[(length - 1.5) / 2, 0.7, 0]}>
        <meshStandardMaterial color="#A1887F" />
      </Box>
    </group>
  );
}

// Lamp post
function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.08, 0.12, 3, 8]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#424242" metalness={0.7} />
      </Cylinder>
      <Box args={[0.5, 0.1, 0.5]} position={[0, 3.1, 0]} castShadow>
        <meshStandardMaterial color="#212121" metalness={0.7} />
      </Box>
      <Sphere args={[0.15, 12, 12]} position={[0, 2.95, 0]}>
        <meshStandardMaterial color="#FFF9C4" emissive="#FFEB3B" emissiveIntensity={0.5} />
      </Sphere>
      <pointLight position={[0, 2.9, 0]} intensity={0.5} distance={8} color="#FFF9C4" />
    </group>
  );
}

// Window component
function Window({ position, size = [0.8, 1.2, 0.1], color }: { position: [number, number, number]; size?: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <Box args={size} castShadow>
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </Box>
      <Box args={[size[0] + 0.1, size[1] + 0.1, size[2] - 0.05]} position={[0, 0, -0.03]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
    </group>
  );
}

// Door component
function Door({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <Box args={[1.2, 2.4, 0.15]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>
      <Cylinder args={[0.05, 0.05, 0.2, 8]} position={[0.4, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#C0A000" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
}

// Modern house walls
function ModernHouseWalls({ floors, colors, roomsCount }: { floors: number; colors: { walls: string; roof: string; windows: string; door: string; trim: string }; roomsCount: number }) {
  const width = 4 + roomsCount * 0.8;
  const depth = 4 + roomsCount * 0.5;
  const floorHeight = 3;
  
  return (
    <group>
      {Array.from({ length: floors }).map((_, floorIndex) => (
        <group key={floorIndex} position={[0, floorIndex * floorHeight + floorHeight / 2, 0]}>
          <Box args={[width, floorHeight, depth]} castShadow receiveShadow>
            <meshStandardMaterial color={colors.walls} />
          </Box>
          <Window position={[-width / 4, 0.2, depth / 2 + 0.05]} color={colors.windows} />
          <Window position={[width / 4, 0.2, depth / 2 + 0.05]} color={colors.windows} />
          <Window position={[width / 2 + 0.05, 0.2, 0]} color={colors.windows} />
          <Window position={[-width / 2 - 0.05, 0.2, 0]} color={colors.windows} />
          <Window position={[0, 0.2, -depth / 2 - 0.05]} color={colors.windows} />
        </group>
      ))}
      <Door position={[0, 1.2, depth / 2 + 0.1]} color={colors.door} />
    </group>
  );
}

// Flat roof for modern style
function FlatRoof({ width, depth, height, color }: { width: number; depth: number; height: number; color: string }) {
  return (
    <Box args={[width + 0.5, 0.3, depth + 0.5]} position={[0, height, 0]} castShadow>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

// Pitched roof for classic/traditional style
function PitchedRoof({ width, depth, height, color }: { width: number; depth: number; height: number; color: string }) {
  const roofHeight = 2;
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2 - 0.5, 0);
    s.lineTo(0, roofHeight);
    s.lineTo(width / 2 + 0.5, 0);
    s.lineTo(-width / 2 - 0.5, 0);
    return s;
  }, [width]);
  
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: depth + 1,
    bevelEnabled: false,
  }), [depth]);

  return (
    <mesh position={[0, height, depth / 2 + 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Chimney component
function Chimney({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Box args={[0.8, 1.5, 0.8]} position={position} castShadow>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

// Balcony component
function Balcony({ position, width, color }: { position: [number, number, number]; width: number; color: string }) {
  return (
    <group position={position}>
      <Box args={[width, 0.15, 1.5]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>
      {[-width / 2, 0, width / 2].map((x, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 1, 8]} position={[x, 0.5, 0.7]}>
          <meshStandardMaterial color="#666666" metalness={0.5} />
        </Cylinder>
      ))}
      <Box args={[width, 0.05, 0.05]} position={[0, 1, 0.7]}>
        <meshStandardMaterial color="#666666" metalness={0.5} />
      </Box>
    </group>
  );
}

// Landscape component
function Landscape({ designParams }: { designParams: DesignParams }) {
  const roomsCount = designParams.roomsCount;
  const width = 4 + roomsCount * 0.8;
  const depth = 4 + roomsCount * 0.5;
  const hasPool = designParams.buildingType === "villa" || designParams.style === "mediterranean";
  
  return (
    <group>
      {/* Trees - scattered around */}
      <Tree position={[-12, 0, -8]} scale={1.2} />
      <Tree position={[-10, 0, 5]} scale={0.9} />
      <RoundTree position={[12, 0, -6]} scale={1.1} />
      <RoundTree position={[10, 0, 8]} scale={0.8} />
      <Tree position={[-8, 0, 12]} scale={1} />
      <RoundTree position={[14, 0, 2]} scale={1.3} />
      <Tree position={[-14, 0, 0]} scale={1.1} />
      
      {/* Bushes around the house */}
      <Bush position={[-width / 2 - 1, 0, depth / 2 + 1]} scale={1.2} />
      <Bush position={[width / 2 + 1, 0, depth / 2 + 1]} scale={1} />
      <Bush position={[-width / 2 - 1.5, 0, -depth / 2]} scale={0.8} />
      <Bush position={[width / 2 + 1.5, 0, -depth / 2]} scale={1.1} />
      
      {/* Flower beds */}
      <FlowerBed position={[-width / 2 - 0.5, 0, 0]} />
      <FlowerBed position={[width / 2 + 0.5, 0, 0]} />
      
      {/* Swimming pool for villa/mediterranean */}
      {hasPool && (
        <SwimmingPool position={[-width / 2 - 6, 0, 0]} size={[5, 3]} />
      )}
      
      {/* Car on driveway */}
      <Car position={[0, 0, 16]} color="#1565C0" rotation={Math.PI} />
      
      {/* Second car for villa */}
      {designParams.buildingType === "villa" && (
        <Car position={[3, 0, 14]} color="#212121" rotation={Math.PI + 0.2} />
      )}
      
      {/* Garden furniture */}
      <GardenFurniture position={[width / 2 + 4, 0, -depth / 2 + 2]} />
      
      {/* Fence */}
      <Fence startPos={[-15, 0, -15]} length={12} />
      <Fence startPos={[15, 0, -15]} length={12} rotation={Math.PI / 2} />
      
      {/* Lamp posts */}
      <LampPost position={[-3, 0, 10]} />
      <LampPost position={[3, 0, 10]} />
      
      {/* Additional decorative elements for villa */}
      {designParams.buildingType === "villa" && (
        <>
          <Bush position={[-width / 2 - 3, 0, depth / 2 + 3]} scale={1.5} />
          <Bush position={[width / 2 + 3, 0, depth / 2 + 3]} scale={1.4} />
          <RoundTree position={[-width / 2 - 5, 0, -depth / 2 - 3]} scale={1.2} />
          <RoundTree position={[width / 2 + 5, 0, -depth / 2 - 3]} scale={1} />
        </>
      )}
    </group>
  );
}

// Main house component
function House({ designParams }: { designParams: DesignParams }) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = colorSchemeMap[designParams.colorScheme] || colorSchemeMap.warm_neutral;
  const floorHeight = 3;
  const floors = designParams.floorsCount;
  const roomsCount = designParams.roomsCount;
  const width = 4 + roomsCount * 0.8;
  const depth = 4 + roomsCount * 0.5;
  const totalHeight = floors * floorHeight;
  
  const isModern = designParams.style === "modern" || designParams.style === "minimalist" || designParams.style === "scandinavian";
  const isTraditional = designParams.style === "traditional_uzbek" || designParams.style === "classic";
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Floor />
      
      {/* Landscape elements */}
      <Landscape designParams={designParams} />
      
      {/* Main structure */}
      <ModernHouseWalls floors={floors} colors={colors} roomsCount={roomsCount} />
      
      {/* Roof based on style */}
      {isModern ? (
        <FlatRoof width={width} depth={depth} height={totalHeight} color={colors.roof} />
      ) : (
        <PitchedRoof width={width} depth={depth} height={totalHeight} color={colors.roof} />
      )}
      
      {/* Chimney for traditional styles */}
      {isTraditional && (
        <Chimney position={[width / 4, totalHeight + 1.5, -depth / 4]} color="#8B4513" />
      )}
      
      {/* Balcony for 2+ floor buildings */}
      {floors >= 2 && (
        <Balcony position={[0, floorHeight, depth / 2 + 0.8]} width={width * 0.6} color={colors.trim} />
      )}
      
      {/* Villa specific: garden columns */}
      {designParams.buildingType === "villa" && (
        <>
          {[-width / 2 - 1, width / 2 + 1].map((x, i) => (
            <Cylinder key={i} args={[0.2, 0.3, 3, 8]} position={[x, 1.5, depth / 2 + 1.5]} castShadow>
              <meshStandardMaterial color={colors.trim} />
            </Cylinder>
          ))}
        </>
      )}
      
      {/* Townhouse specific: attached unit hint */}
      {designParams.buildingType === "townhouse" && (
        <Box args={[1, totalHeight, depth]} position={[width / 2 + 0.5, totalHeight / 2, 0]} castShadow>
          <meshStandardMaterial color={colors.walls} opacity={0.3} transparent />
        </Box>
      )}
      
      {/* Apartment specific: more windows */}
      {designParams.buildingType === "apartment" && floors >= 2 && (
        <>
          {Array.from({ length: floors }).map((_, floorIndex) => (
            <group key={`extra-${floorIndex}`}>
              <Window 
                position={[-width / 2 + 1, floorHeight * (floorIndex + 0.5) + 0.2, depth / 2 + 0.05]} 
                size={[0.6, 0.8, 0.1]}
                color={colors.windows}
              />
              <Window 
                position={[width / 2 - 1, floorHeight * (floorIndex + 0.5) + 0.2, depth / 2 + 0.05]} 
                size={[0.6, 0.8, 0.1]}
                color={colors.windows}
              />
            </group>
          ))}
        </>
      )}
    </group>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">3D model yuklanmoqda...</span>
      </div>
    </Html>
  );
}

// Main export component
export default function House3DModel({ designParams }: House3DModelProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [20, 15, 20], fov: 50 }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {/* Sky color */}
          <color attach="background" args={["#87CEEB"]} />
          
          {/* Fog for depth */}
          <fog attach="fog" args={["#87CEEB", 30, 80]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[15, 25, 15]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={60}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          <directionalLight position={[-10, 10, -10]} intensity={0.4} />
          <hemisphereLight args={["#87CEEB", "#4A7C59", 0.3]} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* House model with landscape */}
          <House designParams={designParams} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Suspense>
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg text-xs text-muted-foreground">
          🖱️ Aylantirish • 🔍 Kattalashtirish • 🌳 Daraxtlar, mashinalar va hovuz bor!
        </div>
      </div>
    </div>
  );
}
