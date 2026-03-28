export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function maskValue(value: string, visible: boolean) {
  if (visible) {
    return value;
  }

  return value.replace(/[a-zA-Z0-9]/g, "*");
}
