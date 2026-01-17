import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface DesignParams {
  buildingType: string;
  style: string;
  roomsCount: number;
  floorsCount: number;
  colorScheme: string;
}

interface Room {
  id: string;
  name: string;
  nameUz: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface FloorPlanProps {
  designParams: DesignParams;
  selectedFloor?: number;
}

// Room templates based on building type
const roomTemplates: Record<string, { name: string; nameUz: string; minSize: number; priority: number; color: string }[]> = {
  house: [
    { name: "Living Room", nameUz: "Mehmonxona", minSize: 25, priority: 1, color: "#E3F2FD" },
    { name: "Kitchen", nameUz: "Oshxona", minSize: 15, priority: 2, color: "#FFF3E0" },
    { name: "Dining", nameUz: "Ovqatlanish", minSize: 12, priority: 3, color: "#F3E5F5" },
    { name: "Bedroom", nameUz: "Yotoqxona", minSize: 14, priority: 4, color: "#E8F5E9" },
    { name: "Bathroom", nameUz: "Hammom", minSize: 6, priority: 5, color: "#E0F7FA" },
    { name: "Corridor", nameUz: "Koridor", minSize: 8, priority: 6, color: "#ECEFF1" },
  ],
  villa: [
    { name: "Grand Living", nameUz: "Katta zal", minSize: 40, priority: 1, color: "#E3F2FD" },
    { name: "Kitchen", nameUz: "Oshxona", minSize: 20, priority: 2, color: "#FFF3E0" },
    { name: "Dining Room", nameUz: "Ovqatlanish xonasi", minSize: 18, priority: 3, color: "#F3E5F5" },
    { name: "Master Bedroom", nameUz: "Bosh yotoqxona", minSize: 25, priority: 4, color: "#E8F5E9" },
    { name: "Guest Room", nameUz: "Mehmon xonasi", minSize: 16, priority: 5, color: "#FFF8E1" },
    { name: "Bathroom", nameUz: "Hammom", minSize: 8, priority: 6, color: "#E0F7FA" },
    { name: "Office", nameUz: "Ish xonasi", minSize: 12, priority: 7, color: "#FCE4EC" },
    { name: "Terrace", nameUz: "Ayvon", minSize: 15, priority: 8, color: "#F1F8E9" },
  ],
  apartment: [
    { name: "Living Room", nameUz: "Yashash xonasi", minSize: 20, priority: 1, color: "#E3F2FD" },
    { name: "Kitchen", nameUz: "Oshxona", minSize: 10, priority: 2, color: "#FFF3E0" },
    { name: "Bedroom", nameUz: "Yotoqxona", minSize: 12, priority: 3, color: "#E8F5E9" },
    { name: "Bathroom", nameUz: "Hammom", minSize: 5, priority: 4, color: "#E0F7FA" },
    { name: "Balcony", nameUz: "Balkon", minSize: 4, priority: 5, color: "#F1F8E9" },
  ],
  townhouse: [
    { name: "Living Room", nameUz: "Mehmonxona", minSize: 22, priority: 1, color: "#E3F2FD" },
    { name: "Kitchen", nameUz: "Oshxona", minSize: 14, priority: 2, color: "#FFF3E0" },
    { name: "Dining", nameUz: "Ovqatlanish", minSize: 10, priority: 3, color: "#F3E5F5" },
    { name: "Bedroom", nameUz: "Yotoqxona", minSize: 13, priority: 4, color: "#E8F5E9" },
    { name: "Bathroom", nameUz: "Hammom", minSize: 5, priority: 5, color: "#E0F7FA" },
    { name: "Garage", nameUz: "Garaj", minSize: 18, priority: 6, color: "#EFEBE9" },
  ],
};

// Generate floor plan layout
function generateFloorPlan(params: DesignParams, floor: number): { rooms: Room[]; totalWidth: number; totalHeight: number; dimensions: { width: number; height: number } } {
  const templates = roomTemplates[params.buildingType] || roomTemplates.house;
  const rooms: Room[] = [];
  
  // Calculate base dimensions based on room count
  const baseWidth = 10 + params.roomsCount * 2;
  const baseHeight = 8 + params.roomsCount * 1.5;
  
  // Scale factor for SVG
  const scale = 40;
  const totalWidth = baseWidth * scale;
  const totalHeight = baseHeight * scale;
  
  // Determine rooms for this floor
  const roomsPerFloor = Math.ceil(params.roomsCount / params.floorsCount);
  const isGroundFloor = floor === 1;
  
  // Grid-based layout
  const gridCols = 3;
  const gridRows = Math.ceil(roomsPerFloor / gridCols) + 1;
  const cellWidth = baseWidth / gridCols;
  const cellHeight = baseHeight / gridRows;
  
  let roomIndex = 0;
  
  // Add rooms based on floor
  if (isGroundFloor) {
    // Ground floor typically has living areas
    const groundFloorRooms = templates.filter(t => 
      ["Living Room", "Grand Living", "Kitchen", "Dining", "Dining Room", "Corridor", "Garage", "Terrace"].includes(t.name)
    );
    
    // Living room - large, spans 2 columns
    if (groundFloorRooms.length > 0) {
      rooms.push({
        id: `room-${roomIndex++}`,
        name: groundFloorRooms[0].name,
        nameUz: groundFloorRooms[0].nameUz,
        x: 0,
        y: 0,
        width: cellWidth * 2 * scale,
        height: cellHeight * 1.5 * scale,
        color: groundFloorRooms[0].color,
      });
    }
    
    // Kitchen
    const kitchen = templates.find(t => t.name === "Kitchen");
    if (kitchen) {
      rooms.push({
        id: `room-${roomIndex++}`,
        name: kitchen.name,
        nameUz: kitchen.nameUz,
        x: cellWidth * 2 * scale,
        y: 0,
        width: cellWidth * scale,
        height: cellHeight * 1.5 * scale,
        color: kitchen.color,
      });
    }
    
    // Dining
    const dining = templates.find(t => t.name.includes("Dining"));
    if (dining) {
      rooms.push({
        id: `room-${roomIndex++}`,
        name: dining.name,
        nameUz: dining.nameUz,
        x: 0,
        y: cellHeight * 1.5 * scale,
        width: cellWidth * 1.5 * scale,
        height: cellHeight * scale,
        color: dining.color,
      });
    }
    
    // Corridor
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "Corridor",
      nameUz: "Koridor",
      x: cellWidth * 1.5 * scale,
      y: cellHeight * 1.5 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 1.5 * scale,
      color: "#ECEFF1",
    });
    
