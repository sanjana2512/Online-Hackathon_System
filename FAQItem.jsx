import React, { useState } from 'react';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  // Track rotation state specifically for the icon animation
  const [rotation, setRotation] = useState(0);

  // Apply Tailwind classes for the main container and hover/open states
  const containerClasses = [
    "bg-[#0a192f]", // Changed from bg-white
    "rounded-lg",
    "shadow-md", // Base shadow
    "border",
    "border-gray-700", // Changed from border-gray-200
    "transition-all", // Transition for all properties
    "duration-300",
    "overflow-hidden", // Important for rounded corners and smooth animation
    "mb-4", // Spacing between items
    isOpen
      ? "border-[#f59e0b]" // Use accent border when open
      : "hover:border-gray-600", // Subtle border change on hover when closed
  ].join(" ");

  const handleClick = () => {
    setIsOpen(!isOpen);
    // Rotate the icon 90 degrees clockwise on each click
    setRotation(prevRotation => prevRotation + (isOpen ? -90 : 90)); // Adjust rotation based on state change
  };

  return (
    <div className={containerClasses}>
      {/* Button for the question, full width */}
      <button
        onClick={handleClick}
        className="flex justify-between items-center w-full py-5 px-6 text-left focus:outline-none" // Increased padding
        aria-expanded={isOpen}
      >
        {/* Question text */}
        <span className="flex-1 font-semibold text-lg text-gray-200 pr-4">{question}</span> {/* Changed text-gray-800 */}
        {/* Icon container */}
        <span className="text-2xl text-[#f59e0b] flex-shrink-0 ml-2"> {/* Changed text-blue-500 */}
          {/* SVG Plus/Minus Icon - "currentColor" will inherit the orange text color */}
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Horizontal line */}
            <line x1="5" y1="12" x2="19" y2="12"></line>
            {/* Vertical line with rotation */}
            <line
              x1="12" y1="5" x2="12" y2="19"
              className="transition-transform duration-300 ease-in-out origin-center" // Ensure origin is center
              s style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />
          </svg>
        </span>
      </button>

      {/* Answer section - Using max-height for smooth transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0' // Adjust max-height if needed
          }`}
      >
        {/* Inner padding for the answer */}
        <div className="pb-5 px-6 pt-0 text-gray-400 leading-relaxed border-t border-gray-700"> {/* Changed text/border colors */}
          <p className="mt-4">{answer}</p> {/* Added margin-top to separate from border */}
        </div>
      </div>
    </div>
  );
};

export default FAQItem;