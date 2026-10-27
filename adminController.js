const User = require('../models/userModel');
const Settings = require('../models/settingsModel');

// @desc    Get all registered teams/users (for admin view)
// @route   GET /api/admin/teams
// @access  Private/Admin
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await User.find({ isAdmin: false })
            // --- ★★★ ADDED R2 SCORE & R3 STATUS TO SELECTION ★★★ ---
            .select('name email teamName teamMembers registeredAt round1Score testCompleted paymentCompleted qualifiedRound2 round2Score round2TestCompleted qualifiedRound3')
            .sort({ round1Score: -1, registeredAt: 1 });

        res.json(teams);
    } catch (err) {
        console.error('Get All Teams Error:', err.message);
        res.status(500).send('Server Error fetching teams');
    }
};

// @desc    Update a team's qualification status for Round 2
// @route   PATCH /api/admin/teams/:id/qualify
// @access  Private/Admin
exports.updateQualificationStatus = async (req, res) => {
    const { id } = req.params;
    const { qualified } = req.body;

    if (typeof qualified !== 'boolean') {
        return res.status(400).json({ msg: 'Invalid qualification status provided. Expecting a boolean value (true or false).' });
    }

    try {
        const team = await User.findById(id);

        if (!team) {
            return res.status(404).json({ msg: 'Team (User) not found with that ID' });
        }
        if (team.isAdmin) {
            return res.status(400).json({ msg: 'Cannot change qualification status for an admin user.' });
        }

        team.qualifiedRound2 = qualified;
        await team.save();

        console.log(`Admin updated qualification for team ${team.teamName} (${team.email}) to ${qualified}`);
        res.json({ msg: 'Qualification status updated successfully', team: team.toObject({ virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } }) });

    } catch (err) {
        console.error('Update Qualification Error:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Team ID format provided in URL' });
        }
        res.status(500).send('Server Error updating qualification status');
    }
};

// --- ★★★ NEW: Activate Round 1 Test ★★★ ---
// @desc    Activate Round 1
// @route   POST /api/admin/activate-round1
// @access  Private/Admin
exports.activateRound1 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round1Active: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        console.log(`Admin activated Round 1. Current status: ${settings.round1Active}`);
        res.json({ msg: 'Round 1 activated successfully', round1Active: settings.round1Active });
    } catch (err) {
        console.error('Activate Round 1 Error:', err.message);
        res.status(500).send('Server Error activating Round 1');
    }
};

// --- ★★★ NEW: Deactivate Round 1 Test ★★★ ---
// @desc    Deactivate Round 1
// @route   POST /api/admin/deactivate-round1
// @access  Private/Admin
exports.deactivateRound1 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round1Active: false } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        console.log(`Admin deactivated Round 1. Current status: ${settings.round1Active}`);
        res.json({ msg: 'Round 1 deactivated successfully', round1Active: settings.round1Active });
    } catch (err) {
        console.error('Deactivate Round 1 Error:', err.message);
        res.status(500).send('Server Error deactivating Round 1');
    }
};


// @desc    Publish Round 1 results
// @route   POST /api/admin/publish-results
// @access  Private/Admin
exports.publishResults = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { resultsPublished: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`Admin published R1 results. Current status: ${settings.resultsPublished}`);
        res.json({ msg: 'Round 1 Results published successfully', resultsPublished: settings.resultsPublished });

    } catch (err) {
        console.error('Publish R1 Results Error:', err.message);
        res.status(500).send('Server Error publishing results');
    }
};

// @desc    Unpublish Round 1 results
// @route   POST /api/admin/unpublish-results
// @access  Private/Admin
exports.unpublishResults = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { resultsPublished: false } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`Admin unpublished R1 results. Current status: ${settings.resultsPublished}`);
        res.json({ msg: 'Round 1 Results unpublished successfully', resultsPublished: settings.resultsPublished });

    } catch (err) {
        console.error('Unpublish R1 Results Error:', err.message);
        res.status(500).send('Server Error unpublishing results');
    }
};

