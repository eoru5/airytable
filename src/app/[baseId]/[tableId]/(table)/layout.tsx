import { type Metadata } from "next";
import LoadingCircle from "~/app/_components/loading-circle";

export const metadata: Metadata = {
  title: "Tables - Airytable",
};

export default function TableLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoadingCircle />
    </div>
  );
}
