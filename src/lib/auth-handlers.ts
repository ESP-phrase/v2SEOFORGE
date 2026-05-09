// Re-export the handlers as plain GET/POST so the [...nextauth] route file
// can pick them up without re-importing the full Auth.js config in the
// edge-runtime middleware path.
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
