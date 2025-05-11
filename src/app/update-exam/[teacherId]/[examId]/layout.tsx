import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/footer";

export default function UpdateExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigationBar />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
