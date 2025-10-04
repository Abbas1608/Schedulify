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
import { Plus, Edit, Trash2, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Course {
  id: string;
  code: string;
  name: string;
  type: 'Major' | 'Minor' | 'Skill-Based' | 'Ability Enhancement' | 'Value-Added';
  credits: number;
  theoryHours: number;
  practicalHours: number;
  semester: number;
  program: string;
  prerequisites: string[];
  description: string;
  isElective: boolean;
  createdAt: string;
}

interface Program {
  id: string;
  name: string;
  type: string;
}

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '' as Course['type'],
    credits: 4,
    theoryHours: 3,
    practicalHours: 1,
    semester: 1,
    program: '',
    prerequisites: '',
    description: '',
    isElective: false
  });

  useEffect(() => {
    loadCourses();
    loadPrograms();
  }, []);

  const loadCourses = () => {
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  };

  const loadPrograms = () => {
    const savedPrograms = localStorage.getItem('programs');
    if (savedPrograms) {
      setPrograms(JSON.parse(savedPrograms));
    }
  };

  const saveCourses = (updatedCourses: Course[]) => {
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.type || !formData.program) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCourse: Course = {
      id: editingCourse?.id || Date.now().toString(),
      ...formData,
      prerequisites: formData.prerequisites.split(',').map(p => p.trim()).filter(p => p),
      createdAt: editingCourse?.createdAt || new Date().toISOString()
    };

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(c => c.id === editingCourse.id ? newCourse : c);
      toast.success('Course updated successfully');
    } else {
      updatedCourses = [...courses, newCourse];
      toast.success('Course created successfully');
    }

    saveCourses(updatedCourses);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      type: course.type,
      credits: course.credits,
      theoryHours: course.theoryHours,
      practicalHours: course.practicalHours,
      semester: course.semester,
      program: course.program,
      prerequisites: course.prerequisites.join(', '),
      description: course.description,
      isElective: course.isElective
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(c => c.id !== id);
      saveCourses(updatedCourses);
      toast.success('Course deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: '' as Course['type'],
      credits: 4,
      theoryHours: 3,
      practicalHours: 1,
      semester: 1,
      program: '',
      prerequisites: '',
      description: '',
      isElective: false
    });
    setEditingCourse(null);
  };

  const getCourseTypeColor = (type: string) => {
    const colors = {
      'Major': 'bg-blue-100 text-blue-800',
      'Minor': 'bg-green-100 text-green-800',
      'Skill-Based': 'bg-purple-100 text-purple-800',
      'Ability Enhancement': 'bg-orange-100 text-orange-800',
      'Value-Added': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
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
              <h1 className="text-3xl font-bold">Course Management</h1>
              <p className="text-muted-foreground">Manage courses across all programs</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </DialogTitle>
                <DialogDescription>
                  Configure course details according to NEP 2020 structure
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g., EDU101"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Foundations of Education"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Course Type *</Label>
                    <Select value={formData.type} onValueChange={(value: Course['type']) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Minor">Minor</SelectItem>
                        <SelectItem value="Skill-Based">Skill-Based</SelectItem>
                        <SelectItem value="Ability Enhancement">Ability Enhancement</SelectItem>
                        <SelectItem value="Value-Added">Value-Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select value={formData.program} onValueChange={(value) => setFormData({...formData, program: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name} ({program.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                      min="1"
                      max="8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theoryHours">Theory Hours</Label>
                    <Input
                      id="theoryHours"
                      type="number"
                      value={formData.theoryHours}
                      onChange={(e) => setFormData({...formData, theoryHours: parseInt(e.target.value)})}
                      min="0"
                      max="6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="practicalHours">Practical Hours</Label>
                    <Input
                      id="practicalHours"
                      type="number"
                      value={formData.practicalHours}
                      onChange={(e) => setFormData({...formData, practicalHours: parseInt(e.target.value)})}
                      min="0"
                      max="6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                      min="1"
                      max="8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
                  <Input
                    id="prerequisites"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                    placeholder="e.g., EDU100, PSY101"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Course objectives and content overview"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isElective"
                    checked={formData.isElective}
                    onCheckedChange={(checked) => setFormData({...formData, isElective: checked as boolean})}
                  />
                  <Label htmlFor="isElective">This is an elective course</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Major', 'Minor', 'Skill-Based', 'Ability Enhancement', 'Value-Added'].map((type) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{type}</p>
                    <p className="text-2xl font-bold">
                      {courses.filter(c => c.type === type).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Course Catalog</CardTitle>
            <CardDescription>
              Manage all courses across different programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No courses found. Add your first course to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono">{course.code}</TableCell>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        <Badge className={getCourseTypeColor(course.type)}>
                          {course.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{getProgramName(course.program)}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell className="text-xs">
                        T: {course.theoryHours}<br />
                        P: {course.practicalHours}
                      </TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(course.id)}
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