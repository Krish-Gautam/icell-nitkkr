export default function SketchfabModel() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="relative w-full pb-[56.25%]"> {/* 16:9 ratio */}
        <iframe
          title="zaroweczka"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/d5857cfa8b9c4ebab1e9467ca6e8b4c1/embed"
          className="absolute top-0 left-0 w-full h-full rounded-xl"
        />
      </div>
    </div>
  );
}
