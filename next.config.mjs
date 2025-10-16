/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  env: {
    BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:3030" : "https://api.proffesorbillionaire.com",
    WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://proffesorbillionaire.com",
    adminTokenNameInLocalStorage: "s-s-a-t",
    adminDashboardlanguageFieldNameInLocalStorage: "crypto-trading-admin-dashboard-language",
    defaultLanguage: "ar",
    WEBSITE_NAME: "Crypto Trading Bot"
  },
  async headers() {
    return [
      {
        source: process.env.NODE_ENV === "development" ? "//localhost:3030/(.*)" : "//api.proffesorbillionaire.com/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://proffesorbillionaire.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ]
      }
    ];
  }
}

export default nextConfig;