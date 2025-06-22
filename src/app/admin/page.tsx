import { auth } from "../../../auth";
import { getTickets } from "@/action/get-tickets";
import { AdminLayoutClient } from "./components/admin-layout-client";

type AdminPageProps = {
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
  };
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You are not authorized to access this page
          </p>
        </div>
      </div>
    );
  }

  const search = searchParams.search || "";
  const statusParam = searchParams.status;
  const status: "open" | "closed" | "all" =
    statusParam === "open" || statusParam === "closed" ? statusParam : "all";
  const page = parseInt(searchParams.page || "1");

  const initialResult = await getTickets({
    page,
    limit: 10,
    search,
    status,
  });

  const initialTickets = initialResult.success ? initialResult.data : [];
  const initialTotalPages = initialResult.success
    ? initialResult.pagination?.totalPages || 1
    : 1;

  return (
    <AdminLayoutClient
      initialTickets={initialTickets}
      initialTotalPages={initialTotalPages}
      currentPage={page}
    />
  );
}
