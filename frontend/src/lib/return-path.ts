// Allow only known internal destinations. Never trust a URL supplied by a form.
export function safeJobReturnPath(
  value: string | string[] | undefined,
): string {
  if (
    typeof value !== "string" ||
    value.length > 1000 ||
    /[\x00-\x1f\x7f\\]/.test(value) ||
    !/^\/(?:jobs(?:\/\d+)?|account\/(?:profile|jobs|messages|notifications|settings|security))(?:\?[^#]*)?$/.test(
      value,
    )
  )
    return "/jobs";
  return value;
}
