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
import { Plus, Edit, Trash2, ArrowLeft, Building, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  type: 'Classroom' | 'Laboratory' | 'Seminar Hall' | 'Auditorium' | 'Library' | 'Computer Lab';
  capacity: number;
  location: string;
  equipment: string[];
  availableSlots: string[];
  unavailableSlots: string[];
  isAccessible: boolean;
  hasProjector: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  description: string;
  createdAt: string;
}

const timeSlots = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

const equipmentOptions = [
  'Whiteboard', 'Blackboard', 'Smart Board', 'Projector', 'Computer', 
  'Laboratory Equipment', 'Audio System', 'Video Conferencing', 'Microscopes'
];

export default function InfrastructureManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as Room['type'],
    capacity: 30,
    location: '',
    equipment: [] as string[],
    availableSlots: timeSlots,
    unavailableSlots: [] as string[],
    isAccessible: true,
    hasProjector: false,
    hasAC: false,
    hasWifi: true,
    description: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    const savedRooms = localStorage.getItem('rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  };

  const saveRooms = (updatedRooms: Room[]) => {
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    setRooms(updatedRooms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newRoom: Room = {
      id: editingRoom?.id || Date.now().toString(),
      ...formData,
      createdAt: editingRoom?.createdAt || new Date().toISOString()
    };

    let updatedRooms;
    if (editingRoom) {
      updatedRooms = rooms.map(r => r.id === editingRoom.id ? newRoom : r);
      toast.success('Room updated successfully');
    } else {
      updatedRooms = [...rooms, newRoom];
      toast.success('Room added successfully');
    }

    saveRooms(updatedRooms);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      location: room.location,
      equipment: room.equipment,
      availableSlots: room.availableSlots,
      unavailableSlots: room.unavailableSlots,
      isAccessible: room.isAccessible,
      hasProjector: room.hasProjector,
      hasAC: room.hasAC,
      hasWifi: room.hasWifi,
      description: room.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter(r => r.id !== id);
      saveRooms(updatedRooms);
      toast.success('Room deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as Room['type'],
      capacity: 30,
      location: '',
      equipment: [],
      availableSlots: timeSlots,
      unavailableSlots: [],
      isAccessible: true,
      hasProjector: false,
      hasAC: false,
      hasWifi: true,
      description: ''
    });
    setEditingRoom(null);
  };

  const handleEquipmentChange = (equipment: string) => {
    const currentEquipment = formData.equipment;
    
    if (currentEquipment.includes(equipment)) {
      setFormData({
        ...formData,
        equipment: currentEquipment.filter(e => e !== equipment)
      });
    } else {
      setFormData({
        ...formData,
        equipment: [...currentEquipment, equipment]
      });
    }
  };

  const handleTimeSlotChange = (slot: string, type: 'available' | 'unavailable') => {
    const field = type === 'available' ? 'availableSlots' : 'unavailableSlots';
    const otherField = type === 'available' ? 'unavailableSlots' : 'availableSlots';
    const currentSlots = formData[field];
    const otherSlots = formData[otherField];
    
    if (currentSlots.includes(slot)) {
      setFormData({
        ...formData,
        [field]: currentSlots.filter(s => s !== slot)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentSlots, slot],
        [otherField]: otherSlots.filter(s => s !== slot)
      });
    }
  };

  const getRoomTypeColor = (type: string) => {
    const colors = {
      'Classroom': 'bg-blue-100 text-blue-800',
      'Laboratory': 'bg-green-100 text-green-800',
      'Seminar Hall': 'bg-purple-100 text-purple-800',
      'Auditorium': 'bg-orange-100 text-orange-800',
      'Library': 'bg-pink-100 text-pink-800',
      'Computer Lab': 'bg-cyan-100 text-cyan-800'
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
              <h1 className="text-3xl font-bold">Infrastructure Management</h1>
              <p className="text-muted-foreground">Manage rooms, labs, and facilities</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </DialogTitle>
                <DialogDescription>
                  Configure room details and availability
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Room Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Room 101"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Room Type *</Label>
                      <Select value={formData.type} onValueChange={(value: Room['type']) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Classroom">Classroom</SelectItem>
                          <SelectItem value="Laboratory">Laboratory</SelectItem>
                          <SelectItem value="Seminar Hall">Seminar Hall</SelectItem>
                          <SelectItem value="Auditorium">Auditorium</SelectItem>
                          <SelectItem value="Library">Library</SelectItem>
                          <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                        min="1"
                        max="500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Ground Floor, Block A"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Facilities</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasProjector"
                        checked={formData.hasProjector}
                        onCheckedChange={(checked) => setFormData({...formData, hasProjector: checked as boolean})}
                      />
                      <Label htmlFor="hasProjector">Projector</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasAC"
                        checked={formData.hasAC}
                        onCheckedChange={(checked) => setFormData({...formData, hasAC: checked as boolean})}
                      />
                      <Label htmlFor="hasAC">Air Conditioning</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWifi"
                        checked={formData.hasWifi}
                        onCheckedChange={(checked) => setFormData({...formData, hasWifi: checked as boolean})}
                      />
                      <Label htmlFor="hasWifi">WiFi</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAccessible"
                        checked={formData.isAccessible}
                        onCheckedChange={(checked) => setFormData({...formData, isAccessible: checked as boolean})}
                      />
                      <Label htmlFor="isAccessible">Accessible</Label>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Equipment</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${equipment}`}
                          checked={formData.equipment.includes(equipment)}
                          onCheckedChange={() => handleEquipmentChange(equipment)}
                        />
                        <Label htmlFor={`equipment-${equipment}`} className="text-sm">
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Availability</h3>
                  
                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox
                            id={`avail-${slot}`}
                            checked={formData.availableSlots.includes(slot)}
                            onCheckedChange={() => handleTimeSlotChange(slot, 'available')}
                          />
                          <Label htmlFor={`avail-${slot}`} className="text-sm">
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional room details and notes"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRoom ? 'Update Room' : 'Add Room'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {['Classroom', 'Laboratory', 'Seminar Hall', 'Auditorium', 'Library', 'Computer Lab'].map((type) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{type}</p>
                    <p className="text-2xl font-bold">
                      {rooms.filter(r => r.type === type).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Inventory</CardTitle>
            <CardDescription>
              Manage all rooms and facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No rooms found. Add your first room to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Facilities</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
                        <Badge className={getRoomTypeColor(room.type)}>
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{room.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.hasProjector && <Badge variant="outline" className="text-xs">Projector</Badge>}
                          {room.hasAC && <Badge variant="outline" className="text-xs">AC</Badge>}
                          {room.hasWifi && <Badge variant="outline" className="text-xs">WiFi</Badge>}
                          {room.isAccessible && <Badge variant="outline" className="text-xs">Accessible</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {room.equipment.slice(0, 2).join(', ')}
                          {room.equipment.length > 2 && '...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(room)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(room.id)}
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