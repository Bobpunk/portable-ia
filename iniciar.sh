#!/bin/bash
set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$BASE_DIR/logs"
SERVER_PATH="$BASE_DIR/bin/llama-server"

# O modelo padrão agora pode ser passado por argumento (ex: ./iniciar.sh outro-modelo.gguf)
# Se não for passado nada, ele busca o Llama 3.2 1B (mais forte) ou o Qwen como fallback
DEFAULT_MODEL="llama-3.2-1b-instruct-q4_k_m.gguf"
if [ ! -f "$BASE_DIR/models/$DEFAULT_MODEL" ]; then
    DEFAULT_MODEL="qwen2.5-0.5b-instruct-q4_k_m.gguf"
fi

SELECTED_MODEL="${1:-$DEFAULT_MODEL}"
MODEL_PATH="$BASE_DIR/models/$SELECTED_MODEL"

echo "========================================================="
echo " Iniciando IA Offline (Modelo: $SELECTED_MODEL)"
echo "========================================================="

# Verifica pré-requisitos físicos
if [ ! -f "$MODEL_PATH" ]; then
    echo "ERRO: Modelo não encontrado em $MODEL_PATH"
    exit 1
fi
if [ ! -f "$SERVER_PATH" ]; then
    echo "ERRO: llama-server não encontrado em $SERVER_PATH"
    exit 1
fi

mkdir -p "$LOG_DIR"

# Limpa processos antigos para liberar as portas
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

# 1. Inicia llama.cpp server apontando para o modelo escolhido
echo "[1/4] Iniciando llama.cpp server com o modelo selecionado..."
nohup "$SERVER_PATH" -m "$MODEL_PATH" -c 2048 -t 2 -np 1 --host 127.0.0.1 --port 8080 > "$LOG_DIR/llama-server.log" 2>&1 &
LLAMA_PID=$!

# 2. Aguarda o servidor ficar pronto
echo "[2/4] Aguardando llama-server inicializar..."
for i in $(seq 1 30); do
    if curl -s -o /dev/null --connect-timeout 1 http://127.0.0.1:8080/ 2>/dev/null; then
        echo "  llama-server pronto (PID: $LLAMA_PID)"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "  ERRO: llama-server não respondeu após 30s."
        kill -9 $LLAMA_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 3. Instala dependências do frontend se necessário
if [ ! -d "$BASE_DIR/frontend/node_modules" ]; then
    echo "[3/4] Instalando dependências do frontend..."
    cd "$BASE_DIR/frontend"
    npm install --no-audit --no-fund >/dev/null 2>&1
fi

# 4. Inicia frontend na porta 3000
echo "[4/4] Iniciando frontend na porta 3000..."
cd "$BASE_DIR/frontend"
PORT=3000 nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo ""
echo "========================================================="
echo " Serviços iniciados com sucesso!"
echo "  - Modelo ativo:  $SELECTED_MODEL"
echo "  - Frontend:      http://127.0.0.1:3000"
echo "========================================================="

cleanup() {
    echo -e "\n\nEncerrando serviços locais..."
    kill -9 $FRONTEND_PID 2>/dev/null || true
    kill -9 $LLAMA_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM HUP EXIT

wait