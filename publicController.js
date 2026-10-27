const User = require('../models/userModel');
const Settings = require('../models/settingsModel'); // Import Settings model

// @desc    Get list of teams qualified for Round 2 (only if published)
// @route   GET /api/public/qualified-teams
// @access  Public
exports.getQualifiedTeams = async (req, res) => {
    try {
        const settings = await Settings.getSettings(); 

        if (!settings.resultsPublished) {
            console.log("Attempt to access R1 qualified teams before results published.");
            return res.json({ teams: [], message: "Round 1 results not published yet." });
        }

        const qualifiedTeams = await User.find({ qualifiedRound2: true, isAdmin: false })
            .select('teamName name teamMembers') 
            .sort({ teamName: 1 }); 

        res.json({ teams: qualifiedTeams, message: "List of qualified teams for Round 2." });

    } catch (err) {
        console.error('Get R1 Qualified Teams Error:', err.message);
        res.status(500).send('Server Error fetching qualified teams');
    }
};

// @desc    Get the public results published status
// @route   GET /api/public/publish-status
// @access  Public
exports.getPublishStatus = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        // --- ★★★ FIX: ADD 'round1Active' TO THE RESPONSE HERE ★★★ ---
        res.json({ 
            resultsPublished: settings.resultsPublished,
            round1Active: settings.round1Active // THIS WAS THE MISSING PIECE
        });
    } catch (err) {
        console.error('Get Public Publish Status Error:', err.message);
        res.status(500).send('Server Error getting publish status');
    }
};

// @desc    Get the public Round 2 active status
// @route   GET /api/public/round2-status
// @access  Public
exports.getRound2Status = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ round2Active: settings.round2Active });
    } catch (err) {
        console.error('Get Public R2 Status Error:', err.message);
        res.status(500).send('Server Error getting R2 status');
    }
};

// ---------------------------------------------------
// --- ★★★ ADD ALL NEW FUNCTIONS FOR R2/R3 BELOW ★★★ ---
// ---------------------------------------------------

// @desc    Get the public status of R2 results and R3 activity
// @route   GET /api/public/status-r2-r3
// @access  Public
exports.getPublicStatusR2R3 = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ 
            round2ResultsPublished: settings.round2ResultsPublished,
            round3Active: settings.round3Active
        });
    } catch (err) {
        console.error('Get Public R2/R3 Status Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get list of teams qualified for Round 3 (only if R2 results published)
// @route   GET /api/public/qualified-teams-r3
// @access  Public
exports.getQualifiedTeamsR3 = async (req, res) => {
    try {
        const settings = await Settings.getSettings(); 

        if (!settings.round2ResultsPublished) {
            console.log("Attempt to access R3 qualified teams before R2 results published.");
            return res.json({ teams: [], message: "Round 2 results not published yet." });
        }

        const qualifiedTeams = await User.find({ qualifiedRound3: true, isAdmin: false })
            .select('teamName name teamMembers') 
            .sort({ teamName: 1 }); 

        res.json({ teams: qualifiedTeams, message: "List of qualified teams for Round 3." });

    } catch (err) {
        console.error('Get R3 Qualified Teams Error:', err.message);
        res.status(500).send('Server Error');
    }
};