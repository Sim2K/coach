export const getDateBasedColor = (targetDate: string | null | undefined, isSelected: boolean = false) => {
  if (!targetDate) return isSelected ? "bg-purple-50" : "bg-white";

  const today = new Date();
  const target = new Date(targetDate);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return isSelected ? "bg-red-100" : "bg-red-50";
  } else if (diffDays <= 10) {
    return isSelected ? "bg-orange-100" : "bg-orange-50";
  }
  
  return isSelected ? "bg-purple-50" : "bg-white";
};
