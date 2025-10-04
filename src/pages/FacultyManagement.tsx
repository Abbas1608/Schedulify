import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, ArrowLeft, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  expertise: string[];
  maxHoursPerWeek: number;
  preferredTimeSlots: string[];
  unavailableSlots: string[];
  canTeachPrograms: string[];
  phone: string;
  createdAt: string;
}

interface Program {
  id: string;
  name: string;
  type: string;
}

const timeSlots = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyManagement() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    expertise: '',
    maxHoursPerWeek: 20,
    preferredTimeSlots: [] as string[],
    unavailableSlots: [] as string[],
    canTeachPrograms: [] as string[],
    phone: ''
  });

  useEffect(() => {
    loadFaculty();
    loadPrograms();
  }, []);

  const loadFaculty = () => {
    const savedFaculty = localStorage.getItem('faculty');
    if (savedFaculty) {
      setFaculty(JSON.parse(savedFaculty));
    }
  };

  const loadPrograms = () => {
    const savedPrograms = localStorage.getItem('programs');
    if (savedPrograms) {
      setPrograms(JSON.parse(savedPrograms));
    }
  };

  const saveFaculty = (updatedFaculty: Faculty[]) => {
    localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
    setFaculty(updatedFaculty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newFaculty: Faculty = {
      id: editingFaculty?.id || Date.now().toString(),
      ...formData,
      expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
      createdAt: editingFaculty?.createdAt || new Date().toISOString()
    };

    let updatedFaculty;
    if (editingFaculty) {
      updatedFaculty = faculty.map(f => f.id === editingFaculty.id ? newFaculty : f);
      toast.success('Faculty updated successfully');
    } else {
      updatedFaculty = [...faculty, newFaculty];
      toast.success('Faculty added successfully');
    }

    saveFaculty(updatedFaculty);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (facultyMember: Faculty) => {
    setEditingFaculty(facultyMember);
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      department: facultyMember.department,
      designation: facultyMember.designation,
      expertise: facultyMember.expertise.join(', '),
      maxHoursPerWeek: facultyMember.maxHoursPerWeek,
      preferredTimeSlots: facultyMember.preferredTimeSlots,
      unavailableSlots: facultyMember.unavailableSlots,
      canTeachPrograms: facultyMember.canTeachPrograms,
      phone: facultyMember.phone
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      const updatedFaculty = faculty.filter(f => f.id !== id);
      saveFaculty(updatedFaculty);
      toast.success('Faculty deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      expertise: '',
      maxHoursPerWeek: 20,
      preferredTimeSlots: [],
      unavailableSlots: [],
      canTeachPrograms: [],
      phone: ''
    });
    setEditingFaculty(null);
  };

  const handleTimeSlotChange = (slot: string, type: 'preferred' | 'unavailable') => {
    const field = type === 'preferred' ? 'preferredTimeSlots' : 'unavailableSlots';
    const currentSlots = formData[field];
    
    if (currentSlots.includes(slot)) {
      setFormData({
        ...formData,
        [field]: currentSlots.filter(s => s !== slot)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentSlots, slot]
      });
    }
  };

  const handleProgramChange = (programId: string) => {
    const currentPrograms = formData.canTeachPrograms;
    
    if (currentPrograms.includes(programId)) {
      setFormData({
        ...formData,
        canTeachPrograms: currentPrograms.filter(p => p !== programId)
      });
    } else {
      setFormData({
        ...formData,
        canTeachPrograms: [...currentPrograms, programId]
      });
    }
  };

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? `${program.name} (${program.type})` : 'Unknown Program';
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
              <h1 className="text-3xl font-bold">Faculty Management</h1>
              <p className="text-muted-foreground">Manage faculty profiles and availability</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                </DialogTitle>
                <DialogDescription>
                  Configure faculty profile and teaching preferences
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Dr. John Smith"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john.smith@college.edu"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder="Education"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Select value={formData.designation} onValueChange={(value) => setFormData({...formData, designation: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                          <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                          <SelectItem value="Lecturer">Lecturer</SelectItem>
                          <SelectItem value="Guest Faculty">Guest Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>

                {/* Expertise and Programs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Teaching Profile</h3>
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise (comma-separated)</Label>
                    <Textarea
                      id="expertise"
                      value={formData.expertise}
                      onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                      placeholder="Educational Psychology, Curriculum Development, Assessment"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxHours">Maximum Hours per Week</Label>
                    <Input
                      id="maxHours"
                      type="number"
                      value={formData.maxHoursPerWeek}
                      onChange={(e) => setFormData({...formData, maxHoursPerWeek: parseInt(e.target.value)})}
                      min="1"
                      max="40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Can Teach Programs</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {programs.map((program) => (
                        <div key={program.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`program-${program.id}`}
                            checked={formData.canTeachPrograms.includes(program.id)}
                            onCheckedChange={() => handleProgramChange(program.id)}
                          />
                          <Label htmlFor={`program-${program.id}`} className="text-sm">
                            {program.name} ({program.type})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Time Preferences</h3>
                  
                  <div className="space-y-2">
                    <Label>Preferred Time Slots</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pref-${slot}`}
                            checked={formData.preferredTimeSlots.includes(slot)}
                            onCheckedChange={() => handleTimeSlotChange(slot, 'preferred')}
                          />
                          <Label htmlFor={`pref-${slot}`} className="text-sm">
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Unavailable Time Slots</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox
                            id={`unavail-${slot}`}
                            checked={formData.unavailableSlots.includes(slot)}
                            onCheckedChange={() => handleTimeSlotChange(slot, 'unavailable')}
                          />
                          <Label htmlFor={`unavail-${slot}`} className="text-sm">
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Faculty</p>
                  <p className="text-2xl font-bold">{faculty.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Avg Hours/Week</p>
                  <p className="text-2xl font-bold">
                    {faculty.length > 0 
                      ? Math.round(faculty.reduce((sum, f) => sum + f.maxHoursPerWeek, 0) / faculty.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Professors</p>
                  <p className="text-2xl font-bold">
                    {faculty.filter(f => f.designation === 'Professor').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Asst. Professors</p>
                  <p className="text-2xl font-bold">
                    {faculty.filter(f => f.designation === 'Assistant Professor').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Faculty Table */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Directory</CardTitle>
            <CardDescription>
              Manage faculty profiles and teaching assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {faculty.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No faculty found. Add your first faculty member to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Max Hours/Week</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculty.map((facultyMember) => (
                    <TableRow key={facultyMember.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{facultyMember.name}</div>
                          <div className="text-sm text-muted-foreground">{facultyMember.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{facultyMember.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{facultyMember.designation}</Badge>
                      </TableCell>
                      <TableCell>{facultyMember.maxHoursPerWeek}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {facultyMember.canTeachPrograms.slice(0, 2).map((programId) => (
                            <Badge key={programId} variant="secondary" className="text-xs">
                              {getProgramName(programId).split(' ')[0]}
                            </Badge>
                          ))}
                          {facultyMember.canTeachPrograms.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{facultyMember.canTeachPrograms.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {facultyMember.expertise.slice(0, 2).join(', ')}
                          {facultyMember.expertise.length > 2 && '...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(facultyMember)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(facultyMember.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}