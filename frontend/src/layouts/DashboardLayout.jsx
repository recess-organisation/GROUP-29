import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const links = {
  teacher: [
    ['Overview', '/teacher'],
    ['My Courses', '/teacher/courses'],
    ['Create Course', '/teacher/courses/create'],
    ['Create Assignment', '/teacher/assignments/create'],
    ['Submissions', '/teacher/submissions']
  ],
  student: [
    ['Overview', '/student'],
    ['My Courses', '/student/courses'],
    ['Quizzes', '/student/quizzes'],
    ['Assignments', '/student/assignments'],
    ['Grades', '/student/grades']
  ],
  admin: [
    ['Overview', '/admin'],
    ['Users', '/admin/users'],
    ['Courses', '/admin/courses'],
    ['Categories', '/admin/categories']
  ],
  parent: [
    ['Overview', '/parent'],
    ['Link Child', '/parent'],
    ['Activity Log', '/parent']
  ]
};

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="dashboard-shell">
        <aside className="sidebar">
          <h6>{user?.role} menu</h6>
          {(links[user?.role] || []).map(([label, to]) => (
            <NavLink key={to} to={to} end={to.split('/').length === 2}>{label}</NavLink>
          ))}
        </aside>
        <main className="page-shell w-100">
          <Outlet />
        </main>
      </div>
    </>
  );
}
