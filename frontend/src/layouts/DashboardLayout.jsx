import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const links = {
  teacher: [
    ['Overview', '/teacher'],
    ['My Courses', '/teacher/courses'],
    ['Create Course', '/teacher/courses/create'],
    ['Create Assignment', '/teacher/assignments/create'],
    ['Submissions', '/teacher/submissions'],
    ['Subscription', '/subscription'],
    ['Profile', '/profile']
  ],
  student: [
    ['Overview', '/student'],
    ['My Courses', '/student/courses'],
    ['Quizzes', '/student/quizzes'],
    ['Assignments', '/student/assignments'],
    ['Grades', '/student/grades'],
    ['Subscription', '/subscription'],
    ['Profile', '/profile']
  ],
  admin: [
    ['Overview', '/admin'],
    ['Users', '/admin/users'],
    ['Courses', '/admin/courses'],
    ['Categories', '/admin/categories'],
    ['Subscriptions', '/admin/subscriptions'],
    ['Profile', '/profile']
  ],
  parent: [
    ['Overview', '/parent'],
    ['Link Child', '/parent#link'],
    ['Activity Log', '/parent#activity'],
    ['Subscription', '/subscription'],
    ['Profile', '/profile']
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
            <NavLink key={label} to={to} end={to.split('/').length === 2 && !to.includes('#')}>{label}</NavLink>
          ))}
        </aside>
        <main className="page-shell w-100">
          <Outlet />
        </main>
      </div>
    </>
  );
}
