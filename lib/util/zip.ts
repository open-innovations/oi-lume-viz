// deno-lint-ignore no-explicit-any
export default function zip(...iterables: any[]) {
  const maxLength = Math.max(...iterables.map(x => x.length));
  const zipped: unknown[] = []
  for (let i = 0; i < maxLength; i++) {
    zipped.push(iterables.map(x => x[i] || undefined));
  }
  return zipped;
}

