export default function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}