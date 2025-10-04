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
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Program {
  id: string;
  name: string;
  type: 'B.Ed' | 'M.Ed' | 'FYUP' | 'ITEP';
  duration: number;
  totalCredits: number;
  majorCredits: number;
  minorCredits: number;
  skillCredits: number;
  aeCredits: number; // Ability Enhancement
  valueAddedCredits: number;
  description: string;
  createdAt: string;
}

export default function ProgramManagement() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as Program['type'],
    duration: 4,
    totalCredits: 120,
    majorCredits: 60,
    minorCredits: 30,
    skillCredits: 12,
    aeCredits: 8,
    valueAddedCredits: 10,
    description: ''
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = () => {
    const savedPrograms = localStorage.getItem('programs');
    if (savedPrograms) {
      setPrograms(JSON.parse(savedPrograms));
    }
  };

  const savePrograms = (updatedPrograms: Program[]) => {
    localStorage.setItem('programs', JSON.stringify(updatedPrograms));
    setPrograms(updatedPrograms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProgram: Program = {
      id: editingProgram?.id || Date.now().toString(),
      ...formData,
      createdAt: editingProgram?.createdAt || new Date().toISOString()
    };

    let updatedPrograms;
    if (editingProgram) {
      updatedPrograms = programs.map(p => p.id === editingProgram.id ? newProgram : p);
      toast.success('Program updated successfully');
    } else {
      updatedPrograms = [...programs, newProgram];
      toast.success('Program created successfully');
    }

    savePrograms(updatedPrograms);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      type: program.type,
      duration: program.duration,
      totalCredits: program.totalCredits,
      majorCredits: program.majorCredits,
      minorCredits: program.minorCredits,
      skillCredits: program.skillCredits,
      aeCredits: program.aeCredits,
      valueAddedCredits: program.valueAddedCredits,
      description: program.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      const updatedPrograms = programs.filter(p => p.id !== id);
      savePrograms(updatedPrograms);
      toast.success('Program deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as Program['type'],
      duration: 4,
      totalCredits: 120,
      majorCredits: 60,
      minorCredits: 30,
      skillCredits: 12,
      aeCredits: 8,
      valueAddedCredits: 10,
      description: ''
    });
    setEditingProgram(null);
  };

  const getProgramTypeColor = (type: string) => {
    const colors = {
      'B.Ed': 'bg-blue-100 text-blue-800',
      'M.Ed': 'bg-green-100 text-green-800',
      'FYUP': 'bg-purple-100 text-purple-800',
      'ITEP': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
              <h1 className="text-3xl font-bold">Program Management</h1>
              <p className="text-muted-foreground">Manage educational programs under NEP 2020</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProgram ? 'Edit Program' : 'Add New Program'}
                </DialogTitle>
                <DialogDescription>
                  Configure program structure according to NEP 2020 guidelines
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Program Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Bachelor of Education"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Program Type *</Label>
                    <Select value={formData.type} onValueChange={(value: Program['type']) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Ed">B.Ed (Bachelor of Education)</SelectItem>
                        <SelectItem value="M.Ed">M.Ed (Master of Education)</SelectItem>
                        <SelectItem value="FYUP">FYUP (Four Year Undergraduate)</SelectItem>
                        <SelectItem value="ITEP">ITEP (Integrated Teacher Education)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Years)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      min="1"
                      max="6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="totalCredits">Total Credits</Label>
                    <Input
                      id="totalCredits"
                      type="number"
                      value={formData.totalCredits}
                      onChange={(e) => setFormData({...formData, totalCredits: parseInt(e.target.value)})}
                      min="60"
                      max="200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="majorCredits">Major Credits</Label>
                    <Input
                      id="majorCredits"
                      type="number"
                      value={formData.majorCredits}
                      onChange={(e) => setFormData({...formData, majorCredits: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minorCredits">Minor Credits</Label>
                    <Input
                      id="minorCredits"
                      type="number"
                      value={formData.minorCredits}
                      onChange={(e) => setFormData({...formData, minorCredits: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skillCredits">Skill Credits</Label>
                    <Input
                      id="skillCredits"
                      type="number"
                      value={formData.skillCredits}
                      onChange={(e) => setFormData({...formData, skillCredits: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aeCredits">AE Credits</Label>
                    <Input
                      id="aeCredits"
                      type="number"
                      value={formData.aeCredits}
                      onChange={(e) => setFormData({...formData, aeCredits: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valueAddedCredits">Value-Added</Label>
                    <Input
                      id="valueAddedCredits"
                      type="number"
                      value={formData.valueAddedCredits}
                      onChange={(e) => setFormData({...formData, valueAddedCredits: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Program description and objectives"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProgram ? 'Update Program' : 'Create Program'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Programs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Educational Programs</CardTitle>
            <CardDescription>
              Manage all programs following NEP 2020 structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No programs found. Add your first program to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Total Credits</TableHead>
                    <TableHead>Credit Distribution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>
                        <Badge className={getProgramTypeColor(program.type)}>
                          {program.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{program.duration} years</TableCell>
                      <TableCell>{program.totalCredits}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>Major: {program.majorCredits}</div>
                          <div>Minor: {program.minorCredits}</div>
                          <div>Skill: {program.skillCredits}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(program.id)}
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