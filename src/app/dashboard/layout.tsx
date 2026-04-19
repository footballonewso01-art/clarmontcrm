import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={session.user} />
      <main style={{
        flex: 1,
        marginLeft: "260px",
        padding: "2rem",
        maxWidth: "calc(100vw - 260px)",
      }}>
        {children}
      </main>
    </div>
  );
}
