#!/usr/bin/env bash
set -euo pipefail

HOSTS_FILE="${HOSTS_FILE:-/etc/hosts}"
MARKER_START="# >>> raushni dev hosts >>>"
MARKER_END="# <<< raushni dev hosts <<<"
HOST_BLOCK="$(cat <<'HOSTS'
# >>> raushni dev hosts >>>
127.0.0.1 raushni-dev.com
127.0.0.1 www.raushni-dev.com
127.0.0.1 api.raushni-dev.com
127.0.0.1 cms.raushni-dev.com
# <<< raushni dev hosts <<<
HOSTS
)"

if [ ! -w "$HOSTS_FILE" ]; then
  echo "This script needs permission to update $HOSTS_FILE." >&2
  echo "Run: sudo $0" >&2
  exit 1
fi

tmp_file="$(mktemp)"
cleanup() {
  rm -f "$tmp_file"
}
trap cleanup EXIT

if grep -qF "$MARKER_START" "$HOSTS_FILE"; then
  awk -v start="$MARKER_START" -v end="$MARKER_END" '
    $0 == start { print block; skip = 1; next }
    $0 == end { skip = 0; next }
    !skip { print }
  ' block="$HOST_BLOCK" "$HOSTS_FILE" > "$tmp_file"
else
  cat "$HOSTS_FILE" > "$tmp_file"
  printf "\n%s\n" "$HOST_BLOCK" >> "$tmp_file"
fi

cat "$tmp_file" > "$HOSTS_FILE"
echo "Raushni dev hosts are configured in $HOSTS_FILE"
