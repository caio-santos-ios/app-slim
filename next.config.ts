import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
});

export default withPWA({
  basePath: "/aplicativo",
  trailingSlash: true, // Necessário para evitar o redirecionamento 308 que vimos no curl
  images: {
    unoptimized: true,
  },
  // Recomendo manter o standalone desativado até o 404 sumir para facilitar o debug
});