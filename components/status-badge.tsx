import { Badge } from "@/components/ui/badge";

type Status =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "high-risk"
  | "backordered"
  | "fulfilled"
  | "negotiating";

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    },

    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    },

    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-700 hover:bg-green-100",
    },

    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
    },

    "high-risk": {
      label: "High Risk",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
    },

    backordered: {
      label: "Backordered",
      className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    },

    fulfilled: {
      label: "Fulfilled",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    },

    negotiating: {
      label: "Negotiating",
      className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}