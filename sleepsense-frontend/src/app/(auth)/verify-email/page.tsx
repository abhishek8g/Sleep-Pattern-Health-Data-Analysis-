import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Verify Email" };
export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
