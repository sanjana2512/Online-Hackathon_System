import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FAQItem from './FAQItem';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { FaTwitter, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';

/* ----------------------------
   Original Data & Constants
   (Unchanged)
   ---------------------------- */
const prizes = [
  { rank: "1st Prize", amount: "₹50,000", desc: "+ Certificate of Achievement" },
  { rank: "2nd Prize", amount: "₹40,000", desc: "+ Certificate of Achievement" },
  { rank: "3rd Prize", amount: "₹30,000", desc: "+ Certificate of Achievement" },
];

const rounds = [
  { title: "Round 1 (Online)", date: "January 2026 (Second Week)", desc: "Screening round with MCQs, aptitude, and basic coding questions." },
  { title: "Round 2 (Online)", date: "February 2026 (First week)", desc: "Problem statements based on coding and AI/ML application." },
  { title: "Round 3 (Offline at NIT Silchar)", date: "February 2026 (Last Week)", desc: "Final hackathon challenge with real-time problem-solving." },
];

const perks = [
  { title: "Free Accommodation", desc: "Provided to all final (offline) round participants." },
  { title: "Local Visit", desc: "Opportunity to explore local attractions in Silchar." },
  { title: "Gala Dinner", desc: "Engage with esteemed academicians and enjoy the Conference Gala Dinner." },
];

const faqs = [
  { q: "What is the team size?", a: "Participation is limited to teams of up to three (3) individuals. You can be from UG, PG, or PhD backgrounds." },
  { q: "Who can participate?", a: "Students from UG, PG, or PhD backgrounds are welcome to participate." },
  { q: "What is the registration fee?", a: "The registration fee is Rs. 2000 per team. Payment details are listed in the 'Registration' section." },
  { q: "Is accommodation provided?", a: "Yes, free accommodation will be provided to participants during the final (offline) round at NIT Silchar." },
  { q: "How many rounds are there?", a: "There are three rounds: Round 1 (Online Screening), Round 2 (Online Challenge), and Round 3 (Offline Final at NIT Silchar)." },
];

const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

/* ----------------------------
   Reusable Presentational Components
   (Unchanged)
   ----------------------------*/
const Section = ({ title, children, dark = false, className = '', id = '' }) => (
  <section
    id={id}
    className={`py-16 px-5 ${dark ? 'bg-[#0a1128]' : 'bg-[#0d1b3a]'} ${className}`}
  >
    <div className="max-w-6xl mx-auto">
      <h2 className={`text-3xl sm:text-4xl font-bold mb-12 text-center text-white`}>
        {title}
      </h2>
      {children}
    </div>
  </section>
);

const Card = ({ children, className = '', dark = false, hoverEffect = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    whileHover={hoverEffect ? { y: -5 } : {}}
    transition={{ duration: 0.35 }}
    className={`
      rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out
      bg-[#0a192f] border border-gray-700 text-gray-300
      ${hoverEffect ? 'hover:shadow-xl hover:border-[#f59e0b]' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// --- ★ 1. NEW: Hamburger Icon Component ---
const HamburgerIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

// --- ★ 2. NEW: Close Icon Component ---
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);


function HomePage() {
  const { isAuthenticated, user, logout, isLoading: isAuthLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // --- ★ 3. NEW: State for mobile menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [status, setStatus] = useState({
    // --- ★ FIX 1: Add round1Active to the initial state ---
    round1Active: false,
    resultsPublished: false,
    round2Active: false,
    round2ResultsPublished: false,
    round3Active: false
  });

  // R1 Results Modal
  const [showQualifiedList, setShowQualifiedList] = useState(false);
  const [qualifiedTeams, setQualifiedTeams] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState('');

  // R2 Results Modal
  const [showQualifiedListR3, setShowQualifiedListR3] = useState(false);
  const [qualifiedTeamsR3, setQualifiedTeamsR3] = useState([]);
  const [isLoadingResultsR3, setIsLoadingResultsR3] = useState(false);
  const [resultsErrorR3, setResultsErrorR3] = useState('');

  // Effect to prevent body scroll (Unchanged)
  useEffect(() => {
    const bodyStyle = document.body.style;
    const originalOverflow = bodyStyle.overflow;
    // --- ★ 4. UPDATE: Add isMenuOpen to scroll lock ---
    if (showLogin || showRegister || showQualifiedList || showQualifiedListR3 || isMenuOpen) {
      bodyStyle.overflow = 'hidden';
    } else {
      bodyStyle.overflow = originalOverflow;
    }
    return () => { bodyStyle.overflow = originalOverflow; };
  }, [showLogin, showRegister, showQualifiedList, showQualifiedListR3, isMenuOpen]); // Add isMenuOpen

  // Effect to check publish status periodically (Unchanged)
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const checkStatus = async () => {
      try {
        const [r1StatusRes, r2StatusRes, r2r3StatusRes] = await Promise.all([
          axios.get(`${API_URL}/public/publish-status`),
          axios.get(`${API_URL}/public/round2-status`),
          axios.get(`${API_URL}/public/status-r2-r3`)
        ]);

        if (isMounted) {
          setStatus({
            // --- ★ FIX 2: Set round1Active from the API response ---
            round1Active: r1StatusRes.data.round1Active || false,
            resultsPublished: r1StatusRes.data.resultsPublished || false,
            round2Active: r2StatusRes.data.round2Active || false,
            round2ResultsPublished: r2r3StatusRes.data.round2ResultsPublished || false,
            round3Active: r2r3StatusRes.data.round3Active || false
          });

          if (!r1StatusRes.data.resultsPublished && showQualifiedList) {
            setShowQualifiedList(false);
          }
          if (!r2r3StatusRes.data.round2ResultsPublished && showQualifiedListR3) {
            setShowQualifiedListR3(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking result publish status:", error);
        }
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 60000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showQualifiedList, showQualifiedListR3]);

  // Function to fetch and show R1 qualified teams (Unchanged)
  const fetchAndShowQualifiedTeams = async () => {
    if (!status.resultsPublished) {
      alert("Round 1 results are not published yet.");
      return;
    }
    setQualifiedTeams([]);
    setResultsError('');
    setIsLoadingResults(true);
    setShowQualifiedList(true);
    try {
      const res = await axios.get(`${API_URL}/public/qualified-teams`);
      if (res.data && Array.isArray(res.data.teams)) {
        setQualifiedTeams(res.data.teams);
        if (res.data.teams.length === 0) {
          setResultsError("Results are published, but no teams have been marked as qualified yet.");
        }
      } else {
        setResultsError("Could not load results due to unexpected server response.");
      }
    } catch (error) {
      setResultsError(error.response?.data?.msg || "Failed to fetch qualified teams.");
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Function to fetch R3 qualified teams (Unchanged)
  const fetchAndShowQualifiedTeamsR3 = async () => {
    if (!status.round2ResultsPublished) {
      alert("Round 2 results are not published yet.");
      return;
    }
    setQualifiedTeamsR3([]);
    setResultsErrorR3('');
    setIsLoadingResultsR3(true);
    setShowQualifiedListR3(true);
    try {
      const res = await axios.get(`${API_URL}/public/qualified-teams-r3`);
      if (res.data && Array.isArray(res.data.teams)) {
        setQualifiedTeamsR3(res.data.teams);
        if (res.data.teams.length === 0) {
          setResultsErrorR3("Results are published, but no teams have been marked as qualified for Round 3 yet.");
        }
      } else {
        setResultsErrorR3("Could not load results.");
      }
    } catch (error) {
      setResultsErrorR3(error.response?.data?.msg || "Failed to fetch qualified teams.");
    } finally {
      setIsLoadingResultsR3(false);
    }
  };

  // Loading state (Restyled)
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-lg bg-[#0a1128] text-gray-300">
        Loading Application...
      </div>
    );
  }

  // Handlers (Unchanged)
  const handleStartTestClick = () => {
    if (!isAuthenticated) setShowLogin(true);
  };

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  // Added fadeUp animation object
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

  // --- ★ 5. NEW: List of nav links for re-use ---
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Rounds", href: "#rounds" },
    { name: "Prizes", href: "#prizes" },
    { name: "Results", href: "#results" }, // Added Results link
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      {/* Main container restyled */}
      <div className="w-full flex flex-col min-h-screen bg-[#0a1128] text-gray-200 font-sans">

        {/* --- Header Bar (UPDATED) --- */}
        <header className="w-full px-5 md:px-8 py-5 bg-[#0a1128] border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span className="text-2xl font-extrabold text-white">
              NIT'S  Hackathon 2026
            </span>

            {/* --- 6. UPDATED: Desktop Navbar --- */}
            <nav className="hidden md:flex space-x-8 text-gray-300 font-medium">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-[#f59e0b] transition">
                  {link.name}
                </a>
              ))}
            </nav>
            {/* --- END OF NAVBAR --- */}

            {/* --- 7. UPDATED: Auth Buttons & Hamburger Toggle --- */}
            <div className="flex items-center space-x-3">
              {/* Auth Buttons (Desktop) */}
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated && user ? (
                  <>
                    <span className="text-gray-300 font-medium hidden sm:inline">{`Hi, ${user.name}`}</span>
                    {user.isAdmin && (
                      <Link to="/admin" className="px-4 py-2 text-[#f59e0b] bg-transparent border border-[#f59e0b] rounded-lg font-semibold hover:bg-amber-900/30 transition duration-200 text-sm">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogoutClick} className="px-4 py-2 text-gray-300 hover:text-[#f59e0b] transition duration-200 text-sm font-medium">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowLogin(true)} className="px-4 py-2 text-gray-300 hover:text-[#f59e0b] transition duration-200 text-sm font-medium">
                      Admin Login
                    </button>
                    <button onClick={() => setShowLogin(true)} className="px-4 py-2 text-gray-300 hover:text-[#f59e0b] transition duration-200 text-sm font-medium">Login</button>
                    {/* --- ★ FIX 3: Add !status.round1Active to the condition --- */}
                    {!status.round1Active && !status.resultsPublished && !status.round2ResultsPublished && (
                      <button onClick={() => setShowRegister(true)} className="px-4 py-2 text-black bg-[#f59e0b] rounded-lg font-semibold hover:bg-[#d97706] transition duration-200 text-sm shadow-md">Register</button>
                    )}
                  </>
                )}
              </div>

              {/* --- 8. NEW: Hamburger Menu Button (Mobile) --- */}
              <button
                className="md:hidden p-2 text-gray-300 hover:text-[#f59e0b]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
          </div>
        </header>

        {/* --- 9. NEW: Mobile Menu Overlay --- */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[81px] bg-[#0a1128] z-30 p-8 flex flex-col space-y-6 overflow-y-auto">
            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-5 text-gray-300 font-medium text-lg">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-[#f59e0b] transition p-2"
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  {link.name}
                </a>
              ))}
            </nav>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-4 pt-4 border-t border-gray-700">
              {isAuthenticated && user ? (
                <>
                  <span className="text-gray-300 font-medium">{`Hi, ${user.name}`}</span>
                  {user.isAdmin && (
                    <Link to="/admin" className="px-4 py-3 text-center text-[#f59e0b] bg-transparent border border-[#f59e0b] rounded-lg font-semibold hover:bg-amber-900/30 transition duration-200">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogoutClick} className="px-4 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 font-medium">Logout</button>
                </>
              ) : (
                <>
                    {/* --- ★ FIX 4: Add !status.round1Active to the condition --- */}
                  {!status.round1Active && !status.resultsPublished && !status.round2ResultsPublished && (
                    <button onClick={() => { setShowRegister(true); setIsMenuOpen(false); }} className="px-4 py-3 text-black bg-[#f59e0b] rounded-lg font-semibold hover:bg-[#d97706] transition duration-200 shadow-md">Register</button>
                  )}
                  <button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} className="px-4 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 font-medium">Login</button>
                  <button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} className="px-4 py-3 text-gray-300 bg-transparent rounded-lg hover:bg-gray-700 transition duration-200 font-medium">
                    Admin Login
                 </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- Hero Section (Unchanged) --- */}
        <section
          id="home"
          className="relative flex flex-col justify-center items-start px-10 md:px-24 lg:px-36 py-36 text-left overflow-hidden"
        >
          <div className="relative z-10">
            <motion.h1 {...fadeUp} className="text-5xl sm:text-6xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Welcome to <span className="text-[#f59e0b]">Hackathon 2026</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-gray-400 m-0 max-w-2xl leading-relaxed">
              National-Level Coding Competition by NIT Silchar.
            </motion.p>
            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-lg text-gray-400 max-w-2xl my-6 leading-relaxed">
              Showcase your AI/ML and problem-solving skills on a national platform.
            </motion.p>

            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mt-8">
              {isAuthenticated && user ? (
              <>
                  <p className="text-lg sm:text-xl font-semibold text-gray-200 mb-4">{`Welcome, Team: ${user.teamName}`}</p>
                  {/* (User status logic is unchanged) */}
                  {user.isAdmin ? (
                    <p className="text-base text-gray-400 font-medium">Use the "Admin Panel" link in the header to view teams.</p>
                  ) : !user.testCompleted ? (
                    <Link to="/start-test" className="inline-block px-8 py-3 text-lg bg-[#f59e0b] text-black rounded-lg font-semibold hover:bg-[#d97706] transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Go to Screening Test
                    </Link>
                  ) : user.testCompleted && !user.qualifiedRound2 && status.resultsPublished ? (
                    <div className="px-6 py-3 bg-rose-900 border border-rose-700 text-rose-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Round 1 Complete</p>
                      <p className="text-sm">Thank you for participating. Unfortunately, your team did not qualify for Round 2.</p>
                    </div>
                  ) : user.testCompleted && !user.qualifiedRound2 && !status.resultsPublished ? (
                    <div className="px-6 py-3 bg-sky-900 border border-sky-700 text-sky-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Round 1 Complete!</p>
                      <p className="text-sm">Results are not yet published. Check this page for updates.</p>
                    </div>
                  ) : user.testCompleted && user.qualifiedRound2 && !status.round2Active ? (
                    <div className="px-6 py-3 bg-emerald-900 border border-emerald-700 text-emerald-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Congratulations! You've Qualified!</p>
                      <p className="text-sm">Round 2 is not yet active. We will notify you when it begins.</p>
                    </div>
                  ) : user.testCompleted && user.qualifiedRound2 && status.resultsPublished && status.round2Active && !user.round2TestCompleted ? (
                    <Link to="/round2/start" className="inline-block px-8 py-3 text-lg bg-[#f59e0b] text-black rounded-lg font-semibold hover:bg-[#d97706] transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Start Round 2 Test
                    </Link>
                  ) : user.round2TestCompleted && !user.qualifiedRound3 && status.round2ResultsPublished ? (
                    <div className="px-6 py-3 bg-rose-900 border border-rose-700 text-rose-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Round 2 Complete</p>
                      <p className="text-sm">Thank you for participating. Unfortunately, your team did not qualify for Round 3.</p>
                    </div>
                  ) : user.round2TestCompleted && user.qualifiedRound3 && !status.round3Active ? (
                    <div className="px-6 py-3 bg-emerald-900 border border-emerald-700 text-emerald-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Congratulations! You've Qualified for Round 3!</p>
                      <p className="text-sm">Round 3 is not yet active. We will notify you when it begins.</p>
                    </div>
                  ) : user.round2TestCompleted && user.qualifiedRound3 && status.round3Active ? (
                    <Link to="/round3/problems" className="inline-block px-8 py-3 text-lg bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      Go to Round 3 Problems
                    </Link>
                  ) : (
                    <div className="px-6 py-3 bg-sky-900 border border-sky-700 text-sky-200 rounded-lg inline-block shadow-sm">
                      <p className="font-semibold">Round 2 Complete!</p>
                      <p className="text-sm">Round 2 results are being finalized. Check back soon!</p>
                    </div>
                 )}
                </>
           ) : (
                <>
                  <p className="text-lg font-medium text-gray-200 mb-4">Please log in or register to start the test</p>
                  <button onClick={handleStartTestClick} className="inline-block px-8 py-3 text-lg bg-[#f59e0b] text-black rounded-lg font-semibold hover:bg-[#d97706] transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Login to Start Test</button>
                </>
              )}
            </motion.div>

            <p className="mt-8 text-base text-gray-500 font-medium">Event: Jan - Feb 2026 | Registration Deadline: 30th Dec 2025</p>
          </div>
        </section>

        {/* --- Competition Rounds (Unchanged) --- */}
        <Section title="Competition Structure" id="rounds">
          <div className="grid gap-6 md:grid-cols-3 text-left">
            {rounds.map((round) => (
              <Card key={round.title}>
                <h3 className="text-xl font-semibold text-[#f59e0b] mb-3">{round.title}</h3>
                <p className="font-medium text-gray-300 mb-2">{round.date}</p>
                <p className="text-gray-400 leading-relaxed">{round.desc}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* --- Prizes Section (Unchanged) --- */}
        <Section title="Prizes & Recognition" id="prizes" dark>
          <div className="grid gap-6 md:grid-cols-3 text-center">
            {prizes.map((prize) => (
              <Card key={prize.rank} dark hoverEffect>
                <h3 className="text-2xl font-semibold text-[#f59e0b] mb-2">{prize.rank}</h3>
                <p className="text-4xl font-bold text-white mb-2">{prize.amount}</p>
                <p className="text-gray-400">{prize.desc}</p>
           </Card>
            ))}
          </div>
        </Section>

        {/* --- 10. NEW: Event Status & Results Section --- */}
        <Section title="Event Status & Results" id="results">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="text-center" hoverEffect={false}>
              <h3 className="text-2xl font-semibold text-white mb-4">Live Status</h3>
             
              {(!status.resultsPublished && !status.round2ResultsPublished) && (
                <p className="text-gray-400 text-lg">
                  Round 1 screening is complete. Results are being finalized and will be announced here soon.
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                {/* --- R1 Results Button (Moved Here) --- */}
                {status.resultsPublished && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={fetchAndShowQualifiedTeams}
                    className="px-6 py-3 bg-[#f59e0b] text-black rounded-lg font-semibold hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 transition shadow-md text-base"
                    title="View Round 1 Qualified Teams"
                  >
                    🏆 View Round 1 Results
                </motion.button>
                )}

                {/* --- R2 Results Button (Moved Here) --- */}
                {status.round2ResultsPublished && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={fetchAndShowQualifiedTeamsR3}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 transition shadow-md text-base"
                    title="View Round 2 Qualified Teams"
                  >
                  🏆 View Round 2 Results (Finalists)
                  </motion.button>
                )}
              </div>
            </Card>
          </div>
        </Section>


        {/* --- Registration & Perks (Unchanged) --- */}
       <Section title="Registration & Perks" id="about">
          <div className="grid gap-8 md:grid-cols-2 text-left">
            <Card className="md:col-span-1">
              <h3 className="text-xl font-semibold text-[#f59e0b] mb-4">Registration Details</h3>
              <p className="mb-1 text-gray-300"><strong>Deadline:</strong> 30th December 2025</p>
              <p className="mb-3 text-gray-300"><strong>Fee:</strong> Rs. 2000 per team (max 3 members)</p>
              <p className="font-semibold text-gray-200"><strong>Payment Account:</strong></p>
              <ul className="list-none pl-0 mt-2 text-gray-400 space-y-1 text-sm">
                <li><strong>Account Number:</strong> XXXX-XXXX-XXXX</li>
                <li><strong>Account Holder:</strong> YYYY ZZZZ</li>
                <li><strong>Bank:</strong> SBI, NIT Silchar</li>
                <li><strong>IFSC:</strong> SBIN0007061</li>
              </ul>

              {/* Button (Restyled) */}
                    {/* --- ★ FIX 5: Add !status.round1Active to the condition --- */}
            {!isAuthenticated && !status.round1Active && !status.resultsPublished && !status.round2ResultsPublished && (
                <button onClick={() => setShowRegister(true)} className="mt-5 inline-block px-6 py-2.5 text-black bg-[#f59e0b] rounded-lg font-semibold hover:bg-[#d97706] transition shadow-sm hover:shadow-md">Register Your Team</button>
              )}
            </Card>
            <div className="space-y-6 md:col-span-1">
              {perks.map((perk) => (
                <Card key={perk.title}>
                  <h3 className="text-xl font-semibold text-[#f59e0b] mb-3">{perk.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{perk.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        {/* --- FAQ Section (Unchanged, uses FAQItem) --- */}
        <Section title="Frequently Asked Questions" id="faq" dark>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
               question={faq.q}
                answer={faq.a}
              />
            ))}
          </div>
        </Section>

        {/* --- Footer (Unchanged) --- */}
        <footer id="contact" className="bg-[#0a1128] border-t border-gray-800 px-10 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-10 text-center md:text-left text-gray-400">

              {/* Column 1: Brand/Org */}
              <div className="flex-shrink-0">
                <h4 className="font-semibold text-white text-lg mb-3">Hackathon 2026</h4>
               <p className="text-sm">Organized by the CSE Department</p>
                <p className="text-sm">NIT Silchar</p>
           </div>

              {/* Column 2: Contact */}
              <div className="mt-4 md:mt-0">
                <h4 className="font-semibold text-white text-base mb-3">Contact</h4>
             <p className="text-sm">Faculty & 3rd Year B.Tech Students</p>
                <p className="text-sm">CR, Sec A & B, B.Tech (CSE)</p>
              </div>

              {/* Column 3: Follow Us */}
              <div className="mt-4 md:mt-0">
                <h4 className="font-semibold text-white text-base mb-3">Follow Us</h4>
                <div className="flex justify-center md:justify-start gap-5 text-xl">
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-[#f59e0b] transition" aria-label="Twitter"><FaTwitter /></a>
               <a href="https://www.linkedin.com/school/national-institute-of-technology-silchar/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition" aria-label="LinkedIn"><FaLinkedin /></a>
                  <a href="https://www.instagram.com/nitsilchar_?igsh=MWVwZnBld3k5Z2pwZA==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition" aria-label="Instagram"><FaInstagram /></a>
               <a href="https://www.facebook.com/share/1GjVryHqa6/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f59e0b] transition" aria-label="Facebook"><FaFacebook /></a>
                </div>
              </div>
            </div>

            {/* Bottom Bar (Restyled) */}
            <div className="border-t border-gray-700 mt-10 pt-8 text-center text-xs text-gray-500">
           <p>© 2025 SOFTWARE PROJECT. All Rights Reserved.</p>
              <p className="mt-2">
             <Link to="/admin" className="text-gray-500 hover:text-[#f59e0b] transition duration-200">
             Organizer Area
                </Link>
           </p>
            </div>
          </div>
        </footer>

      </div>

      {/* --- Modals & Results Popups (Unchanged) --- */}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onClose={() => setShowRegister(false)} />

      {/* --- Qualified Teams Modal (R1) --- */}
      {showQualifiedList && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => setShowQualifiedList(false)}
        >
          <div
            className="bg-[#0a192f] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] transform transition-all duration-300 scale-100"
           onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Round 1 Qualified Teams</h2>
              <button
                onClick={() => setShowQualifiedList(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isLoadingResults ? (
                <p className="text-center text-gray-300 py-4">Loading qualified teams...</p>
              ) : resultsError ? (
                <p className="text-center text-rose-300 bg-rose-900/50 p-4 rounded border border-rose-700">
                  {resultsError}
                </p>
              ) : qualifiedTeams.length > 0 ? (
                <>
                  <p className="text-sm text-gray-300 mb-4">
                 Congratulations to the following teams advancing to Round 2!
                  </p>
                  <ul className="space-y-3">
             {qualifiedTeams.map((team, index) => (
                      <li
                        key={team._id || index}
                        className="p-4 bg-[#0d1b3a] border border-gray-700 rounded-lg shadow-sm flex items-center space-x-3 hover:bg-gray-800 transition-colors"
                      >
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-700 text-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                   {index + 1}
                        </span>
                        <div>
                   <p className="font-semibold text-white">{team.teamName}</p>
                        </div>
                      </li>
                    ))}
               </ul>
                </>
              ) : (
                <p className="text-center text-gray-500 py-4">
             The list of qualified teams is currently empty.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex-shrink-0 text-right bg-[#0a1128] rounded-b-xl">
           <button
                onClick={() => setShowQualifiedList(false)}
                className="px-5 py-2 bg-[#f59e0b] text-black rounded-md font-semibold hover:bg-[#d97706] transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
           >
                Close
              </button>
           </div>
          </div>
        </div>
      )}

      {/* --- Qualified Teams Modal (R2) (Restyled) --- */}
      {showQualifiedListR3 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => setShowQualifiedListR3(false)}
        >
          <div
           className="bg-[#0a192f] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-semibold text-[#f59e0b]">
                Round 2 Qualified Teams (Finalists)
              </h2>
             <button
                onClick={() => setShowQualifiedListR3(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                &times;
             </button>
        </div>

            <div className="p-6 overflow-y-auto">
              {isLoadingResultsR3 ? (
                <p className="text-center text-gray-300 py-4">Loading Round 3 finalists...</p>
           ) : resultsErrorR3 ? (
                <p className="text-center text-rose-300 bg-rose-900/50 p-4 rounded border border-rose-700">
               {resultsErrorR3}
                </p>
              ) : qualifiedTeamsR3.length > 0 ? (
           <>
                  <p className="text-sm text-gray-300 mb-4">
                    Congratulations to the final teams advancing to Round 3!
                  </p>
                  <ul className="space-y-3">
               {qualifiedTeamsR3.map((team, index) => (
                      <li
                        key={team._id || index}
                   className="p-4 bg-[#0d1b3a] border border-gray-700 rounded-lg shadow-sm flex items-center space-x-3 hover:border-[#f59e0b] transition-colors"
               >
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-700 text-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
             {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#f59e0b]">{team.teamName}</p>
                   </div>
                      </li>
                    ))}
                  </ul>
             </>
              ) : (
             <p className="text-center text-gray-500 py-4">
                  The list of Round 3 finalists is currently empty.
             </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex-shrink-0 text-right bg-[#0a1128] rounded-b-xl">
          <button
                onClick={() => setShowQualifiedListR3(false)}
                className="px-5 py-2 bg-[#f59e0b] text-black rounded-md font-semibold hover:bg-[#d97706] transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
           >
                Close
              </button>
          </div>
          </div>
        </div>
     )}
    </>
  );
}

export default HomePage;