import { defineMcp } from "@lovable.dev/mcp-js";
import pingTool from "./tools/ping";
import formatPhoneTool from "./tools/format-phone";
import renderTemplateTool from "./tools/render-template";

export default defineMcp({
  name: "wa-sender-mcp",
  title: "WA Sender MCP",
  version: "0.1.0",
  instructions:
    "Utility tools for the WA Sender WhatsApp broadcast manager. Use `ping` to verify connectivity, `format_phone_number` to normalize raw phone input to digits-only form, and `render_template` to preview a broadcast message by filling {{variable}} placeholders.",
  tools: [pingTool, formatPhoneTool, renderTemplateTool],
});