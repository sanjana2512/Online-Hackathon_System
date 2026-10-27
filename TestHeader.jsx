import React from 'react';
import { styles } from '../styles';
import { Link } from 'react-router-dom';
import { exitFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

// A simplified header for pages outside the main test
function TestHeader() {
    return (
        <div style={styles.headerBar}>
            <h1 style={styles.quizTitle}>Hackathon 2026</h1>
            {/* Add onClick handler to exit fullscreen when link is clicked */}
            <Link to="/" style={styles.navButton} onClick={exitFullscreen}>
                &larr;
            </Link>
        </div>
    );
}

export default TestHeader;