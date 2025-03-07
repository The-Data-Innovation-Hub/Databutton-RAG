/**
 * Neumorphic design utility functions and constants
 */

// Colors
export const colors = {
  primary: "#0089AD",  // Teal blue for actions and emphasis
  secondary: "#000000", // Black for text and secondary elements
  background: "#FFFFFF", // White base background
  backgroundDark: "#F0F0F0", // Slightly darker tone for layering
  backgroundLight: "#FFFFFF", // Pure white for highlights
  shadowDark: "rgba(0, 0, 0, 0.07)", // Soft dark shadow
  shadowLight: "rgba(255, 255, 255, 0.7)", // Soft light highlight
  text: {
    primary: "#333333", // Dark grey for primary text
    secondary: "#666666", // Medium grey for secondary text
    muted: "#999999", // Light grey for less important text
    inverted: "#FFFFFF", // White text for dark backgrounds
    accent: "#0089AD" // Primary color for highlighted text
  },
  status: {
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3"
  },
  confidence: {
    high: "#4CAF50", // Green for high confidence
    moderate: "#FF9800", // Orange for moderate confidence
    low: "#F44336" // Red for low confidence
  }
};

// Spacing constants
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px"
};

// Border radius
export const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  pill: "9999px"
};

// Neumorphic shadows
export const neumorphicShadows = {
  // Flat surface with subtle shadow
  flat: `
    box-shadow: 5px 5px 10px ${colors.shadowDark}, 
                -5px -5px 10px ${colors.shadowLight};
  `,
  // Pressed/inset appearance
  inset: `
    box-shadow: inset 2px 2px 5px ${colors.shadowDark}, 
                inset -2px -2px 5px ${colors.shadowLight};
  `,
  // Button in default state
  button: `
    box-shadow: 3px 3px 8px ${colors.shadowDark}, 
                -3px -3px 8px ${colors.shadowLight};
  `,
  // Button in pressed state
  buttonPressed: `
    box-shadow: inset 3px 3px 8px ${colors.shadowDark}, 
                inset -3px -3px 8px ${colors.shadowLight};
  `,
  // Subtle shadow for hovering
  hover: `
    box-shadow: 6px 6px 12px ${colors.shadowDark}, 
                -6px -6px 12px ${colors.shadowLight};
  `,
  // Extra elevated components like dropdowns or modals
  elevated: `
    box-shadow: 8px 8px 16px ${colors.shadowDark}, 
                -8px -8px 16px ${colors.shadowLight};
  `,
  // Top-only shadow for cards and sections
  card: `
    box-shadow: 0px 5px 15px ${colors.shadowDark};
  `
};

// Helper function to generate a neumorphic button style
export const getNeumorphicStyles = (type: 'flat' | 'inset' | 'button' | 'buttonPressed' | 'hover' | 'elevated' | 'card' = 'flat') => {
  return {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    boxShadow: neumorphicShadows[type].replace(/\s+/g, ' ').trim(),
    transition: 'all 0.2s ease'
  };
};

// Generate CSS for neumorphic button states
export const neumorphicButton = {
  base: `
    background-color: ${colors.background};
    border-radius: ${borderRadius.md};
    border: none;
    color: ${colors.primary};
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.2s ease;
    ${neumorphicShadows.button}
  `,
  hover: `
    background-color: ${colors.backgroundLight};
    transform: translateY(-1px);
    ${neumorphicShadows.hover}
  `,
  active: `
    background-color: ${colors.backgroundDark};
    transform: translateY(1px);
    ${neumorphicShadows.buttonPressed}
  `,
  disabled: `
    color: ${colors.text.muted};
    background-color: ${colors.backgroundDark};
    ${neumorphicShadows.flat}
    cursor: not-allowed;
  `,
  primary: `
    background-color: ${colors.primary};
    color: white;
  `,
  secondary: `
    background-color: ${colors.background};
    color: ${colors.secondary};
    border: 1px solid ${colors.secondary};
  `
};

