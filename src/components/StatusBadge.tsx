import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: "delivered" | "not_delivered" | "pending" | "validated" | "rejected";
  className?: string;
}

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const configs = {
    delivered: {
      icon: CheckCircle,
      label: "Livré",
      variant: "default" as const,
      bgColor: "bg-success",
    },
    not_delivered: {
      icon: XCircle,
      label: "Non livré",
      variant: "destructive" as const,
      bgColor: "bg-destructive",
    },
    pending: {
      icon: Clock,
      label: "En attente",
      variant: "secondary" as const,
      bgColor: "bg-warning",
    },
    validated: {
      icon: CheckCircle,
      label: "Validé",
      variant: "default" as const,
      bgColor: "bg-success",
    },
    rejected: {
      icon: RotateCcw,
      label: "Rejeté",
      variant: "destructive" as const,
      bgColor: "bg-destructive",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