    // Bathroom on ground floor
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "WC",
      nameUz: "Hojatxona",
      x: cellWidth * 2 * scale,
      y: cellHeight * 1.5 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 0.8 * scale,
      color: "#E0F7FA",
    });
    
    // Garage or terrace for ground floor
    if (params.buildingType === "townhouse" || params.buildingType === "villa") {
      const extra = params.buildingType === "townhouse" ? 
        { name: "Garage", nameUz: "Garaj", color: "#EFEBE9" } :
        { name: "Terrace", nameUz: "Ayvon", color: "#F1F8E9" };
      rooms.push({
        id: `room-${roomIndex++}`,
        name: extra.name,
        nameUz: extra.nameUz,
        x: cellWidth * 2.5 * scale,
        y: cellHeight * 1.5 * scale,
        width: cellWidth * 0.5 * scale,
        height: cellHeight * 1.5 * scale,
        color: extra.color,
      });
    }
    
    // Stairs
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "Stairs",
      nameUz: "Zinapoya",
      x: cellWidth * 2 * scale,
      y: cellHeight * 2.3 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 0.7 * scale,
      color: "#CFD8DC",
    });
    
  } else {
    // Upper floors have bedrooms and bathrooms
    const bedroomCount = Math.min(params.roomsCount - 2, 4);
    
    for (let i = 0; i < bedroomCount; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      rooms.push({
        id: `room-${roomIndex++}`,
        name: i === 0 ? "Master Bedroom" : `Bedroom ${i}`,
        nameUz: i === 0 ? "Bosh yotoqxona" : `Yotoqxona ${i}`,
        x: col * cellWidth * 1.5 * scale,
        y: row * cellHeight * 1.3 * scale,
        width: cellWidth * 1.5 * scale,
        height: cellHeight * 1.3 * scale,
        color: "#E8F5E9",
      });
    }
    
    // Master bathroom
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "Bathroom",
      nameUz: "Hammom",
      x: 0,
      y: cellHeight * 2.6 * scale,
      width: cellWidth * scale,
      height: cellHeight * 0.8 * scale,
      color: "#E0F7FA",
    });
    
    // Second bathroom
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "WC",
      nameUz: "Hojatxona",
      x: cellWidth * scale,
      y: cellHeight * 2.6 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 0.6 * scale,
      color: "#E0F7FA",
    });
    
    // Corridor
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "Corridor",
      nameUz: "Koridor",
      x: cellWidth * 1.5 * scale,
      y: cellHeight * 2.6 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 0.8 * scale,
      color: "#ECEFF1",
    });
    
    // Stairs
    rooms.push({
      id: `room-${roomIndex++}`,
      name: "Stairs",
      nameUz: "Zinapoya",
      x: cellWidth * 2 * scale,
      y: cellHeight * 2.6 * scale,
      width: cellWidth * 0.5 * scale,
      height: cellHeight * 0.7 * scale,
      color: "#CFD8DC",
    });
    
    // Office or balcony
    if (params.buildingType === "villa") {
      rooms.push({
        id: `room-${roomIndex++}`,
        name: "Office",
        nameUz: "Ish xonasi",
        x: cellWidth * 2.5 * scale,
        y: cellHeight * 2.6 * scale,
        width: cellWidth * 0.5 * scale,
        height: cellHeight * 0.8 * scale,
        color: "#FCE4EC",
      });
    }
  }
  
  return {
    rooms,
    totalWidth,
    totalHeight,
    dimensions: { width: baseWidth, height: baseHeight }
  };
}

