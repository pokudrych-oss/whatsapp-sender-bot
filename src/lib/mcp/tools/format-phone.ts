import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "format_phone_number",
  title: "Format phone number",
  description:
    "Normalize a raw phone number by stripping non-digit characters. Returns the digits-only form used by the WhatsApp broadcast manager (e.g. 77713567919).",
  inputSchema: {
    phone: z.string().min(1).describe("Raw phone input, e.g. '+7 (771) 356-7919'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ phone }) => {
    const digits = phone.replace(/\D+/g, "");
    return {
      content: [{ type: "text", text: digits }],
      structuredContent: { phone: digits, length: digits.length },
    };
  },
});