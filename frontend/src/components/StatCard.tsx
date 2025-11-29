import clsx from "clsx";

interface StatCardProps {
  type: "appointments" | "pending" | "cancelled" | "lab" | "discharged";
  count: number;
  label: string;
  icon: string;
}

const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div className="stat-card border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
          <img
            src={icon}
            height={24}
            width={24}
            alt={label}
            className="size-6 w-fit opacity-70"
          />
        </div>
        <h2 className="text-32-bold text-gray-700 dark:text-gray-200">{count}</h2>
      </div>
      <p className="text-14-regular text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
};

export default StatCard;