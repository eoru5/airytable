"use client"

import { Button, Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useState } from "react";

export default function DialogStuff() {
  const [createBaseOpen, setCreateBaseOpen] = useState(false);

  return (
    <Dialog open={createBaseOpen} onClose={() => setCreateBaseOpen(false)} className="relative focus:outline-none z-10">
      <DialogBackdrop transition className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0 backdrop-blur-xs" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel transition className="max-w-lg space-y-4 bg-white p-8 rounded-sm duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
          <DialogTitle className="text-2xl font-semibold">Create a new Base?</DialogTitle>

          <hr className="h-0.5 border-neutral-300" />

          <Description>This will permanently deactivate your account</Description>
          <p>Are you sure you want to deactivate your account? All of your data will be permanently removed.</p>
          <div className="flex gap-4">
            <button onClick={() => setCreateBaseOpen(false)}>Cancel</button>
            <button onClick={() => setCreateBaseOpen(false)}>Deactivate</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}