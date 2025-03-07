import React from "react";
import { Card, Typography } from "@mui/material";

interface FollowUpPromptProps {
  message: string;
}

const FollowUpPrompt: React.FC<FollowUpPromptProps> = ({ message }) => {
  // Style for the follow-up prompt card
  const followUpStyle = {
    margin: "4px 0 12px 24px", // Indented to show it's related to the AI's message
    padding: "12px 16px",
    backgroundColor: "#f0f7ff", // Lighter blue than user messages
    borderLeft: "4px solid #4285f4", // Google blue for suggestions
    borderRadius: "8px 8px 8px 2px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    maxWidth: "90%",
    fontSize: "0.9em",
    fontStyle: "italic"
  };

  return (
    <Card sx={followUpStyle}>
      <Typography variant="body2" sx={{ color: "#4c4c4c" }}>
        {message}
      </Typography>
    </Card>
  );
};

export default FollowUpPrompt;
