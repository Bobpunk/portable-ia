import type { NextConfig } from "next";

const nextConfig: NextConfig = {
output: 'export', //gera /html/css/js puro na pasta /out
images: {
    unoptimized: true, //desativa otimiazção de imagem do node server
        },

        trailingSlash: true, // Melhora o roteamento do llm
};

export default nextConfig;
