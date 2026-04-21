/**
 * app/(lab)/page.tsx
 * Root page for the appeX Typography Lab.
 * Server Component shell -- delegates to LabShell (client boundary).
 */

import { LabShell } from "@/components/LabShell";

export default function LabPage() {
  return <LabShell />;
}
