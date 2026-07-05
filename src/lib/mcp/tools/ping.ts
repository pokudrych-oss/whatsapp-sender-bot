import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "ping",
  title: "Ping",
  description: "Simple connectivity check. Returns a pong message with the current server timestamp.",
  inputSchema: {
    message: z
      .string()
      .optional()
      .describe("Optional message to echo back."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ message }) => {
    const reply = message ? `pong: ${message}` : "pong";
    return {
      content: [
        {
          type: "text",
          text: `${reply} (server time: ${new Date().toISOString()})`,
        },
      ],
    };
  },
});