// Generate CSS for neumorphic input fields
export const neumorphicInput = {
  base: `
    background-color: ${colors.background};
    border-radius: ${borderRadius.md};
    border: none;
    color: ${colors.text.primary};
    padding: 12px 16px;
    transition: all 0.2s ease;
    ${neumorphicShadows.inset}
  `,
  focus: `
    outline: none;
    box-shadow: inset 4px 4px 8px ${colors.shadowDark}, 
                inset -4px -4px 8px ${colors.shadowLight};
  `,
  error: `
    border: 1px solid ${colors.status.error};
  `
};

// Generate CSS for neumorphic cards
export const neumorphicCard = {
  base: `
    background-color: ${colors.background};
    border-radius: ${borderRadius.lg};
    border: none;
    padding: ${spacing.lg};
    transition: all 0.3s ease;
    ${neumorphicShadows.flat}
  `,
  hover: `
    ${neumorphicShadows.hover}
  `,
  selected: `
    border: 2px solid ${colors.primary};
    ${neumorphicShadows.elevated}
  `
};

// Generate CSS for neumorphic toggles (checkbox/radio)
export const neumorphicToggle = {
  base: `
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
    background-color: ${colors.background};
    border-radius: ${borderRadius.pill};
    transition: all 0.3s ease;
    ${neumorphicShadows.inset}
  `,
  checked: `
    background-color: ${colors.primary};
  `,
  thumb: `
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background-color: ${colors.backgroundLight};
    border-radius: 50%;
    transition: all 0.3s ease;
    ${neumorphicShadows.button}
  `,
  thumbChecked: `
    transform: translateX(24px);
  `
};

// Utility classes for applying neumorphic effects
export const neumorphicClasses = {
  container: "bg-white rounded-xl p-6 transition-all duration-200 ease-in-out shadow-[5px_5px_10px_rgba(0,0,0,0.07),-5px_-5px_10px_rgba(255,255,255,0.7)]",
  card: "bg-white rounded-xl p-6 transition-all duration-200 ease-in-out shadow-[5px_5px_10px_rgba(0,0,0,0.07),-5px_-5px_10px_rgba(255,255,255,0.7)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.07),-6px_-6px_12px_rgba(255,255,255,0.7)]",
  button: "bg-white border-none rounded-xl py-3 px-6 font-semibold text-[#0089AD] transition-all duration-200 ease-in-out shadow-[3px_3px_8px_rgba(0,0,0,0.07),-3px_-3px_8px_rgba(255,255,255,0.7)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.07),-6px_-6px_12px_rgba(255,255,255,0.7)] hover:translate-y-[-1px] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.07),inset_-3px_-3px_8px_rgba(255,255,255,0.7)] active:translate-y-[1px]",
  primaryButton: "bg-[#0089AD] border-none rounded-xl py-3 px-6 font-semibold text-white transition-all duration-200 ease-in-out shadow-[3px_3px_8px_rgba(0,0,0,0.07),-3px_-3px_8px_rgba(255,255,255,0.7)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.07),-6px_-6px_12px_rgba(255,255,255,0.7)] hover:translate-y-[-1px] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.07),inset_-3px_-3px_8px_rgba(255,255,255,0.7)] active:translate-y-[1px]",
  input: "bg-white border-none rounded-xl py-3 px-4 text-[#333333] transition-all duration-200 ease-in-out shadow-[inset_2px_2px_5px_rgba(0,0,0,0.07),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.07),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] focus:outline-none",
  select: "bg-white border-none rounded-xl py-3 px-4 text-[#333333] transition-all duration-200 ease-in-out shadow-[inset_2px_2px_5px_rgba(0,0,0,0.07),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.07),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] focus:outline-none appearance-none",
  insetContainer: "bg-white rounded-xl p-6 transition-all duration-200 ease-in-out shadow-[inset_2px_2px_5px_rgba(0,0,0,0.07),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
};

export default {
  colors,
  spacing,
  borderRadius,
  neumorphicShadows,
  getNeumorphicStyles,
  neumorphicButton,
  neumorphicInput,
  neumorphicCard,
  neumorphicToggle,
  neumorphicClasses
};