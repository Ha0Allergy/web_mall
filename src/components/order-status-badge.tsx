// 订单状态标签颜色映射
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-gray-50 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

interface OrderStatusBadgeProps {
  status: string;
}

// 订单状态标签
export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-gray-50 text-gray-700";
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
