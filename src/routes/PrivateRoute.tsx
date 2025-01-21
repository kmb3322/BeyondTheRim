// src/routes/PrivateRoute.tsx
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

type PrivateRouteProps = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // 로딩중이면 아무것도 표시 안함 (또는 스피너)
    return <div>Loading...</div>;
  }

  if (!user) {
    // 로그인 안 되었으면 로그인 페이지로
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
