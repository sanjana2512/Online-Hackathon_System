// --- Color Palette ---
// Main Dark Blue (Page BG): '#0a1128'
// Secondary Dark Blue (Content BG): '#0d1b3a'
// Card/Pane BG: '#0a192f' (from your FAQItem)
// Primary Accent (Orange/Amber): '#f59e0b'
// Accent Hover (Darker Orange): '#d97706'
// Light Text (Headings/Primary): '#e2e8f0' (Slate 200)
// Medium Text (Body/Secondary): '#94a3b8' (Slate 400)
// Border Color: '#334155' (Slate 700)
// Bright Green: '#34d399'
// Dark Green: '#059669'
// Bright Red: '#ef4444'
// Dark Red: '#dc2626'

export const styles = {
  // --- Main App Layout ---
  quizContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    background: '#0a1128', // --- THEME ---
    color: '#e2e8f0', // --- THEME ---
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#0d1b3a', // --- THEME ---
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)', // Darker shadow
    borderBottom: '1px solid #334155', // --- THEME ---
    flexShrink: 0,
    zIndex: 10,
  },
  quizTitle: {
    margin: 0,
    fontSize: '1.5em',
    color: '#ffffff', // --- THEME ---
    fontWeight: '600',
  },
  timerDisplay: {
    padding: '6px 16px',
    borderRadius: '9999px',
    background: '#f59e0b', // --- THEME ---
    color: '#000000', // Black text on orange
    fontWeight: '600',
    fontSize: '1.1em',
    minWidth: '100px',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  },
  // timerLow style (applied dynamically) would be:
  // timerLow: { background: '#ef4444' /* Red */, color: '#ffffff' },

  questionArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px', 
    display: 'flex',
    flexDirection: 'row', // Side-by-side for desktop
    justifyContent: 'center',
    gap: '24px',
  },

  // --- Bottom Navigation Bar ---
  bottomNav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#0d1b3a', // --- THEME ---
    borderTop: '1px solid #334155', // --- THEME ---
    flexShrink: 0,
    gap: '10px',
    flexWrap: 'wrap', // This is great for responsiveness
    boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.2)',
  },
  navButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#94a3b8', // --- THEME ---
    background: '#1e293b', // --- THEME ---
    border: '1px solid #334155', // --- THEME ---
    fontWeight: '600',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        borderColor: '#94a3b8',
        background: '#334155',
    }
  },
  navButtonActive: {
    background: '#f59e0b', // --- THEME ---
    color: '#000000', // --- THEME ---
    borderColor: '#f59e0b', // --- THEME ---
    transform: 'scale(1.1)',
    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)', // --- THEME ---
  },
  navButtonAnswered: {
    background: '#34d399', // --- THEME ---
    color: '#000000', // --- THEME ---
    borderColor: '#34d399', // --- THEME ---
     '&:hover': { 
        background: '#059669',
        borderColor: '#059669',
    }
  },
  submitTestButton: {
    height: '40px',
    borderRadius: '20px',
    padding: '0 24px',
    background: '#ef4444', // --- THEME ---
    color: 'white',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: '1em',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    marginLeft: '10px',
    '&:hover': {
        background: '#dc2626', // --- THEME ---
    }
  },

  // --- Question Display (Left/Right Panes) ---
  questionDisplayLayout: {
    display: 'flex',
    flexDirection: 'row', // Side-by-side layout
    width: '100%',
    maxWidth: '1400px', // Max-width for large screens
    gap: '24px', // Gap between panes
    height: '100%',
    maxHeight: '100%', // Use full available height
  },
  leftPane: {
    flex: '1 1 45%', // Flex-basis for side-by-side
    background: '#0d1b3a', // --- THEME ---
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // --- THEME ---
    border: '1px solid #334155', // --- THEME ---
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minHeight: '300px',
  },
  rightPane: {
    flex: '1 1 55%', // Flex-basis for side-by-side
    background: '#0d1b3a', // --- THEME ---
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // --- THEME ---
    border: '1px solid #334155', // --- THEME ---
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: '400px',
  },
  questionNumber: {
    color: '#f59e0b', // --- THEME ---
    margin: '0 0 8px 0',
    fontSize: '1.1em',
    fontWeight: '600',
    flexShrink: 0,
  },
  questionText: {
    fontSize: '1.4em', 
    color: '#e2e8f0', // --- THEME ---
    lineHeight: 1.6,
    marginTop: '4px',
    flexGrow: 1,
    overflowY: 'auto',
    paddingRight: '10px',
    flexShrink: 1,
  },

  // --- Text Options (MCQ/Aptitude) ---
  textOptionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  textOptionButton: {
    padding: '14px 20px',
    fontSize: '1em',
    background: '#0a192f', // --- THEME ---
    border: '1px solid #334155', // --- THEME ---
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    color: '#e2e8f0', // --- THEME ---
    '&:hover': {
        borderColor: '#94a3b8',
        backgroundColor: '#1e293b',
    }
  },
  optionSelected: {
    borderColor: '#f59e0b', // --- THEME ---
    background: '#4a2c0f', // --- THEME ---
    color: '#fef3c7', // --- THEME ---
    borderWidth: '2px',
    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)', // --- THEME ---
  },

  // --- Coding Questions ---
  aceEditorContainer: { 
    width: '100%',
    flexGrow: 1,
    minHeight: '200px',
    border: '1px solid #334155', // --- THEME ---
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '16px',
    position: 'relative',
  },
  // NOTE: You will need to set the Ace Editor theme to a dark theme,
  // e.g., 'monokai' or 'tomorrow_night', in your React component.
  // This style object can't control the editor's internal theme.

  // --- Loading Container ---
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    fontSize: '1.2em',
    color: '#94a3b8', // --- THEME ---
  },

  // --- Visible Test Cases ---
  testCaseDisplay: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid #334155', // --- THEME ---
    fontSize: '0.95em',
    color: '#94a3b8', // --- THEME ---
    flexShrink: 0,
  },

  // --- Code Submission Button ---
  submitCodeButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#f59e0b', // --- THEME ---
    color: '#000000', // --- THEME ---
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    flexShrink: 0,
    '&:disabled': {
      backgroundColor: '#334155',
      color: '#94a3b8',
      cursor: 'not-allowed',
    },
     '&:hover:not(:disabled)': {
      backgroundColor: '#d97706', // --- THEME ---
    }
  },

  // --- Code Output Console ---
  outputConsole: {
    marginTop: '16px',
    backgroundColor: '#000000', // Black console
    color: '#e2e8f0', // --- THEME ---
    borderRadius: '8px',
    border: '1px solid #334155', // --- THEME ---
    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.875em',
   flexShrink: 0,
    maxHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
  },
  outputTitle: {
    margin: 0,
    padding: '8px 12px',
    borderBottom: '1px solid #334155', // --- THEME ---
    fontSize: '1em',
    fontWeight: '600',
    flexShrink: 0,
  },
  outputBody: {
    margin: 0,
    padding: '12px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowY: 'auto',
    flexGrow: 1,
    lineHeight: 1.5,
  },

  // --- Results Page ---
  resultsContainer: {
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flex: 1, // Fills vertical space
    textAlign: 'center',
    padding: '32px',
    height: '100%', 
    width: '100%', 
    background: '#0d1b3a', // --- THEME ---
  },
  scoreText: {
    fontSize: '2.2em',
    fontWeight: '600',
    color: '#ffffff', // --- THEME ---
    margin: '16px 0',
  },
  restartButton: {
    display: 'inline-block',
    padding: '12px 28px',
    fontSize: '1em',
    background: '#f59e0b', // --- THEME ---
    color: '#000000', // --- THEME ---
    textDecoration: 'none',
    borderRadius: '9999px',
    marginTop: '24px',
   transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    '&:hover': {
        background: '#d97706', // --- THEME ---
    }
  },
  answerReview: {
    marginTop: '32px',
    textAlign: 'left',
  },
  answerItem: {
    background: '#0a192f', // --- THEME ---
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #334155', // --- THEME ---
    marginBottom: '12px',
    color: '#e2e8f0', // --- THEME ---
  },
  reviewCodeBlock: {
    background: '#1e293b', // --- THEME ---
   padding: '8px 12px',
    borderRadius: '4px',
    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    fontSize: '0.85em',
    border: '1px solid #334155', // --- THEME ---
 marginTop: '8px',
    color: '#94a3b8', // --- THEME ---
  },

  //option remove button
  clearSelectionButton: {
    padding: '10px 16px',
    fontSize: '0.9em',
    background: '#1e293b', // --- THEME ---
    border: '1px solid #334155', // --- THEME ---
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    color: '#94a3b8', // --- THEME ---
    marginTop: '16px',
    width: 'auto',
    alignSelf: 'flex-start',
    '&:hover': {
        background: '#334155',
       borderColor: '#94a3b8',
    }
  },

  // --- StartTest Page ---
  startTestContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
   flex: 1, // Fills vertical space
    height: '100%', 
    padding: '24px',
    textAlign: 'center',
    width: '100%', 
    background: '#0d1b3a', // --- THEME ---
  },
  startTestTitle: {
    fontSize: '2.5em',
    color: '#f59e0b', // --- THEME ---
    marginBottom: '16px',
    fontWeight: '700',
  },
  startTestObjective: {
    fontSize: '1.2em',
    color: '#e2e8f0', // --- THEME ---
    marginBottom: '12px',
    maxWidth: '500px',
  },
  startTestInfo: {
    fontSize: '1em',
    color: '#94a3b8', // --- THEME ---
    margin: '4px 0',
  },
  startTestWarning: {
    fontSize: '1em',
    color: '#ef4444', // --- THEME ---
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '24px',
  },
  startButton: {
    padding: '16px 36px',
    fontSize: '1.25em',
    background: 'linear-gradient(45deg, #34d399, #059669)', // --- THEME ---
    color: 'white',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 6px 15px rgba(52, 211, 153, 0.2)', // --- THEME ---
    transition: 'all 0.3s ease',
    fontWeight: '600',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(52, 211, 153, 0.3)', // --- THEME ---
    }
  },
  startTestTimerInfo: {
    marginTop: '24px',
    fontSize: '1em',
    color: '#94a3b8',
  },

  // --- TimesUp Page ---
  timesUpContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Fills vertical space
    height: '100%', 
    padding: '24px',
    textAlign: 'center',
    width: '100%', 
    background: '#0d1b3a', // --- THEME ---
  },
  timesUpTitle: {
    fontSize: '2.8em',
    color: '#ef4444', // --- THEME ---
 marginBottom: '16px',
    fontWeight: '700',
  },
  timesUpMessage: {
    fontSize: '1.3em',
    color: '#e2e8f0', // --- THEME ---
    marginBottom: '24px',
  },

  // --- Auth & Modals ---
  authButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  // These button styles are for the HomePage,
  // which you are now handling with Tailwind,
  // but I will update them just in case.
  homeLoginButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: 'transparent',
    color: '#f59e0b',
    border: '1px solid #f59e0b',
    textDecoration: 'none',
    borderRadius: '25px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#4a2c0f'
    }
  },
  homeRegisterButton: { 
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#f59e0b',
    color: '#000000',
    textDecoration: 'none',
    borderRadius: '25px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#d97706'
    }
  },
  welcomeUser: {
    fontSize: '1em',
    fontWeight: '600',
    color: '#e2e8f0', // --- THEME ---
    marginRight: '10px',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker backdrop
    backdropFilter: 'blur(5px)', // Blur effect
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#0d1b3a', // --- THEME ---
   padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 5px 25px rgba(0, 0, 0, 0.3)', // --- THEME ---
    width: '100%',
    maxWidth: '600px', // Responsive max-width
    margin: '24px', // Margin for small screens
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex', 
    flexDirection: 'column',
    border: '1px solid #334155', // --- THEME ---
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155', // --- THEME ---
   paddingBottom: '16px',
    marginBottom: '20px',
    flexShrink: 0,
  },
   modalTitle: { 
    fontSize: '1.5em',
    fontWeight: '600',
   color: '#ffffff', // --- THEME ---
 },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.8em',
    color: '#94a3b8', // --- THEME ---
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px',
    '&:hover': {
        color: '#e2e8f0', // --- THEME ---
    }
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  modalInput: {
    padding: '12px 16px',
    fontSize: '1em',
    border: '1px solid #334155', // --- THEME ---
    borderRadius: '8px',
    background: '#0a192f', // --- THEME ---
   color: '#e2e8f0', // --- THEME ---
    '&:focus': {
        outline: 'none',
        borderColor: '#f59e0b', // --- THEME ---
        boxShadow: '0 0 0 1px #f59e0b', // --- THEME ---
    }
  },
  modalSubtitle: {
    fontSize: '1.1em',
    fontWeight: '600',
   color: '#f59e0b', // --- THEME ---
    marginTop: '12px',
    marginBottom: '4px',
    borderTop: '1px solid #334155', // --- THEME ---
    paddingTop: '16px',
  },
 modalSubmitButton: {
    padding: '12px 16px',
    fontSize: '1.1em',
    backgroundColor: '#34d399', // --- THEME ---
    color: '#000000', // --- THEME ---
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '12px',
   fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: '#059669', // --- THEME ---
    },
    '&:disabled': {
        backgroundColor: '#334155',
        color: '#94a3b8',
       cursor: 'not-allowed',
    }
  },
  modalError: {
    color: '#f87171', // --- THEME ---
 backgroundColor: '#450a0a', // --- THEME ---
    border: '1px solid #b91c1c', // --- THEME ---
    padding: '10px 16px',
    borderRadius: '8px',
   textAlign: 'center',
    fontSize: '0.9em',
  },

  // --- Payment Button Style ---
  paymentButton: {
    backgroundColor: '#34d399', // --- THEME ---
    borderColor: '#34d399', // --- THEME ---
     '&:hover': {
        backgroundColor: '#059669', // --- THEME ---
 }
  },

};