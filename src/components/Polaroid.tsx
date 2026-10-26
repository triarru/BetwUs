export function Polaroid({
  src,
  type,
  caption,
  frame = "polaroid",
  stickers = [],
}: {
  src: string;
  type: string;
  caption?: string;
  frame?: string;
  stickers?: string[];
}) {
  const frameClass =
    frame === "vintage"
      ? "frame-vintage"
      : frame === "none"
        ? "frame-none"
        : "polaroid";

  return (
    <figure className={`relative w-full max-w-xs ${frameClass}`}>
      {type === "video" ? (
        <video src={src} controls className="aspect-[4/5] w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={caption || "Kỷ niệm"} className="aspect-[4/5] w-full object-cover" />
      )}
      {stickers.length > 0 ? (
        <div className="absolute top-3 right-3 flex gap-1 text-lg">
          {stickers.map((sticker) => (
            <span key={sticker}>{sticker}</span>
          ))}
        </div>
      ) : null}
      {caption ? (
        <figcaption className="mt-2 px-1 text-center text-sm text-ink-soft">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
