export function CatalogEditorial({ heading, paragraphs }: {
  heading: string;
  paragraphs: readonly string[];
}) {
  return (
    <section className="catalog-editorial" aria-labelledby="catalog-editorial-title">
      <h2 className="h2" id="catalog-editorial-title">{heading}</h2>
      <div className="editorial-columns">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
  );
}
