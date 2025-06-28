import { TopNavigationBar } from "@/components/top-navigation-bar";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <TopNavigationBar />
      {children}
    </div>
  );
}
