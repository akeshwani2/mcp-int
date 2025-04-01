"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { ToolCallRenderer } from "../components/ToolCallRenderer";

/**
 * Client component that handles Copilot actions
 * This component has no UI of its own, it just sets up the action handler
 */
export const CopilotActionHandler: React.FC = () => {

  // add a custom action renderer for all actions
  useCopilotAction({
    name: "*",
    render: ({ name, args, result }: any) => {
      return (
        <ToolCallRenderer
          name={name}
          args={args}
          result={result}
        />
      );
    },
  });
  
  // Return null as this component doesn't render anything visible
  return null;
}; 