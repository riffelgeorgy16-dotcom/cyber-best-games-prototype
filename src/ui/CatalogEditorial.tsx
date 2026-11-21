export function CatalogEditorial({ heading, paragraphs }: {
  heading: string;
  paragraphs: readonly string[];
}) {
  return (
    <section className="catalog-editorial" aria-labelledby="catalog-editorial-title">
      <h2 className="h2" id="catalog-editorial-title">{heading}</h2>
      {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
  );
}
