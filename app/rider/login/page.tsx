import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RiderLoginClient from "./RiderLoginClient";

export const dynamic = "force-dynamic";

export default async function RiderLoginPage() {
  const user = await getCurrentUser();

  if (user && user.roles.includes("RIDER")) {
    redirect("/rider/dashboard");
  }

  return <RiderLoginClient />;
}
