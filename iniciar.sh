#!/bin/bash

# Captura o caminho absoluto de onde o script está sendo executado no PC
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_PATH="$BASE_DIR/models/qwen2.5-0.5b-instruct-q4_k_m.gguf"
SERVER_PATH="$BASE_DIR/bin/llama-server"
PUBLIC_UI_PATH="$BASE_DIR/out" # Caminho para a build estática do seu Next.js

echo "========================================================="
echo " Iniciando IA Offline (Next.js + TypeScript + Qwen)"
echo "========================================================="

# Executa o servidor limitando os recursos para o Celeron (1.8GB de RAM)
# -c 1024: Limita o contexto a 1024 tokens (economiza RAM)
# -t 2: Limita a inferência a 2 threads (não trava o processador do cliente)
# --public-path: Faz o llama-serve entregar o seu front-end estático na mesma porta
$SERVER_PATH -m $MODEL_PATH -c 2048 -t 4 --host 127.0.0.1 --port 8080
