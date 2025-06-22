import { checkAdmin } from "@/action/check-admin";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await checkAdmin();

  console.log(result);

  if (!result.success) {
    redirect("/");
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
