// FILE: client/scripts/gen-icons.mjs
import sharp from "sharp";

// Source logo (your horizontal PNG)
const src = "src/assets/finico-logo.png";

// Helper: pad to square on white background, keeping aspect
async function square(out, size) {
  await sharp(src)
    .resize({ width: size, height: size, fit: "contain", background: "#ffffff" })
    .png()
    .toFile(out);
}

await square("public/finico-icon-512.png", 512);
await square("public/finico-icon-192.png", 192);
await square("public/apple-touch-icon.png", 180);
await square("public/favicon-32.png", 32);

console.log("✅ Generated 512/192/180/32 icons in /public");
