import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Remova o skipwaiting se o erro de TS persistir
});

export default withPWA({
  basePath: "/aplicativo",
  trailingSlash: true, // <--- ADICIONE ESTA LINHA
  images: {
    unoptimized: true,
  },
});