// Limit the auth handoff to this milestone's internal job routes.
export function safeJobReturnPath(
  value: string | string[] | undefined,
): string {
  if (
    typeof value !== "string" ||
    value.length > 1000 ||
    !/^\/jobs(?:\/\d+)?(?:\?[^#\\]*)?$/.test(value)
  )
    return "/jobs";
  return value;
}
