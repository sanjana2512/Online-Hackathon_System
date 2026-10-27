import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { TestProvider } from './TestContext';
import { AuthProvider } from './AuthContext';
import { Round2TestProvider } from './Round2TestContext'; 

// --- Round 1 Components ---
import TestLayout from './components/TestLayout';
import QuestionDisplay from './components/QuestionDisplay';
import Results from './components/Results';
import StartTest from './components/StartTest';
import TimesUp from './components/TimesUp';

// --- Shared Components ---
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminRoute from './components/AdminRoute';       
import AdminDashboard from './components/AdminDashboard'; 

// --- Round 2 Components ---
import StartRound2 from './components/StartRound2';
import Round2Layout from './components/Round2Layout';
import Round2QuestionDisplay from './components/Round2QuestionDisplay';
import Round2Results from './components/Round2Results';
import Round2TimesUp from './components/Round2TimesUp';

// --- ★★★ 1. IMPORT THE NEW R3 COMPONENT ★★★ ---
import Round3Problems from './components/Round3Problems';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TestProvider>
          <Round2TestProvider>
            <Routes>
              {/* --- Public Route --- */}
              <Route path="/" element={<HomePage />} />

              {/* --- Protected Routes (Login Required) --- */}
              <Route element={<ProtectedRoute />}>
                
                {/* --- ROUND 1 ROUTES (Unchanged) --- */}
                <Route path="/start-test" element={<StartTest />} />
                <Route path="/test" element={<TestLayout />}>
                  <Route path="question/:questionId" element={<QuestionDisplay />} />
                  <Route index element={<Navigate to="question/1" replace />} />
                </Route>
                <Route path="/results" element={<Results />} />
                
                {/* --- ROUND 2 ROUTES (Unchanged) --- */}
                <Route path="/round2/start" element={<StartRound2 />} /> 
                <Route path="/round2/test" element={<Round2Layout />}> 
                  <Route path="question/:questionId" element={<Round2QuestionDisplay />} />
                  <Route index element={<Navigate to="question/11" replace />} />
                </Route>
                <Route path="/round2/results" element={<Round2Results />} />
                <Route path="/round2/times-up" element={<Round2TimesUp />} />
                
                {/* --- ★★★ 2. ADD NEW ROUND 3 ROUTE ★★★ --- */}
                <Route path="/round3/problems" element={<Round3Problems />} />
                
                {/* --- END R3 ROUTE --- */}


                {/* --- Admin Route (Login AND Admin Required) --- */}
                <Route element={<AdminRoute />}>
                   <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>

              {/* --- Other Routes (Public, like TimesUp) --- */}
              <Route path="/times-up" element={<TimesUp />} />

              {/* Catch-all for unknown routes, redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Round2TestProvider>
        </TestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;