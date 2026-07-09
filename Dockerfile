# ==========================================
# Estágio 1: Compilação (Builder)
# ==========================================
FROM ubuntu:24.04 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

RUN git clone --depth 1 https://github.com/ggerganov/llama.cpp.git .

RUN mkdir build && cd build && \
    cmake .. -DLLAMA_SERVER=ON && \
    cmake --build . --config Release --target llama-server

# ==========================================
# Estágio 2: Runtime (Imagem Leve de Produção)
# ==========================================
FROM ubuntu:24.04

WORKDIR /app

# CORREÇÃO: Adicionada libgomp1 para gerenciar as threads do processador
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libc6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/build/bin/ /app/
RUN chmod +x /app/llama-server

ENV LD_LIBRARY_PATH=/app

RUN mkdir -p /app/models

EXPOSE 8080

ENTRYPOINT ["/app/llama-server"]

# Substitua a linha CMD atual por esta:
CMD ["-m", "/app/models/qwen2.5-0.5b-instruct-q4_k_m.gguf", "-c", "2048", "-t", "4", "--host", "0.0.0.0", "--port", "8080"]