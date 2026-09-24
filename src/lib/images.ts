/** Returns a resized delivery URL for hosts that support it; other URLs are returned unchanged. */
export function resizeImage(url: string, width: number): string {
  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", "75");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export function buildSrcSet(
  url: string,
  widths: number[] = [480, 800, 1200, 1600],
): string | undefined {
  const first = widths[0];
  if (first === undefined || resizeImage(url, first) === url) return undefined;
  return widths.map((width) => `${resizeImage(url, width)} ${width}w`).join(", ");
}
