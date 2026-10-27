const Problem = require('../models/problemModel');
const User = require('../models/userModel');
const Settings = require('../models/settingsModel');

// @desc    Admin: Add a new Round 3 problem
// @route   POST /api/problems
// @access  Private/Admin
exports.addProblem = async (req, res) => {
    const { problemId, topic, title, description, resources, points } = req.body;

    try {
        // Check if problem with this ID already exists
        let problem = await Problem.findOne({ problemId });
        if (problem) {
            return res.status(400).json({ msg: 'Problem with this ID already exists' });
        }

        problem = new Problem({
            problemId,
            topic,
            title,
            description,
            resources,
            points
        });

        await problem.save();
        res.status(201).json({ msg: 'Problem added successfully', problem });

    } catch (err) {
        console.error('Add Problem Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Get all Round 3 problems
// @route   GET /api/problems/all
// @access  Private/Admin
exports.getAllProblemsAdmin = async (req, res) => {
    try {
        const problems = await Problem.find().sort('problemId');
        res.json(problems);
    } catch (err) {
        console.error('Get All Problems (Admin) Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    User: Get all Round 3 problems (if qualified and active)
// @route   GET /api/problems
// @access  Private
exports.getProblemsUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const settings = await Settings.getSettings();

        // Security Checks
        if (!user.qualifiedRound3) {
            return res.status(403).json({ msg: 'User is not qualified for Round 3.' });
        }
        if (!settings.round3Active) {
            return res.status(403).json({ msg: 'Round 3 is not yet active.' });
        }
        // (Optional: Check R2 results published)
        if (!settings.round2ResultsPublished) {
             return res.status(403).json({ msg: 'Round 2 results are not currently published.' });
        }

        // Send all problems, sorted by topic
        const problems = await Problem.find().sort('topic problemId');
        res.json(problems);

    } catch (err) {
        console.error('Get Problems (User) Error:', err.message);
        res.status(500).send('Server Error');
    }
};