#!/bin/sh

# Verifica se o script está rodando como root
if [ "$(id -u)" -ne 0 ]; then
  echo "Este script precisa ser executado como root (use sudo)." >&2
  exit 1
fi

# Criar diretórios necessários
mkdir -p .wwebjs_auth/session .wwebjs_cache

# Dar permissões totais aos diretórios
chmod -R 777 .wwebjs_auth .wwebjs_cache
