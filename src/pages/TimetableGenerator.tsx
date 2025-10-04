import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, FileText, AlertTriangle, CheckCircle, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import TimetableGrid from '@/components/TimetableGrid';
import { TimetableGenerator as Generator, TimetableEntry, Constraint } from '@/lib/timetableAlgorithm';

interface Program {
  id: string;
  name: string;
  type: string;
  duration: number;
  totalCredits: number;
}

export default function TimetableGenerator() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<Constraint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean | null>(null);
  const [generationMessage, setGenerationMessage] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);

  const generator = new Generator();

  useEffect(() => {
    loadPrograms();
    loadExistingTimetable();
  }, []);

  const loadPrograms = () => {
    const savedPrograms = localStorage.getItem('programs');
    if (savedPrograms) {
      const programsData = JSON.parse(savedPrograms);
      setPrograms(programsData);
      // Auto-select all programs initially
      setSelectedPrograms(programsData.map((p: Program) => p.id));
    }
  };

  const loadExistingTimetable = () => {
    const savedTimetable = localStorage.getItem('generated_timetable');
    if (savedTimetable) {
      const timetableData = JSON.parse(savedTimetable);
      setTimetable(timetableData.timetable || []);
      setConflicts(timetableData.conflicts || []);
      setGenerationSuccess(timetableData.success);
      setGenerationMessage(timetableData.message || '');
    }
  };

  const handleProgramSelection = (programId: string) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };

  const handleGenerateTimetable = async () => {
    if (selectedPrograms.length === 0) {
      toast.error('Please select at least one program');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = generator.generateTimetable(selectedPrograms);
      
      setTimetable(result.timetable);
      setConflicts(result.conflicts);
      setGenerationSuccess(result.success);
      setGenerationMessage(result.message);

      // Save to localStorage
      localStorage.setItem('generated_timetable', JSON.stringify(result));

      if (result.success) {
        toast.success('Timetable generated successfully!');
      } else {
        toast.warning('Timetable generated with conflicts. Please review.');
      }
    } catch (error) {
      toast.error('Failed to generate timetable. Please try again.');
      setGenerationSuccess(false);
      setGenerationMessage('An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEntryClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setShowEntryDialog(true);
  };

  const handleExportPDF = () => {
    generator.exportToPDF(timetable);
    toast.success('Timetable exported as text file');
  };

  const handleExportExcel = () => {
    generator.exportToExcel(timetable);
    toast.success('Timetable exported as CSV file');
  };

  const getConflictSeverityColor = (severity: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">AI Timetable Generator</h1>
              <p className="text-muted-foreground">Generate optimized schedules for NEP 2020 programs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {timetable.length > 0 && (
              <>
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </>
            )}
            <Button 
              onClick={handleGenerateTimetable} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Timetable
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Program Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Programs</CardTitle>
            <CardDescription>
              Choose the programs for which you want to generate the timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No programs found. Please add programs first.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/programs')}
                >
                  Add Programs
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`program-${program.id}`}
                      checked={selectedPrograms.includes(program.id)}
                      onCheckedChange={() => handleProgramSelection(program.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`program-${program.id}`} className="font-medium">
                        {program.name}
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{program.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {program.duration} years, {program.totalCredits} credits
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Status */}
        {generationMessage && (
          <Alert className={generationSuccess ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            {generationSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={generationSuccess ? 'text-green-800' : 'text-yellow-800'}>
              {generationMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Conflicts Summary */}
        {conflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Scheduling Conflicts ({conflicts.length})</span>
              </CardTitle>
              <CardDescription>
                Review and resolve these conflicts for optimal scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${getConflictSeverityColor(conflict.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{conflict.description}</span>
                      <Badge variant="outline" className={getConflictSeverityColor(conflict.severity)}>
                        {conflict.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timetable Display */}
        {timetable.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Generated Timetable</span>
              </CardTitle>
              <CardDescription>
                Interactive timetable view - click on any class for details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimetableGrid 
                timetable={timetable} 
                onEntryClick={handleEntryClick}
                showConflicts={conflicts.length > 0}
              />
            </CardContent>
          </Card>
        )}

        {/* Entry Details Dialog */}
        <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected class
              </DialogDescription>
            </DialogHeader>
            
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Course</Label>
                    <div className="font-semibold">{selectedEntry.courseCode}</div>
                    <div className="text-sm text-muted-foreground">{selectedEntry.courseName}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <div>
                      <Badge className={selectedEntry.type === 'theory' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {selectedEntry.type === 'theory' ? 'Theory' : 'Practical'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Faculty</Label>
                    <div className="font-medium">{selectedEntry.facultyName}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                    <div className="font-medium">{selectedEntry.roomName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Schedule</Label>
                    <div className="font-medium">
                      {selectedEntry.timeSlot.day}, {selectedEntry.timeSlot.time}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Program</Label>
                    <div className="font-medium">{selectedEntry.programName}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Students</Label>
                  <div className="font-medium">{selectedEntry.studentCount}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}