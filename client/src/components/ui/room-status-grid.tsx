import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Room } from "@shared/schema";

interface RoomStatusGridProps {
  onRoomClick?: (room: Room) => void;
}

export default function RoomStatusGrid({ onRoomClick }: RoomStatusGridProps) {
  const { data: rooms, isLoading, refetch } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-available";
      case "occupied":
        return "bg-occupied";
      case "pending":
        return "bg-pending";
      case "maintenance":
        return "bg-gray-400";
      default:
        return "bg-gray-200";
    }
  };

  const getStatusCounts = () => {
    if (!rooms) return { available: 0, occupied: 0, pending: 0, maintenance: 0 };
    
    return rooms.reduce((counts, room) => {
      counts[room.status as keyof typeof counts]++;
      return counts;
    }, { available: 0, occupied: 0, pending: 0, maintenance: 0 });
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Room Status Overview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-hotel-blue"
          data-testid="button-refresh-rooms"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      {/* Room Grid */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {rooms?.map((room) => (
          <div key={room.id} className="relative group">
            <button
              onClick={() => onRoomClick?.(room)}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium 
                cursor-pointer hover:scale-105 transition-transform
                ${getStatusColor(room.status)}
              `}
              data-testid={`room-${room.number}`}
            >
              {room.number}
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {room.type}
            </div>
          </div>
        ))}
      </div>
      
      {/* Status Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-available rounded"></div>
            <span className="text-gray-600">Available ({statusCounts.available})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-occupied rounded"></div>
            <span className="text-gray-600">Occupied ({statusCounts.occupied})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pending rounded"></div>
            <span className="text-gray-600">Pending ({statusCounts.pending})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-gray-600">Maintenance ({statusCounts.maintenance})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
