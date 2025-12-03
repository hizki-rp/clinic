import { cn } from "@/lib/utils";
import clsx from "clsx";
import { type Status } from "@/lib/types";

const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={cn("status-badge", {
        "bg-green-600": status === "scheduled",
        "bg-blue-600": status === "pending",
        "bg-red-600": status === "cancelled",
      })}
    >
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === "scheduled",
          "text-blue-500": status === "pending",
          "text-red-500": status === "cancelled",
        })}
      >
        {status}
      </p>
    </div>
  );
};

export default StatusBadge;