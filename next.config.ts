import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({
  basePath: "/aplicativo", // <--- ESSA LINHA É O QUE FAZ O PWA FUNCIONAR
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
});