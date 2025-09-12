import { useParams, Navigate } from 'react-router-dom';

// Component to redirect legacy routes to new user-scoped routes
export const LegacyJobApplicationRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/user/apply/${id}`} replace />;
};

export const LegacyApplyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/user/apply/${id}`} replace />;
};