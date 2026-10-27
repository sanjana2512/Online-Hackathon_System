const mongoose = require('mongoose');

// This schema defines a single document in the database
// that holds global configuration flags for the application.
const SettingsSchema = new mongoose.Schema({
    // This field ensures only one document of this type exists.
    // Every query will look for the document where singleton is true.
    singleton: {
        type: Boolean,
        default: true,
        unique: true, // Database index enforces uniqueness
        required: true,
    },

    round1Active: { // ★★★ NEW FIELD ★★★
        type: Boolean,
        default: false
    },
    // Flag controlled by admin: True if Round 1 results are published
    resultsPublished: {
        type: Boolean,
        default: false, // Results are not published initially
    },
    // --- ★★★ ADD round2Active FIELD ★★★ ---
    // Flag controlled by admin: True if Round 2 is currently active/accessible
    round2Active: {
        type: Boolean,
        default: false, // Round 2 is not active initially
    },
    // Flag controlled by admin: True if Round 2 results are published
    round2ResultsPublished: {
        type: Boolean,
        default: false,
    },
    // Flag controlled by admin: True if Round 3 is currently active/accessible
    round3Active: {
        type: Boolean,
        default: false,
    },
    // --- ★★★ END ADDITION ★★★ ---
    // Add other global settings here if needed later
    // e.g., round2StartDate: Date,
    // e.g., round3Active: Boolean,
});

// Static helper method on the model to easily get or create the settings document.
// This prevents errors if the settings document hasn't been created yet.
SettingsSchema.statics.getSettings = async function() {
    // Try to find the single document where singleton is true
    let settings = await this.findOne({ singleton: true });
    // If it doesn't exist (e.g., first time server runs after DB setup)...
    if (!settings) {
        console.log("Initializing application settings document...");
        // Create the document with default values, including the new field
        settings = await this.create({
            singleton: true,
            resultsPublished: false, // Ensure defaults are set on creation
            round2Active: false      // --- ★★★ ADD DEFAULT HERE ★★★ ---
        });
    }
    // Return the found or newly created settings document
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema); // Export the model

