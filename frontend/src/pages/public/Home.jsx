import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourses } from '../../services/courseService';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((response) => setCourses(response.data.data?.slice(0, 3) || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero-band">
        <div className="container">
          <div className="col-lg-7">
            <span className="badge text-bg-light mb-3">Adaptive learning platform</span>
            <h1 className="display-4 fw-bold">UG Scholar</h1>
            <p className="lead">An adaptive learning platform that personalizes your educational journey with smart course recommendations and progress tracking.</p>
            <div className="d-flex gap-2">
              <Link className="btn btn-light" to="/courses">Browse courses</Link>
              <Link className="btn btn-outline-light" to="/register">Create account</Link>
            </div>
          </div>
        </div>
      </section>
      <main className="page-shell">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Featured courses</h2>
          <Link to="/courses">View all</Link>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="row g-3">
            {courses.map((course) => (
              <div className="col-md-4" key={course.id}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
