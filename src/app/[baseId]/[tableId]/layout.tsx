import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tables - Airytable",
};

export default function TableLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}