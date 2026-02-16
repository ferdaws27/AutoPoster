import * as Toast from "@radix-ui/react-toast";
import { useState } from "react";

export default function SecurityBadge() {
  const [open, setOpen] = useState(true); // visible by default

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
         duration={Infinity}  
        className="glass-effect rounded-2xl p-4 border border-green-400/30 shadow-lg w-80 relative"
      >
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center">
            <i className="fas fa-shield-check text-green-400"></i>
          </div>

          {/* Text */}
          <div>
            <div className="text-white font-medium text-sm">
              Enterprise Security
            </div>
            <div className="text-gray-400 text-xs">
              SOC 2 Compliant • End-to-End Encrypted
            </div>
          </div>
        </div>

        {/* Close button */}
        <Toast.Close className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer">
          ✕
        </Toast.Close>
      </Toast.Root>

      {/* Viewport for the toast */}
      <Toast.Viewport className="fixed bottom-6 right-6 flex flex-col gap-2 p-4 w-auto max-w-xs z-50" />
    </Toast.Provider>
  );
}
