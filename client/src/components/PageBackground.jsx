export default function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        // layered glows that sit behind your content
        background:
          "radial-gradient(900px 420px at 15% 10%, rgba(139,92,246,0.20), transparent 60%)," +
          "radial-gradient(900px 420px at 85% 12%, rgba(56,189,248,0.18), transparent 60%)," +
          "radial-gradient(1200px 600px at 50% 0%, rgba(217,70,239,0.12), transparent 65%)",
        // extremely light base so it doesn’t look pure white
        backgroundColor: "rgba(248,250,252,0.85)", // near-slate-50
        maskImage:
          "radial-gradient(1200px 680px at 50% -10%, rgba(0,0,0,.9), rgba(0,0,0,0.0) 70%)",
      }}
    />
  );
}
