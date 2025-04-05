import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Bases - Airytable",
};

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}