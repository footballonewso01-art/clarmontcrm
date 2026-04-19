import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "WORKER" | "AGENCY";
      workerId: string | null;
      agencyId: string | null;
    };
  }

  interface User {
    role: "ADMIN" | "WORKER" | "AGENCY";
    workerId: string | null;
    agencyId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    workerId: string | null;
    agencyId: string | null;
  }
}
