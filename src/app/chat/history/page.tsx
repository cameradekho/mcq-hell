// app/chat/history/page.tsx
import { Suspense } from "react";
import HistoryPage from "./components/history";

export const dynamic = "force-dynamic"; // ⛔ prevents static export errors

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryPage />
    </Suspense>
  );
}
