export function JsonPreview({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <details className="json-preview">
      <summary>查看结构化中间结果</summary>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
