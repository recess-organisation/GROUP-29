import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import UssdSimulator from './pages/admin/UssdSimulator';
import BadgesAndRewards from './pages/admin/BadgesAndRewards';
import SmsLog from './pages/admin/SmsLog';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';
import ManageLessons from './pages/teacher/ManageLessons';
import TeacherStudents from './pages/teacher/TeacherStudents';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseLessons from './pages/student/CourseLessons';
import ParentDashboard from './pages/parent/ParentDashboard';
import MyChildren from './pages/parent/MyChildren';
import ChildProgress from './pages/parent/ChildProgress';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="ussd" element={<UssdSimulator />} />
              <Route path="badges" element={<BadgesAndRewards />} />
              <Route path="sms" element={<SmsLog />} />
            </Route>
          </Route>
          <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<DashboardLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/:id/edit" element={<EditCourse />} />
              <Route path="courses/:id/lessons" element={<ManageLessons />} />
              <Route path="students" element={<TeacherStudents />} />
            </Route>
          </Route>
          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="courses/:id/lessons" element={<CourseLessons />} />
            </Route>
          </Route>
          <Route element={<RoleBasedRoute allowedRoles={['parent']} />}>
            <Route path="/parent" element={<DashboardLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="children" element={<MyChildren />} />
              <Route path="children/:id" element={<ChildProgress />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
