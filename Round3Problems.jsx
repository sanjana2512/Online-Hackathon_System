import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { styles } from '../styles'; // --- 1. IMPORT STYLES ---
import TestHeader from './TestHeader'; // --- 2. IMPORT HEADER ---

const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

// --- 3. REUSABLE CARD (RESTYLED FOR DARK THEME) ---
const Card = ({ children, className = '', hoverEffect = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    whileHover={hoverEffect ? { y: -5 } : {}} // Use 'y' lift
    transition={{ duration: 0.35 }}
    // Updated Tailwind classes for the dark theme
    className={`
      rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out
      bg-[#0a192f] border border-[#334155] text-[#94a3b8]
      ${hoverEffect ? 'hover:shadow-xl hover:border-[#f59e0b]' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
);

function Round3Problems() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // To check qualification

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/problems`);
        
        // Group problems by topic
        const grouped = res.data.reduce((acc, problem) => {
          (acc[problem.topic] = acc[problem.topic] || []).push(problem);
          return acc;
        }, {});
        
        setProblems(grouped);
        
      } catch (err) {
        console.error("Error fetching R3 problems:", err);
        setError(err.response?.data?.msg || 'Could not load Round 3 problems. Make sure you are qualified and Round 3 is active.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []); // Run once on component mount

  // --- 4. ADD LAYOUT TO LOADING STATE ---
  if (isLoading) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader title="Round 3: Problems" />
        <div style={styles.startTestContainer}>
          Loading Round 3 Problems...
        </div>
      </div>
    );
  }

  // --- 5. ADD LAYOUT TO ERROR STATE ---
  if (error) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader title="Round 3: Problems" />
        <div style={styles.startTestContainer}>
          <p style={{color: styles.startTestWarning.color}}>{error}</p>
        </div>
      </div>
    );
  }

  // --- 6. ADD LAYOUT TO MAIN RETURN ---
  return (
    <div style={styles.quizContainer}>
      <TestHeader title="Round 3: Problems" />
      
      {/* This new div creates a scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', background: styles.questionArea.background }} className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* --- 7. RESTYLE CONTENT WITH THEME COLORS --- */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f59e0b] mb-4 text-center">Round 3: Problem Statements</h1>
            <p className="text-xl text-[#94a3b8] text-center mb-12">
              Welcome, Team {user?.teamName}. Choose a topic and problem statement for the final round.
            </p>
          </motion.div>

          {/* Loop through each Topic */}
          {Object.keys(problems).length > 0 ? (
            Object.keys(problems).map(topic => (
              <div key={topic} className="mb-12">
                <h2 className="text-3xl font-semibold text-[#e2e8f0] mb-6 border-b-2 border-[#f59e0b] pb-2">
                  Topic: {topic}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Loop through each problem in that topic */}
                  {problems[topic].map(problem => (
                    <Card key={problem.problemId} className="flex flex-col">
                      <h3 className="text-2xl font-bold text-[#f59e0b] mb-3">
                        {problem.title}
                      </h3>
                      <p className="text-[#94a3b8] leading-relaxed whitespace-pre-wrap mb-4 flex-grow">
                        {problem.description}
                      </p>
                      
                      {problem.resources && problem.resources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#334155]">
                          <h4 className="font-semibold text-[#e2e8f0] mb-2">Resources:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {problem.resources.map((link, index) => (
                              <li key={index}>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#f59e0b] hover:underline">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[#94a3b8] py-10">No problem statements have been added for Round 3 yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Round3Problems;