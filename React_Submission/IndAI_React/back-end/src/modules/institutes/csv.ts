// RFC 4180 style parser: quoted commas, escaped quotes, CRLF, BOM and multiline cells.
export function parseCsv(input: string): Record<string, string>[] {
  if (typeof input !== "string" || input.length > 1024 * 1024)
    throw Error("CSV must be text under 1 MB.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell === "") quoted = !quoted;
      else throw Error("Invalid quote in CSV.");
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("Unclosed CSV quote.");
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  const headers = rows.shift()?.map((x) => x.trim()) || [];
  if (!headers.length || new Set(headers).size !== headers.length)
    throw Error("CSV header is empty or duplicated.");
  if (rows.length > 500) throw Error("Maximum 500 accounts per import.");
  return rows.map((values, i) => {
    if (values.length !== headers.length)
      throw Error(`Row ${i + 2}: column count does not match header.`);
    return Object.fromEntries(headers.map((h, j) => [h, values[j].trim()]));
  });
}
export function writeCsv(rows: any[][]) {
  return rows
    .map((r) =>
      r
        .map(
          (v) =>
            '"' +
            String(v ?? "")
              .replace(/^[=+\-@]/, "'$&")
              .replaceAll('"', '""') +
            '"',
        )
        .join(","),
    )
    .join("\r\n");
}
