"use client";

import { useAuth } from "@/contexts/auth/AuthContext";
import { getCurrentClockStatus } from "@/mocks/timeClock.mock";
import { ClockStatus } from "@/types/timeClock.types";
import { Clock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "./badge";

export function AttendanceStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.type === "Staff") {
      // Check current status
      setClockStatus(getCurrentClockStatus(user.id));
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Skip for doctor users or if on the profile page already
  if (!user || user.type !== "Staff" || pathname === "/profile" || isLoading) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => router.push("/profile")}
    >
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <span className="text-sm hidden md:inline">Ponto:</span>
        <Badge
          variant="outline"
          className={
            clockStatus === ClockStatus.CLOCKED_IN
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-yellow-50 text-yellow-800 border-yellow-200"
          }
        >
          {clockStatus === ClockStatus.CLOCKED_IN ? "Online" : "Offline"}
        </Badge>
      </div>
    </div>
  );
}
