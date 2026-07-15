#!/bin/bash
set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_PATH="$BASE_DIR/models/qwen2.5-0.5b-instruct-q4_k_m.gguf"
SERVER_PATH="$BASE_DIR/bin/llama-server"
LOG_DIR="$BASE_DIR/logs"

echo "========================================================="
echo " Iniciando IA Offline (Frontend Next.js + Llama.cpp)"
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

# Limpa processos antigos para liberar as portas de forma agressiva
echo "Limpando portas e processos antigos..."
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

# 1. Inicia llama.cpp server usando NOHUP para isolar de sinais do terminal
echo "[1/4] Iniciando llama.cpp server na porta 8080..."
nohup "$SERVER_PATH" -m "$MODEL_PATH" -c 2048 -t 2 -np 1 --host 127.0.0.1 --port 8080 > "$LOG_DIR/llama-server.log" 2>&1 &
LLAMA_PID=$!

# 2. Aguarda o servidor ficar pronto (healthcheck na porta)
echo "[2/4] Aguardando llama-server inicializar..."
for i in $(seq 1 30); do
    if curl -s -o /dev/null --connect-timeout 1 http://127.0.0.1:8080/ 2>/dev/null; then
        echo "  llama-server pronto (PID: $LLAMA_PID)"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "  ERRO: llama-server não respondeu após 30s. Veja logs/llama-server.log"
        kill -9 $LLAMA_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 3. Instala dependências do frontend se necessário
echo "[3/4] Verificando dependências do frontend..."
if [ ! -d "$BASE_DIR/frontend/node_modules" ]; then
    echo "  Instalando dependências (pode levar alguns minutos)..."
    cd "$BASE_DIR/frontend"
    npm install --no-audit --no-fund 2>&1 | while IFS= read -r line; do
        echo "    $line"
    done
fi

# 4. Inicia frontend na porta 3001
echo "[4/4] Iniciando frontend na porta 3000..."
cd "$BASE_DIR/frontend"
PORT=3000 nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo ""
echo "========================================================="
echo " Serviços iniciados com sucesso!"
echo "  - llama.cpp API: http://127.0.0.1:8080"
echo "  - Frontend:      http://127.0.0.1:3000"
echo "  - Logs salvos em: $LOG_DIR/"
echo "========================================================="
echo "Pressione Ctrl+C neste terminal para encerrar tudo de uma vez."

# Função de limpeza automática ao fechar ou dar Ctrl+C
cleanup() {
    echo -e "\n\nEncerrando serviços locais..."
    kill -9 $FRONTEND_PID 2>/dev/null || true
    kill -9 $LLAMA_PID 2>/dev/null || true
    echo "Serviços finalizados. Até logo!"
    exit 0
}

# Captura sinais de interrupção (Ctrl+C), encerramento e fechamento do terminal
trap cleanup INT TERM HUP EXIT

# Segura o script rodando no terminal principal para manter a escuta do trap
wait