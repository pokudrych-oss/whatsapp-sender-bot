import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "render_template",
  title: "Render broadcast template",
  description:
    "Fill a broadcast template that uses {{variable}} placeholders (e.g. {{field_1}}, {{name}}) with the provided variable values. Returns the rendered message plus the list of variables that were not substituted.",
  inputSchema: {
    template: z.string().min(1).describe("Template body containing {{variable}} placeholders."),
    variables: z
      .record(z.string(), z.string())
      .describe("Object mapping variable name (without braces) to its replacement value."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ template, variables }) => {
    const rendered = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
      key in variables ? variables[key] : match,
    );
    const missing = Array.from(
      new Set(
        Array.from(rendered.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).map((m) => m[1]),
      ),
    );
    return {
      content: [{ type: "text", text: rendered }],
      structuredContent: { rendered, missing_variables: missing },
    };
  },
});