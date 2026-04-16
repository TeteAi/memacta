import { redirect } from "next/navigation";

// /tools/copilot → redirect to canonical /copilot route
export default function ToolsCopilotPage() {
  redirect("/copilot");
}
