import "./App.css";
import "./themes.css";

import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { Loader } from './components/Loader';
import { Layout } from './layout';
import { Settings } from './screens/Settings';
import { Themes } from "./components/themes";
import { ThemesProvider } from "./context/themeContext";

function App() {
  return (
    <div className="min-h-screen bg-bgMain text-textMain">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <ThemesProvider>
            <AuthApp />
          </ThemesProvider>
        </Suspense>
      </RecoilRoot>
    </div>
  );
}

function AuthApp() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<Layout><Landing /></Layout>} 
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/game/:gameId"
          element={<Layout><Game /></Layout>}
        />
        <Route 
          path='/settings' 
          element={<Layout><Settings /></Layout>} 
        >
          <Route path="themes" element={<Themes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