// @desc    Get the current Round 1 results published status (for Admin UI)
// @route   GET /api/admin/publish-status
// @access  Private/Admin
exports.getPublishStatus = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        // --- ★★★ UPDATED: SEND ALL SETTINGS INCLUDING round1Active ★★★ ---
        res.json({
            round1Active: settings.round1Active, // New: Include round1Active
            resultsPublished: settings.resultsPublished,
            round2Active: settings.round2Active,
            round2ResultsPublished: settings.round2ResultsPublished,
            round3Active: settings.round3Active
        });
    } catch (err) {
        console.error('Get Admin Publish Status Error:', err.message);
        res.status(500).send('Server Error getting publish status');
    }
};

// @desc    Activate Round 2
// @route   POST /api/admin/activate-round2
// @access  Private/Admin
exports.activateRound2 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round2Active: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 2 activated', round2Active: settings.round2Active });
    } catch (err) {
        console.error('Activate Round 2 Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Deactivate Round 2
// @route   POST /api/admin/deactivate-round2
// @access  Private/Admin
exports.deactivateRound2 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round2Active: false } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 2 deactivated', round2Active: settings.round2Active });
    } catch (err) {
        console.error('Deactivate Round 2 Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get the current Round 2 status (for Admin UI)
// @route   GET /api/admin/round2-status
// @access  Private/Admin
exports.getRound2Status = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ round2Active: settings.round2Active });
    } catch (err) {
        console.error('Get Admin R2 Status Error:', err.message);
        res.status(500).send('Server Error getting Round 2 status');
    }
};

// ---------------------------------------------------
// --- ★★★ ADD ALL NEW FUNCTIONS FOR R2/R3 BELOW ★★★ ---
// ---------------------------------------------------

// @desc    Publish Round 2 results
// @route   POST /api/admin/publish-results-r2
// @access  Private/Admin
exports.publishResultsR2 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round2ResultsPublished: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 2 results published', round2ResultsPublished: settings.round2ResultsPublished });
    } catch (err) {
        console.error('Publish R2 Results Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Unpublish Round 2 results
// @route   POST /api/admin/unpublish-results-r2
// @access  Private/Admin
exports.unpublishResultsR2 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round2ResultsPublished: false } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 2 results unpublished', round2ResultsPublished: settings.round2ResultsPublished });
    } catch (err) {
        console.error('Unpublish R2 Results Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a team's qualification status for Round 3
// @route   PATCH /api/admin/teams/:id/qualify-r3
// @access  Private/Admin
exports.updateQualificationStatusR3 = async (req, res) => {
    const { id } = req.params;
    const { qualified } = req.body;

    if (typeof qualified !== 'boolean') {
        return res.status(400).json({ msg: 'Invalid qualification status provided.' });
    }

    try {
        const team = await User.findById(id);
        if (!team) {
            return res.status(404).json({ msg: 'Team not found.' });
        }
        if (team.isAdmin) {
            return res.status(400).json({ msg: 'Cannot change qualification status for admin.' });
        }

        team.qualifiedRound3 = qualified;
        await team.save();
        res.json({ msg: 'Round 3 qualification updated', team });
    } catch (err) {
        console.error('Update R3 Qualification Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Activate Round 3
// @route   POST /api/admin/activate-round3
// @access  Private/Admin
exports.activateRound3 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round3Active: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 3 activated', round3Active: settings.round3Active });
    } catch (err) {
        console.error('Activate Round 3 Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Deactivate Round 3
// @route   POST /api/admin/deactivate-round3
// @access  Private/Admin
exports.deactivateRound3 = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { singleton: true },
            { $set: { round3Active: false } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ msg: 'Round 3 deactivated', round3Active: settings.round3Active });
    } catch (err) {
        console.error('Deactivate Round 3 Error:', err.message);
        res.status(500).send('Server Error');
    }
};