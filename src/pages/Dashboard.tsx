import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, BookOpen, Building, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalPrograms: number;
  totalCourses: number;
  totalFaculty: number;
  totalRooms: number;
  activeTimetables: number;
  conflicts: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalCourses: 0,
    totalFaculty: 0,
    totalRooms: 0,
    activeTimetables: 0,
    conflicts: 0
  });

  useEffect(() => {
    // Load statistics from localStorage
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const timetables = JSON.parse(localStorage.getItem('timetables') || '[]');

    setStats({
      totalPrograms: programs.length,
      totalCourses: courses.length,
      totalFaculty: faculty.length,
      totalRooms: rooms.length,
      activeTimetables: timetables.length,
      conflicts: 0 // Will be calculated by conflict detection algorithm
    });
  }, []);

  const quickActions = [
    {
      title: 'Program Management',
      description: 'Manage B.Ed., M.Ed., FYUP, and ITEP programs',
      icon: BookOpen,
      path: '/programs',
      color: 'bg-blue-500'
    },
    {
      title: 'Course Management',
      description: 'Handle Major, Minor, Skill-based courses',
      icon: Calendar,
      path: '/courses',
      color: 'bg-green-500'
    },
    {
      title: 'Faculty Management',
      description: 'Manage faculty profiles and availability',
      icon: Users,
      path: '/faculty',
      color: 'bg-purple-500'
    },
    {
      title: 'Infrastructure',
      description: 'Manage rooms, labs, and facilities',
      icon: Building,
      path: '/infrastructure',
      color: 'bg-orange-500'
    },
    {
      title: 'Generate Timetable',
      description: 'AI-assisted timetable generation',
      icon: Clock,
      path: '/timetable',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img 
              src="Schedulify Logo.png" 
              alt="Schedulify Logo" 
              className="h-20 w-auto"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Schedulify: AI Timetable Generation System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Intelligent Academic Scheduling for Modern Education
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">B.Ed., M.Ed., FYUP, ITEP</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Major, Minor, Skill-based</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFaculty}</div>
              <p className="text-xs text-muted-foreground">Active teaching staff</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Infrastructure</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Classrooms & Labs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Timetables</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTimetables}</div>
              <p className="text-xs text-muted-foreground">Generated schedules</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.conflicts}</div>
              <p className="text-xs text-muted-foreground">Scheduling conflicts</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access key features of the timetable management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-md ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {action.description}
                  </p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <Badge variant="secondary">System</Badge>
                <span className="text-sm">Welcome to NEP 2020 Timetable Generator</span>
                <span className="text-xs text-muted-foreground ml-auto">Just now</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <Badge variant="secondary">Info</Badge>
                <span className="text-sm">Start by adding your programs and courses</span>
                <span className="text-xs text-muted-foreground ml-auto">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}