// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import IntroVideoPage from './pages/IntroVideoPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ResultPage from './pages/ResultPage';
import UploadPage from './pages/UploadPage';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroVideoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/main"
        element={
          <PrivateRoute>
            <MainPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <UploadPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/result"
        element={
          <PrivateRoute>
            <ResultPage />
          </PrivateRoute>
        }
      />
      
    </Routes>
  );
}

export default App;
