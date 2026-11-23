import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="loader loader-page">
      <h1>Page not found</h1>
      <p className="muted-text">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-md">
        Go to your dashboard
      </Link>
    </div>
  );
}
