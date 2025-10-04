import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, BookOpen } from 'lucide-react';
import { TimetableEntry } from '@/lib/timetableAlgorithm';

interface TimetableGridProps {
  timetable: TimetableEntry[];
  onEntryClick?: (entry: TimetableEntry) => void;
  showConflicts?: boolean;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

export default function TimetableGrid({ timetable, onEntryClick, showConflicts = false }: TimetableGridProps) {
  const getEntriesForSlot = (day: string, timeSlot: string) => {
    return timetable.filter(entry => 
      entry.timeSlot.day === day && entry.timeSlot.time === timeSlot
    );
  };

  const getEntryColor = (entry: TimetableEntry) => {
    const colors = {
      'theory': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      'practical': 'bg-green-50 border-green-200 hover:bg-green-100'
    };
    return colors[entry.type] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  const getTypeColor = (type: string) => {
    return type === 'theory' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const hasConflict = (day: string, timeSlot: string) => {
    const entries = getEntriesForSlot(day, timeSlot);
    if (entries.length <= 1) return false;

    // Check for faculty or room conflicts
    const facultyIds = new Set();
    const roomIds = new Set();
    
    for (const entry of entries) {
      if (facultyIds.has(entry.facultyId) || roomIds.has(entry.roomId)) {
        return true;
      }
      facultyIds.add(entry.facultyId);
      roomIds.add(entry.roomId);
    }
    
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm">Theory</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm">Practical</span>
          </div>
          {showConflicts && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm">Conflict</span>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Total Classes: {timetable.length}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-9 gap-2 mb-2">
            <div className="font-semibold text-center p-2">Time</div>
            {WEEKDAYS.map(day => (
              <div key={day} className="font-semibold text-center p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {TIME_SLOTS.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-9 gap-2 mb-2">
              {/* Time Column */}
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded border text-sm font-medium">
                {timeSlot}
              </div>

              {/* Day Columns */}
              {WEEKDAYS.map(day => {
                const entries = getEntriesForSlot(day, timeSlot);
                const isConflicted = showConflicts && hasConflict(day, timeSlot);

                return (
                  <div 
                    key={`${day}-${timeSlot}`} 
                    className={`min-h-[120px] p-1 border rounded ${
                      isConflicted ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="space-y-1">
                      {entries.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          Free
                        </div>
                      ) : (
                        entries.map((entry, index) => (
                          <Card 
                            key={entry.id} 
                            className={`cursor-pointer transition-colors ${getEntryColor(entry)} ${
                              entries.length > 1 ? 'mb-1' : ''
                            }`}
                            onClick={() => onEntryClick?.(entry)}
                          >
                            <CardContent className="p-2">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs truncate">
                                    {entry.courseCode}
                                  </span>
                                  <Badge className={`text-xs ${getTypeColor(entry.type)}`}>
                                    {entry.type === 'theory' ? 'T' : 'P'}
                                  </Badge>
                                </div>
                                
                                <div className="text-xs text-gray-600 truncate">
                                  {entry.courseName}
                                </div>
                                
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">{entry.facultyName}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{entry.roomName}</span>
                                </div>
                                
                                <div className="text-xs text-gray-500 truncate">
                                  {entry.programName}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetable.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Theory Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timetable.filter(e => e.type === 'theory').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Practical Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timetable.filter(e => e.type === 'practical').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Scheduled Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(timetable.map(e => `${e.timeSlot.day}-${e.timeSlot.time}`)).size}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}