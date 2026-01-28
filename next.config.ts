import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
});

export default withPWA({
  basePath: "/aplicativo",
  trailingSlash: true, 
  // Remova o 'output: standalone' se ele ainda estiver lá, 
  // pois ele exige uma configuração de servidor específica (server.js)
});