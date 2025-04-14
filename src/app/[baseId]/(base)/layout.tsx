import { type Metadata } from "next";
import LoadingCircle from "~/app/_components/loading-circle";

export const metadata: Metadata = {
  title: "Bases - Airytable",
};

export default function BaseLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoadingCircle />
    </div>
  );
}
