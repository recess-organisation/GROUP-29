import { uploadsBaseUrl } from '../services/api';

export default function LessonList({ lessons }) {
  if (!lessons.length) {
    return <p className="text-muted mb-0">No lessons have been added yet.</p>;
  }

  return (
    <div className="list-group">
      {lessons.map((lesson) => (
        <div className="list-group-item" key={lesson.id}>
          <div className="d-flex justify-content-between">
            <h6 className="mb-1">{lesson.lesson_order}. {lesson.title}</h6>
            <span className="badge text-bg-light">{lesson.status}</span>
          </div>
          <p className="mb-2 text-muted">{lesson.content}</p>
          {lesson.materials?.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {lesson.materials.map((material) => (
                <a className="btn btn-outline-secondary btn-sm" href={`${uploadsBaseUrl}/${material.file_path}`} key={material.id} target="_blank" rel="noreferrer">
                  Download {material.file_name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
