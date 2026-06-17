import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const links = {
  admin: [
    ['Overview', '/admin'],
    ['Users', '/admin/users'],
    ['Courses', '/admin/courses'],
    ['USSD Simulator', '/admin/ussd'],
    ['Badges & Rewards', '/admin/badges'],
    ['SMS Log', '/admin/sms'],
  ],
  teacher: [
    ['Overview', '/teacher'],
    ['My Courses', '/teacher/courses'],
    ['Create Course', '/teacher/courses/create'],
  ],
  student: [
    ['Overview', '/student'],
    ['My Courses', '/student/courses'],
  ],
};

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div className="dashboard-shell">
        <aside className="sidebar">
          <h6 className="text-uppercase text-white-50 mb-3" style={{ fontSize: '0.75rem' }}>{user?.role} menu</h6>
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
