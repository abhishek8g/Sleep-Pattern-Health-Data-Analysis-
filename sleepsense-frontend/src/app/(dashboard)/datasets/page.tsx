import { DatasetsPage } from "@/components/datasets/DatasetsPage";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Datasets" };
export default function Page() {
  return <DatasetsPage />;
}
