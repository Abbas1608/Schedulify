import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProgramManagement from './pages/ProgramManagement';
import CourseManagement from './pages/CourseManagement';
import FacultyManagement from './pages/FacultyManagement';
import InfrastructureManagement from './pages/InfrastructureManagement';
import TimetableGenerator from './pages/TimetableGenerator';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/programs" element={<ProgramManagement />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/faculty" element={<FacultyManagement />} />
          <Route path="/infrastructure" element={<InfrastructureManagement />} />
          <Route path="/timetable" element={<TimetableGenerator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;