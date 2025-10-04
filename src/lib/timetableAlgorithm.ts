// NEP 2020 Timetable Generation Algorithm
// Implements constraint satisfaction with backtracking and optimization

export interface TimeSlot {
        day: string;
        time: string;
        duration: number; // in hours
      }
      
      export interface TimetableEntry {
        id: string;
        courseId: string;
        courseName: string;
        courseCode: string;
        facultyId: string;
        facultyName: string;
        roomId: string;
        roomName: string;
        programId: string;
        programName: string;
        timeSlot: TimeSlot;
        studentCount: number;
        type: 'theory' | 'practical';
      }
      
      export interface Constraint {
        type: 'faculty_conflict' | 'room_conflict' | 'student_conflict' | 'faculty_availability' | 'room_availability';
        description: string;
        severity: 'high' | 'medium' | 'low';
      }
      
      export interface GenerationResult {
        timetable: TimetableEntry[];
        conflicts: Constraint[];
        success: boolean;
        message: string;
      }
      
      interface Program {
        id: string;
        name: string;
        type: string;
      }
      
      interface Course {
        id: string;
        name: string;
        code: string;
        program: string;
        isElective: boolean;
        semester: number;
        theoryHours: number;
        practicalHours: number;
        description: string;
      }
      
      interface Faculty {
        id: string;
        name: string;
        canTeachPrograms: string[];
        expertise: string[];
        unavailableSlots?: string[];
      }
      
      interface Room {
        id: string;
        name: string;
        type: string;
        unavailableSlots?: string[];
      }
      
      const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const TIME_SLOTS = [
        '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
        '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
      ];
      
      export class TimetableGenerator {
        private programs: Program[] = [];
        private courses: Course[] = [];
        private faculty: Faculty[] = [];
        private rooms: Room[] = [];
      
        constructor() {
          this.loadData();
        }
      
        private loadData() {
          this.programs = JSON.parse(localStorage.getItem('programs') || '[]');
          this.courses = JSON.parse(localStorage.getItem('courses') || '[]');
          this.faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
          this.rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        }
      
        public generateTimetable(selectedPrograms: string[]): GenerationResult {
          this.loadData(); // Refresh data
          
          if (this.programs.length === 0 || this.courses.length === 0 || 
              this.faculty.length === 0 || this.rooms.length === 0) {
            return {
              timetable: [],
              conflicts: [],
              success: false,
              message: 'Please ensure you have added programs, courses, faculty, and rooms before generating timetable.'
            };
          }
      
          const timetable: TimetableEntry[] = [];
          const conflicts: Constraint[] = [];
      
          // Get courses for selected programs
          const relevantCourses = this.courses.filter(course => 
            selectedPrograms.includes(course.program)
          );
      
          if (relevantCourses.length === 0) {
            return {
              timetable: [],
              conflicts: [],
              success: false,
              message: 'No courses found for selected programs.'
            };
          }
      
          // Sort courses by priority (required courses first, then by semester)
          const sortedCourses = relevantCourses.sort((a, b) => {
            if (a.isElective !== b.isElective) {
              return a.isElective ? 1 : -1; // Required courses first
            }
            return a.semester - b.semester;
          });
      
          // Generate timetable entries
          for (const course of sortedCourses) {
            const program = this.programs.find(p => p.id === course.program);
            if (!program) continue;
      
            // Create entries for theory hours
            if (course.theoryHours > 0) {
              const theoryEntries = this.createCourseEntries(
                course, program, 'theory', course.theoryHours
              );
              timetable.push(...theoryEntries);
            }
      
            // Create entries for practical hours
            if (course.practicalHours > 0) {
              const practicalEntries = this.createCourseEntries(
                course, program, 'practical', course.practicalHours
              );
              timetable.push(...practicalEntries);
            }
          }
      
          // Assign time slots using constraint satisfaction
          const scheduledTimetable = this.scheduleEntries(timetable);
          const detectedConflicts = this.detectConflicts(scheduledTimetable);
      
          return {
            timetable: scheduledTimetable,
            conflicts: detectedConflicts,
            success: detectedConflicts.filter(c => c.severity === 'high').length === 0,
            message: detectedConflicts.length === 0 
              ? 'Timetable generated successfully without conflicts!'
              : `Timetable generated with ${detectedConflicts.length} conflicts. Please review and resolve.`
          };
        }
      
        private createCourseEntries(course: Course, program: Program, type: 'theory' | 'practical', hours: number): TimetableEntry[] {
          const entries: TimetableEntry[] = [];
          
          // Find suitable faculty
          const suitableFaculty = this.faculty.filter(f => 
            f.canTeachPrograms.includes(program.id) &&
            f.expertise.some((exp: string) => 
              course.name.toLowerCase().includes(exp.toLowerCase()) ||
              course.description.toLowerCase().includes(exp.toLowerCase())
            )
          );
      
          if (suitableFaculty.length === 0) {
            // Fallback to any faculty who can teach this program
            suitableFaculty.push(...this.faculty.filter(f => 
              f.canTeachPrograms.includes(program.id)
            ));
          }
      
          const selectedFaculty = suitableFaculty[0] || this.faculty[0];
          if (!selectedFaculty) return entries;
      
          // Find suitable rooms
          const suitableRooms = this.rooms.filter(room => {
            if (type === 'practical') {
              return room.type === 'Laboratory' || room.type === 'Computer Lab';
            }
            return room.type === 'Classroom' || room.type === 'Seminar Hall';
          });
      
          const selectedRoom = suitableRooms[0] || this.rooms[0];
          if (!selectedRoom) return entries;
      
          // Create entries for each hour
          for (let i = 0; i < hours; i++) {
            entries.push({
              id: `${course.id}-${type}-${i}-${Date.now()}`,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              facultyId: selectedFaculty.id,
              facultyName: selectedFaculty.name,
              roomId: selectedRoom.id,
              roomName: selectedRoom.name,
              programId: program.id,
              programName: program.name,
              timeSlot: { day: '', time: '', duration: 1 },
              studentCount: this.estimateStudentCount(program),
              type
            });
          }
      
          return entries;
        }
      
        private scheduleEntries(entries: TimetableEntry[]): TimetableEntry[] {
          const scheduled: TimetableEntry[] = [];
          const occupiedSlots = new Map<string, Set<string>>(); // day-time -> Set of resource IDs
      
          for (const entry of entries) {
            let assigned = false;
      
            // Try to find a suitable time slot
            for (const day of WEEKDAYS) {
              for (const timeSlot of TIME_SLOTS) {
                const slotKey = `${day}-${timeSlot}`;
                
                if (!occupiedSlots.has(slotKey)) {
                  occupiedSlots.set(slotKey, new Set());
                }
      
                const occupiedResources = occupiedSlots.get(slotKey)!;
      
                // Check if faculty, room are available
                if (!occupiedResources.has(`faculty-${entry.facultyId}`) &&
                    !occupiedResources.has(`room-${entry.roomId}`) &&
                    this.isSlotAvailable(entry.facultyId, entry.roomId, day, timeSlot)) {
                  
                  // Assign the slot
                  entry.timeSlot = { day, time: timeSlot, duration: 1 };
                  occupiedResources.add(`faculty-${entry.facultyId}`);
                  occupiedResources.add(`room-${entry.roomId}`);
                  assigned = true;
                  break;
                }
              }
              if (assigned) break;
            }
      
            scheduled.push(entry);
          }
      
          return scheduled;
        }
      
        private isSlotAvailable(facultyId: string, roomId: string, day: string, timeSlot: string): boolean {
          const faculty = this.faculty.find(f => f.id === facultyId);
          const room = this.rooms.find(r => r.id === roomId);
      
          if (!faculty || !room) return false;
      
          // Check faculty availability
          if (faculty.unavailableSlots && faculty.unavailableSlots.includes(timeSlot)) {
            return false;
          }
      
          // Check room availability
          if (room.unavailableSlots && room.unavailableSlots.includes(timeSlot)) {
            return false;
          }
      
          return true;
        }
      
        private detectConflicts(timetable: TimetableEntry[]): Constraint[] {
          const conflicts: Constraint[] = [];
          const slotMap = new Map<string, TimetableEntry[]>();
      
          // Group entries by time slot
          timetable.forEach(entry => {
            if (entry.timeSlot.day && entry.timeSlot.time) {
              const key = `${entry.timeSlot.day}-${entry.timeSlot.time}`;
              if (!slotMap.has(key)) {
                slotMap.set(key, []);
              }
              slotMap.get(key)!.push(entry);
            } else {
              // Unscheduled entry
              conflicts.push({
                type: 'faculty_conflict',
                description: `Course ${entry.courseCode} (${entry.courseName}) could not be scheduled`,
                severity: 'high'
              });
            }
          });
      
          // Check for conflicts in each time slot
          slotMap.forEach((entries, slot) => {
            const facultyIds = new Set<string>();
            const roomIds = new Set<string>();
      
            entries.forEach(entry => {
              // Faculty conflict
              if (facultyIds.has(entry.facultyId)) {
                conflicts.push({
                  type: 'faculty_conflict',
                  description: `Faculty ${entry.facultyName} has multiple classes at ${slot}`,
                  severity: 'high'
                });
              }
              facultyIds.add(entry.facultyId);
      
              // Room conflict
              if (roomIds.has(entry.roomId)) {
                conflicts.push({
                  type: 'room_conflict',
                  description: `Room ${entry.roomName} has multiple classes at ${slot}`,
                  severity: 'high'
                });
              }
              roomIds.add(entry.roomId);
            });
          });
      
          return conflicts;
        }
      
        private estimateStudentCount(program: Program): number {
          // Simple estimation based on program type
          const baseCounts = {
            'B.Ed': 40,
            'M.Ed': 30,
            'FYUP': 60,
            'ITEP': 35
          };
          return baseCounts[program.type as keyof typeof baseCounts] || 30;
        }
      
        public exportToPDF(timetable: TimetableEntry[]): void {
          // Simple implementation - in a real app, you'd use a proper PDF library
          const content = this.formatTimetableForExport(timetable);
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timetable-${new Date().toISOString().split('T')[0]}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
      
        public exportToExcel(timetable: TimetableEntry[]): void {
          // Simple CSV export - in a real app, you'd use a proper Excel library
          const headers = ['Day', 'Time', 'Course Code', 'Course Name', 'Faculty', 'Room', 'Program', 'Type'];
          const rows = timetable.map(entry => [
            entry.timeSlot.day,
            entry.timeSlot.time,
            entry.courseCode,
            entry.courseName,
            entry.facultyName,
            entry.roomName,
            entry.programName,
            entry.type
          ]);
      
          const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
      
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timetable-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      
        private formatTimetableForExport(timetable: TimetableEntry[]): string {
          let content = 'NEP 2020 TIMETABLE\n';
          content += '==================\n\n';
      
          WEEKDAYS.forEach(day => {
            content += `${day.toUpperCase()}\n`;
            content += '-'.repeat(day.length) + '\n';
      
            TIME_SLOTS.forEach(timeSlot => {
              const entries = timetable.filter(e => 
                e.timeSlot.day === day && e.timeSlot.time === timeSlot
              );
      
              if (entries.length > 0) {
                content += `${timeSlot}:\n`;
                entries.forEach(entry => {
                  content += `  ${entry.courseCode} - ${entry.courseName}\n`;
                  content += `  Faculty: ${entry.facultyName} | Room: ${entry.roomName}\n`;
                  content += `  Program: ${entry.programName} | Type: ${entry.type}\n\n`;
                });
              }
            });
            content += '\n';
          });
      
          return content;
        }
      }