export default function FloorPlan({ designParams, selectedFloor = 1 }: FloorPlanProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [currentFloor, setCurrentFloor] = useState(selectedFloor);
  
  const { rooms, totalWidth, totalHeight, dimensions } = useMemo(
    () => generateFloorPlan(designParams, currentFloor),
    [designParams, currentFloor]
  );
  
  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `floor-plan-${currentFloor}-${Date.now()}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  const wallThickness = 8;
  const padding = 30;
  const viewBoxWidth = totalWidth + padding * 2 + wallThickness * 2;
  const viewBoxHeight = totalHeight + padding * 2 + wallThickness * 2 + 60;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: designParams.floorsCount }).map((_, i) => (
            <Button
              key={i}
              variant={currentFloor === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFloor(i + 1)}
            >
              {i + 1}-qavat
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
        </div>
      </div>
      
      {/* Floor plan SVG */}
      <div className="overflow-auto border border-border rounded-lg bg-white p-4" style={{ maxHeight: "500px" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          width={viewBoxWidth * zoom}
          height={viewBoxHeight * zoom}
          className="mx-auto"
        >
          {/* Background */}
          <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="#FAFAFA" />
          
          {/* Title */}
          <text
            x={viewBoxWidth / 2}
            y="25"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#333"
          >
            {currentFloor}-QAVAT PLANI
          </text>
          <text
            x={viewBoxWidth / 2}
            y="45"
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {dimensions.width.toFixed(1)}m × {dimensions.height.toFixed(1)}m
          </text>
          
          {/* Main walls outline */}
          <rect
            x={padding}
            y={padding + 40}
            width={totalWidth + wallThickness * 2}
            height={totalHeight + wallThickness * 2}
            fill="none"
            stroke="#333"
            strokeWidth={wallThickness}
          />
          
          {/* Rooms */}
          {rooms.map((room) => (
            <g key={room.id}>
              {/* Room fill */}
              <rect
                x={padding + wallThickness + room.x}
                y={padding + 40 + wallThickness + room.y}
                width={room.width - 4}
                height={room.height - 4}
                fill={room.color}
                stroke="#999"
                strokeWidth="2"
              />
              
              {/* Room label */}
              <text
                x={padding + wallThickness + room.x + room.width / 2}
                y={padding + 40 + wallThickness + room.y + room.height / 2 - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#333"
              >
                {room.nameUz}
              </text>
              
              {/* Room dimensions */}
              <text
                x={padding + wallThickness + room.x + room.width / 2}
                y={padding + 40 + wallThickness + room.y + room.height / 2 + 10}
                textAnchor="middle"
                fontSize="9"
                fill="#666"
              >
                {(room.width / 40).toFixed(1)}m × {(room.height / 40).toFixed(1)}m
              </text>
              
              {/* Area */}
              <text
                x={padding + wallThickness + room.x + room.width / 2}
                y={padding + 40 + wallThickness + room.y + room.height / 2 + 22}
                textAnchor="middle"
                fontSize="8"
                fill="#888"
              >
                ({((room.width / 40) * (room.height / 40)).toFixed(1)} m²)
              </text>
              
              {/* Door indicator for main rooms */}
              {!room.name.includes("Corridor") && !room.name.includes("Stairs") && (
                <rect
                  x={padding + wallThickness + room.x + room.width / 2 - 15}
                  y={padding + 40 + wallThickness + room.y + room.height - 6}
                  width="30"
                  height="4"
                  fill="#8B4513"
                  rx="1"
                />
              )}
              
              {/* Stairs indicator */}
              {room.name === "Stairs" && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={i}
                      x1={padding + wallThickness + room.x + 8}
                      y1={padding + 40 + wallThickness + room.y + 10 + i * ((room.height - 20) / 5)}
                      x2={padding + wallThickness + room.x + room.width - 8}
                      y2={padding + 40 + wallThickness + room.y + 10 + i * ((room.height - 20) / 5)}
                      stroke="#666"
                      strokeWidth="2"
                    />
                  ))}
                  <polygon
                    points={`
                      ${padding + wallThickness + room.x + room.width / 2},${padding + 40 + wallThickness + room.y + 8}
                      ${padding + wallThickness + room.x + room.width / 2 - 8},${padding + 40 + wallThickness + room.y + 20}
                      ${padding + wallThickness + room.x + room.width / 2 + 8},${padding + 40 + wallThickness + room.y + 20}
                    `}
                    fill="#666"
                  />
                </>
              )}
            </g>
          ))}
          
          {/* Compass */}
          <g transform={`translate(${viewBoxWidth - 50}, ${viewBoxHeight - 50})`}>
            <circle cx="0" cy="0" r="20" fill="none" stroke="#333" strokeWidth="1" />
            <polygon points="0,-15 -5,0 0,-5 5,0" fill="#E53935" />
            <polygon points="0,15 -5,0 0,5 5,0" fill="#333" />
            <text x="0" y="-22" textAnchor="middle" fontSize="10" fill="#E53935" fontWeight="bold">N</text>
          </g>
          
          {/* Scale bar */}
          <g transform={`translate(${padding}, ${viewBoxHeight - 25})`}>
            <line x1="0" y1="0" x2="80" y2="0" stroke="#333" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#333" strokeWidth="2" />
            <line x1="40" y1="-3" x2="40" y2="3" stroke="#333" strokeWidth="1" />
            <line x1="80" y1="-5" x2="80" y2="5" stroke="#333" strokeWidth="2" />
            <text x="0" y="15" fontSize="9" fill="#333">0</text>
            <text x="40" y="15" fontSize="9" fill="#333" textAnchor="middle">1m</text>
            <text x="80" y="15" fontSize="9" fill="#333" textAnchor="end">2m</text>
          </g>
        </svg>
      </div>
      
      {/* Room legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-2 p-2 rounded border border-border">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: room.color }} />
            <span className="font-medium">{room.nameUz}</span>
            <span className="text-muted-foreground ml-auto">
              {((room.width / 40) * (room.height / 40)).toFixed(1)} m²
            </span>
          </div>
        ))}
      </div>
      
      {/* Total area */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Umumiy maydon ({currentFloor}-qavat):</span>
          <span className="text-lg font-bold text-primary">
            {rooms.reduce((acc, room) => acc + (room.width / 40) * (room.height / 40), 0).toFixed(1)} m²
          </span>
        </div>
      </div>
    </div>
  );
}
