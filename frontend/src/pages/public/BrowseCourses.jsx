import { useCallback, useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getCategories, getCourses } from '../../services/courseService';
import { enrollInCourse } from '../../services/enrollmentService';

export default function BrowseCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', level: '', page: '1' });
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const response = await getCourses(filters);
    setCourses(response.data.data || response.data);
    setTotal(response.data.total || 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    getCategories().then((response) => setCategories(response.data));
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  async function handleSearch(event) {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, page: '1' }));
    await loadCourses();
  }

  async function handleEnroll(courseId) {
    setEnrolling(courseId);
    setError('');
    setMessage('');
    try {
      await enrollInCourse(courseId);
      setMessage('Enrollment successful. Open your student dashboard to begin learning.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not enroll in course.');
    } finally {
      setEnrolling(null);
    }
  }

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="page-shell">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Browse courses</h1>
        <span className="text-muted">{total} courses</span>
      </div>
      <form className="content-panel mb-3" onSubmit={handleSearch}>
        <div className="row g-2">
          <div className="col-md-5">
            <input className="form-control" placeholder="Search by title or topic" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}>
              <option value="">All levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
          </div>
        </div>
      </form>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="row g-3">
            {courses.map((course) => (
              <div className="col-md-6 col-lg-4" key={course.id}>
                <CourseCard course={course} onEnroll={user?.role === 'student' ? handleEnroll : null} enrolling={enrolling} />
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`btn btn-sm ${filters.page === String(i + 1) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilters((prev) => ({ ...prev, page: String(i + 1) }))}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
