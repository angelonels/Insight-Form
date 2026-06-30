import sharp from "sharp";

await sharp("../web/public/media/insightform-product-tour-poster.png")
  .webp({ quality: 86 })
  .toFile("../web/public/media/insightform-product-tour-poster.webp");
