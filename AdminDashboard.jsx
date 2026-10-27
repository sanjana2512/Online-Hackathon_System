import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// API URL
const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

// (Qualification criteria constants remain the same)
const MIN_SCORE_PERCENT = 50;
const TOP_RANK_PERCENT = 75;

// --- 1. NEW COMPONENT: StatCard ---
// A reusable component for the new overview tab
const StatCard = ({ title, value, description }) => (
  <div className="bg-white shadow rounded-lg p-5">
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

// --- 2. NEW COMPONENT: TabButton ---
// A reusable button for our new tabbed navigation
const TabButton = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
      ${isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-200'
      }
    `}
  >
    {title}
  </button>
);

function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- 3. NEW STATE: For managing tabs ---
  const [activeTab, setActiveTab] = useState('overview'); // Default to overview

  const [settings, setSettings] = useState({
    round1Active: false,
    resultsPublished: false,
    round2Active: false,
    round2ResultsPublished: false,
    round3Active: false,
  });

  // (Loading states for buttons remain the same)
  const [isActivatingR1, setIsActivatingR1] = useState(false);
  const [isPublishingR1, setIsPublishingR1] = useState(false);
  const [isActivatingR2, setIsActivatingR2] = useState(false);
  const [isPublishingR2, setIsPublishingR2] = useState(false);
  const [isActivatingR3, setIsActivatingR3] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [teamsRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/teams`),
          axios.get(`${API_URL}/admin/publish-status`)
        ]);
        
        setTeams(teamsRes.data || []);
        setSettings(settingsRes.data || {}); 
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.msg || 'Failed to load data. Ensure you are logged in as admin.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); 

  // --- 4. NEW MEMO: Calculate stats for the Overview tab ---
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const r1Completed = teams.filter(t => t.testCompleted).length;
    const r2Qualified = teams.filter(t => t.qualifiedRound2).length;
    const r2Completed = teams.filter(t => t.round2TestCompleted).length;
    const r3Qualified = teams.filter(t => t.qualifiedRound3).length;
    return { totalTeams, r1Completed, r2Qualified, r2Completed, r3Qualified };
  }, [teams]);

  // (teamsWithQualification memo remains the same)
  const teamsWithQualification = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    const sortedTeams = [...teams].sort((a, b) => (b.round1Score ?? 0) - (a.round1Score ?? 0));
    const totalTeams = sortedTeams.length;
    const cutoffRank = Math.ceil(totalTeams * (TOP_RANK_PERCENT / 100)); 

    return sortedTeams.map((team, index) => {
      const scorePercent = ((team.round1Score ?? 0) / 23) * 100; // 23 is R1 score
      const rank = index + 1;
      const meetsCriteria = scorePercent >= MIN_SCORE_PERCENT || rank <= cutoffRank;
      return {
        ...team,
        calculatedQualification: meetsCriteria,
        rank: rank,
      };
    });
  }, [teams]);
  
  // (displayedTeams memo remains the same)
  const displayedTeams = useMemo(() => {
    return teamsWithQualification.filter(team => {
      let matchesFilter = true;
      if (filter === 'qualified') {
        matchesFilter = team.qualifiedRound2 === true;
      } else if (filter === 'notQualified') {
        matchesFilter = team.qualifiedRound2 === false;
      } else if (filter === 'suggested') {
          matchesFilter = team.calculatedQualification === true && team.qualifiedRound2 === false;
      } else if (filter === 'removeSuggestion') {
          matchesFilter = team.calculatedQualification === false && team.qualifiedRound2 === true;
      } else if (filter === 'qualified_r3') {
          matchesFilter = team.qualifiedRound3 === true;
      }

      let matchesSearch = true;
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        matchesSearch =
          team.teamName?.toLowerCase().includes(lowerSearchTerm) ||
          team.name?.toLowerCase().includes(lowerSearchTerm) ||
          team.email?.toLowerCase().includes(lowerSearchTerm) ||
          team.teamMembers?.some(member => member.toLowerCase().includes(lowerSearchTerm));
      }
      return matchesFilter && matchesSearch;
    });
  }, [teamsWithQualification, filter, searchTerm]);

  // (All handle... functions remain exactly the same)
  const handleQualifyToggle = async (teamId, currentStatus) => {
    const newStatus = !currentStatus;
    setTeams(prevTeams => prevTeams.map(t => t._id === teamId ? { ...t, qualifiedRound2: newStatus } : t));
    try {
      await axios.patch(`${API_URL}/admin/teams/${teamId}/qualify`, { qualified: newStatus });
    } catch (err) {
      setError(`Failed to update status for team ${teamId}.`);
      setTeams(prevTeams => prevTeams.map(t => t._id === teamId ? { ...t, qualifiedRound2: currentStatus } : t));
    }
  };
    const handleAutoQualify = async () => {
       if (!window.confirm("This will mark all teams meeting the 50% score or Top 75% rank criteria as qualified for Round 2. Continue?")) return;

       setIsLoading(true); // Use main loading indicator
       setError('');
       let successCount = 0;
       let failCount = 0;

       // Filter teams that meet criteria but are not yet marked qualified
       const teamsToQualify = teamsWithQualification.filter(t => t.calculatedQualification && !t.qualifiedRound2);

       if (teamsToQualify.length === 0) {
           alert("No teams need to be updated based on the current criteria.");
           setIsLoading(false);
           return;
       }

       // Update each team via API
       // Using Promise.allSettled to handle potential individual failures
       const results = await Promise.allSettled(
           teamsToQualify.map(team =>
               axios.patch(`${API_URL}/admin/teams/${team._id}/qualify`, { qualified: true })
           )
       );

       // Update local state based on results
       const updatedTeams = teams.map(originalTeam => {
           const matchingResult = results.find((r, index) => teamsToQualify[index]._id === originalTeam._id && r.status === 'fulfilled');
           if (matchingResult) {
               successCount++;
               return { ...originalTeam, qualifiedRound2: true };
           }
           // Check for failures for this specific team ID (less direct but possible)
            const failedResult = results.find((r, index) => teamsToQualify[index]._id === originalTeam._id && r.status === 'rejected');
            if (failedResult) {
                failCount++;
                console.error(`Failed to auto-qualify team ${originalTeam._id}:`, failedResult.reason);
            }

           return originalTeam;
       });

       setTeams(updatedTeams);
       setIsLoading(false);

       let message = `${successCount} team(s) successfully marked as qualified.`;
       if (failCount > 0) {
           message += ` ${failCount} team(s) failed to update (check console).`;
           setError(`${failCount} team(s) failed to update.`);
       }
       alert(message);
   };
  const handleActivateRound1 = async () => {
    if (!window.confirm("Are you sure you want to activate Round 1?")) return;
    setIsActivatingR1(true);
    try {
      const res = await axios.post(`${API_URL}/admin/activate-round1`);
      setSettings(prev => ({ ...prev, round1Active: res.data.round1Active }));
      alert("Round 1 activated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to activate Round 1.');
    } finally {
      setIsActivatingR1(false);
    }
  };
  const handleDeactivateRound1 = async () => {
    if (!window.confirm("Are you sure you want to deactivate Round 1?")) return;
    setIsActivatingR1(true);
    try {
      const res = await axios.post(`${API_URL}/admin/deactivate-round1`);
      setSettings(prev => ({ ...prev, round1Active: res.data.round1Active }));
      alert("Round 1 deactivated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to deactivate Round 1.');
    } finally {
      setIsActivatingR1(false);
    }
  };
  const handlePublishResults = async () => {
    if (!window.confirm("Are you sure you want to publish Round 1 results?")) return;
    setIsPublishingR1(true);
    try {
      const res = await axios.post(`${API_URL}/admin/publish-results`);
      setSettings(prev => ({ ...prev, resultsPublished: res.data.resultsPublished }));
      alert("Round 1 Results published!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to publish R1 results.');
    } finally {
      setIsPublishingR1(false);
    }
  };
  const handleUnpublishResults = async () => {
      if (!window.confirm("Are you sure you want to unpublish Round 1 results?")) return;
    setIsPublishingR1(true);
    try {
      const res = await axios.post(`${API_URL}/admin/unpublish-results`);
      setSettings(prev => ({ ...prev, resultsPublished: res.data.resultsPublished }));
      alert("Round 1 Results unpublished!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to unpublish R1 results.');
    } finally {
      setIsPublishingR1(false);
    }
  };
  const handleActivateRound2 = async () => {
    if (!window.confirm("Are you sure you want to activate Round 2?")) return;
    setIsActivatingR2(true);
    try {
      const res = await axios.post(`${API_URL}/admin/activate-round2`);
      setSettings(prev => ({ ...prev, round2Active: res.data.round2Active }));
      alert("Round 2 activated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to activate Round 2.');
    } finally {
      setIsActivatingR2(false);
    }
  };
  const handleDeactivateRound2 = async () => {
    if (!window.confirm("Are you sure you want to deactivate Round 2?")) return;
    setIsActivatingR2(true);
    try {
      const res = await axios.post(`${API_URL}/admin/deactivate-round2`);
      setSettings(prev => ({ ...prev, round2Active: res.data.round2Active }));
      alert("Round 2 deactivated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to deactivate Round 2.');
    } finally {
      setIsActivatingR2(false);
    }
  };
  const handlePublishResultsR2 = async () => {
    if (!window.confirm("Are you sure you want to publish Round 2 results?")) return;
    setIsPublishingR2(true);
    try {
      const res = await axios.post(`${API_URL}/admin/publish-results-r2`);
      setSettings(prev => ({ ...prev, round2ResultsPublished: res.data.round2ResultsPublished }));
      alert("Round 2 Results published!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to publish R2 results.');
    } finally {
      setIsPublishingR2(false);
    }
  };
  const handleUnpublishResultsR2 = async () => {
      if (!window.confirm("Are you sure you want to unpublish Round 2 results?")) return;
    setIsPublishingR2(true);
    try {
      const res = await axios.post(`${API_URL}/admin/unpublish-results-r2`);
      setSettings(prev => ({ ...prev, round2ResultsPublished: res.data.round2ResultsPublished }));
      alert("Round 2 Results unpublished!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to unpublish R2 results.');
    } finally {
      setIsPublishingR2(false);
    }
  };
  const handleQualifyR3Toggle = async (teamId, currentStatus) => {
    const newStatus = !currentStatus;
    setTeams(prevTeams => prevTeams.map(t => t._id === teamId ? { ...t, qualifiedRound3: newStatus } : t));
    try {
      await axios.patch(`${API_URL}/admin/teams/${teamId}/qualify-r3`, { qualified: newStatus });
    } catch (err) {
      setError(`Failed to update R3 status for team ${teamId}.`);
      setTeams(prevTeams => prevTeams.map(t => t._id === teamId ? { ...t, qualifiedRound3: currentStatus } : t));
    }
  };
  const handleActivateRound3 = async () => {
    if (!window.confirm("Are you sure you want to activate Round 3?")) return;
    setIsActivatingR3(true);
    try {
      const res = await axios.post(`${API_URL}/admin/activate-round3`);
      setSettings(prev => ({ ...prev, round3Active: res.data.round3Active }));
      alert("Round 3 activated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to activate Round 3.');
    } finally {
      setIsActivatingR3(false);
    }
  };
  const handleDeactivateRound3 = async () => {
    if (!window.confirm("Are you sure you want to deactivate Round 3?")) return;
    setIsActivatingR3(true);
    try {
      const res = await axios.post(`${API_URL}/admin/deactivate-round3`);
      setSettings(prev => ({ ...prev, round3Active: res.data.round3Active }));
      alert("Round 3 deactivated!");
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to deactivate Round 3.');
    } finally {
      setIsActivatingR3(false);
    }
  };
  // (formatDate function remains the same)
  const formatDate = (dateString) => { /* (existing function) */ };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Loading admin data...</div>;
  }

  // --- 5. RENDER FUNCTIONS FOR EACH TAB ---

  const renderOverview = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="Total Registered Teams" 
        value={stats.totalTeams}
        description="All teams registered."
      />
      <StatCard 
        title="Round 1 Completed" 
        value={`${stats.r1Completed} / ${stats.totalTeams}`}
        description="Teams who submitted R1 test."
      />
      <StatCard 
        title="Qualified for Round 2" 
        value={stats.r2Qualified}
        description="Teams manually marked as qualified."
      />
      <StatCard 
        title="Round 2 Completed" 
        value={`${stats.r2Completed} / ${stats.r2Qualified}`}
        description="Teams who submitted R2 test."
      />
      <StatCard 
        title="Qualified for Round 3" 
        value={stats.r3Qualified}
        description="Finalists for the offline round."
      />
    </div>
  );

  const renderTeamManagement = () => (
    <>
      {/* Filter and Search Controls */}
      <div className="bg-white shadow rounded-lg mb-6 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="filter" className="font-medium text-gray-700">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Teams</option>
            <option value="qualified">Qualified (R2)</option>
            <option value="notQualified">Not Qualified (R2)</option>
            <option value="qualified_r3">Qualified (R3)</option>
            <option value="suggested">Suggested to Qualify (R2)</option>
            <option value="removeSuggestion">Suggested to Remove (R2)</option>
          </select>
          <button
            onClick={handleAutoQualify}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition duration-200 text-sm"
            title="Mark teams meeting 50% score or top 75% rank as qualified"
          >
            Auto-Qualify R2 Suggestions
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by Name/Email/Team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank (R1)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R1 Score</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R2 Score</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R1 Done</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R2 Done</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R2 Qualify?</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">R3 Qualify?</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedTeams.length > 0 ? (
              displayedTeams.map((team) => (
                <tr key={team._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.teamName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{team.name} ({team.email})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-center">{team.round1Score ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 font-semibold text-center">{team.round2Score ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${team.testCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {team.testCompleted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${team.round2TestCompleted ? 'bg-green-100 text-green-800' : (team.qualifiedRound2 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')}`}>
                      {team.round2TestCompleted ? 'Yes' : (team.qualifiedRound2 ? 'No' : 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`font-medium ${team.qualifiedRound2 ? 'text-green-600' : 'text-red-600'}`}>
                      {team.qualifiedRound2 ? 'Yes' : 'No'}
                    </span>
                    {team.calculatedQualification && !team.qualifiedRound2 && (
                      <span className="ml-1 text-xs text-green-500">(Suggest)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`font-medium ${team.qualifiedRound3 ? 'text-blue-600' : 'text-gray-500'}`}>
                      {team.qualifiedRound3 ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                    <button
                      onClick={() => handleQualifyToggle(team._id, team.qualifiedRound2)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition duration-200 ${
                        team.qualifiedRound2
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {team.qualifiedRound2 ? 'Remove R2' : 'Qualify R2'}
                    </button>
                    <button
                      onClick={() => handleQualifyR3Toggle(team._id, team.qualifiedRound3)}
                      disabled={!team.qualifiedRound2} // Can't qualify for R3 if not in R2
                      className={`px-3 py-1 text-xs font-medium rounded-full transition duration-200 ${
                        team.qualifiedRound3
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {team.qualifiedRound3 ? 'Remove R3' : 'Qualify R3'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-10 text-center text-gray-500">No teams match the current filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderEventControls = () => (
    <div className="space-y-6">
      {/* Round 1 Test Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className={`font-semibold text-lg ${settings.round1Active ? 'text-blue-600' : 'text-gray-600'}`}>
            Round 1 Test: {settings.round1Active ? 'Active' : 'Not Active'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleActivateRound1}
            disabled={isActivatingR1 || settings.round1Active}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR1 ? '...' : 'Activate R1'}
          </button>
          <button
            onClick={handleDeactivateRound1}
            disabled={isActivatingR1 || !settings.round1Active}
            className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR1 ? '...' : 'Deactivate R1'}
          </button>
        </div>
      </div>

      {/* Round 1 Results Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className={`font-semibold text-lg ${settings.resultsPublished ? 'text-green-600' : 'text-red-600'}`}>
            Round 1 Results: {settings.resultsPublished ? 'Published' : 'Not Published'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePublishResults}
            disabled={isPublishingR1 || settings.resultsPublished}
            className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isPublishingR1 ? '...' : 'Publish R1'}
          </button>
          <button
            onClick={handleUnpublishResults}
            disabled={isPublishingR1 || !settings.resultsPublished}
            className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isPublishingR1 ? '...' : 'Unpublish R1'}
          </button>
        </div>
      </div>
      
      {/* Round 2 Test Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className={`font-semibold text-lg ${settings.round2Active ? 'text-blue-600' : 'text-gray-600'}`}>
            Round 2 Test: {settings.round2Active ? 'Active' : 'Not Active'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleActivateRound2}
            disabled={isActivatingR2 || settings.round2Active}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR2 ? '...' : 'Activate R2'}
          </button>
          <button
            onClick={handleDeactivateRound2}
            disabled={isActivatingR2 || !settings.round2Active}
            className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR2 ? '...' : 'Deactivate R2'}
          </button>
        </div>
      </div>

      {/* Round 2 Results Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className={`font-semibold text-lg ${settings.round2ResultsPublished ? 'text-green-600' : 'text-red-600'}`}>
            Round 2 Results: {settings.round2ResultsPublished ? 'Published' : 'Not Published'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePublishResultsR2}
            disabled={isPublishingR2 || settings.round2ResultsPublished}
            className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isPublishingR2 ? '...' : 'Publish R2'}
          </button>
          <button
            onClick={handleUnpublishResultsR2}
            disabled={isPublishingR2 || !settings.round2ResultsPublished}
            className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isPublishingR2 ? '...' : 'Unpublish R2'}
          </button>
        </div>
      </div>

      {/* Round 3 Topics Controls */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <span className={`font-semibold text-lg ${settings.round3Active ? 'text-blue-600' : 'text-gray-600'}`}>
            Round 3 Topics: {settings.round3Active ? 'Active' : 'Not Active'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleActivateRound3}
            disabled={isActivatingR3 || settings.round3Active}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR3 ? '...' : 'Activate R3'}
          </button>
          <button
            onClick={handleDeactivateRound3}
            disabled={isActivatingR3 || !settings.round3Active}
            className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isActivatingR3 ? '...' : 'Deactivate R3'}
          </button>
        </div>
      </div>
    </div>
  );

  // --- 6. MAIN RETURN: Renders tabs and content ---
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        <TabButton 
          title="Overview" 
          isActive={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        />
        <TabButton 
          title="Team Management" 
          isActive={activeTab === 'teamManagement'} 
          onClick={() => setActiveTab('teamManagement')}
        />
        <TabButton 
          title="Event Controls" 
          isActive={activeTab === 'eventControls'} 
          onClick={() => setActiveTab('eventControls')}
        />
      </div>

      {/* Error Display */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {/* Conditional Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'teamManagement' && renderTeamManagement()}
        {activeTab === 'eventControls' && renderEventControls()}
      </div>
      
    </div>
  );
}

export default AdminDashboard;
