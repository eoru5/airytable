import type { ReactNode } from "react";
import Navbar from "./navbar";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}