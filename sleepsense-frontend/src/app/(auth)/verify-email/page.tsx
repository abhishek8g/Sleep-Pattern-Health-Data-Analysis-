import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Verify Email" };
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
