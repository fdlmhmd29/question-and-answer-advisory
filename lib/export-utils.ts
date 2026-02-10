export function htmlToPlainText(content: string): string {
  if (!content) return "";

  if (typeof window === "undefined") {
    return content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const container = document.createElement("div");
  container.innerHTML = content;

  container.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  container.querySelectorAll("li").forEach((li) => {
    li.insertBefore(document.createTextNode("• "), li.firstChild);
    li.appendChild(document.createTextNode("\n"));
  });

  container.querySelectorAll("p, div").forEach((block) => {
    block.appendChild(document.createTextNode("\n"));
  });

  return (container.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
