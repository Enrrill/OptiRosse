#!/usr/bin/env bash
# =============================================================================
#  Smoke test del módulo Pedidos (Fase 7) — contrato API /api/v1/pedidos/
# =============================================================================
#  Verifica end-to-end por rol: crear/editar/eliminar borrador, confirmar
#  (descuento de stock + asiento débito), transiciones de estado con 403/409,
#  cancelar con motivo (reversión de stock y asiento) y filtros de lista.
#
#  Requisitos:
#    - Backend corriendo (por defecto http://localhost:8000)
#    - jq y curl instalados
#    - ADMIN_USER / ADMIN_PASS de un usuario con rol "administrador"
#      (opcional: VENDEDOR_USER, TECNICO_USER, ALMACEN_USER con sus claves)
#
#  Uso:
#    ADMIN_USER=admin ADMIN_PASS='....' bash scripts/test_pedidos.sh
#    BASE_URL=http://localhost:8000 ADMIN_USER=... ADMIN_PASS='...' bash scripts/test_pedidos.sh
#
#  Los usuarios de roles faltantes (vendedor/técnico/almacén) se crean
#  automáticamente con el admin: pedtest_vendedor / pedtest_tecnico /
#  pedtest_almacen, contraseña OptiRosse123!
# =============================================================================

set -u

BASE_URL="${BASE_URL:-http://localhost:8000}"
API="$BASE_URL/api/v1"
ADMIN_USER="${ADMIN_USER:?Falta la variable ADMIN_USER (admin del sistema)}"
ADMIN_PASS="${ADMIN_PASS:?Falta la variable ADMIN_PASS}"

PASS_TEST="OptiRosse123!"
U_VENDEDOR="${VENDEDOR_USER:-pedtest_vendedor}"
U_TECNICO="${TECNICO_USER:-pedtest_tecnico}"
U_ALMACEN="${ALMACEN_USER:-pedtest_almacen}"
CORREOS_SUFIJO="${CORREOS_SUFIJO:-@optirosse.local}"

FAILS=0
HTTP=""
BODY=""

say()  { echo -e "\n$1"; }
pass() { echo "  [PASS] $1"; }
fail() { echo "  [FAIL] $1"; FAILS=$((FAILS + 1)); }
jqr()  { jq -r "$1" <<<"$BODY" 2>/dev/null; }

# --- helper HTTP: req <METODO> <TOKEN> <RUTA> [DATOS] -> deja HTTP y BODY ----
req() {
  local m="$1" t="$2" path="$3" data="${4:-}"
  local out
  local -a curl_args=(-s -X "$m" "$API$path" -H "Authorization: Bearer $t" -H 'Content-Type: application/json')
  if [ -n "$data" ]; then
    curl_args+=(-d "$data")
  fi
  out=$(curl "${curl_args[@]}" -w $'\n%{http_code}')
  HTTP="${out##*$'\n'}"
  BODY="${out%$'\n'*}"
}

login() { # usuario contrasena -> token access (vacío si falla)
  curl -s -X POST "$API/auth/login/" -H 'Content-Type: application/json' \
    -d "{\"identificador\":\"$1\",\"password\":\"$2\"}" | jq -r '.data.access // empty'
}

crear_usuario() { # tokenAdmin rol usuario -> token del usuario creado
  local auth="$1" rol="$2" user="$3"
  curl -s -X POST "$API/usuarios/" -H "Authorization: Bearer $auth" -H 'Content-Type: application/json' \
    -d "{\"nombre_usuario\":\"$user\",\"correo\":\"$user$CORREOS_SUFIJO\",\"nombre\":\"Test\",\"apellido\":\"Pedidos\",\"rol\":\"$rol\",\"password\":\"$PASS_TEST\"}" >/dev/null
  login "$user" "$PASS_TEST"
}

stock_variante() { # token varianteId -> stock
  req GET "$1" "/variantes/$2/"
  jqr '.data.stock'
}

# --- bootstrap ---------------------------------------------------------------
say "== 0. Login admin =="
TOKEN=$(login "$ADMIN_USER" "$ADMIN_PASS")
if [ -z "$TOKEN" ]; then
  fail "login de administrador falló — revisa ADMIN_USER/ADMIN_PASS"
  exit 1
fi
pass "login admin ($ADMIN_USER)"

say "== 0. Asegurar usuarios por rol =="
confirmar_usuario() { # rol usuario -> token
  local rol="$1" user="$2"
  local t
  t=$(login "$user" "$PASS_TEST")
  if [ -z "$t" ]; then
    t=$(crear_usuario "$TOKEN" "$rol" "$user")
  fi
  echo "$t"
}

T_VENDEDOR=$(confirmar_usuario vendedor_b2b "$U_VENDEDOR")
T_TECNICO=$(confirmar_usuario tecnico_taller "$U_TECNICO")
T_ALMACEN=$(confirmar_usuario almacen "$U_ALMACEN")
[ -n "$T_VENDEDOR" ] && pass "token vendedor ($U_VENDEDOR)" || fail "no se pudo autenticar/crear $U_VENDEDOR"
[ -n "$T_TECNICO" ] && pass "token técnico ($U_TECNICO)" || fail "no se pudo autenticar/crear $U_TECNICO"
[ -n "$T_ALMACEN" ] && pass "token almacén ($U_ALMACEN)" || fail "no se pudo autenticar/crear $U_ALMACEN"

# --- recursos de prueba -------------------------------------------------------
say "== 1. Recursos base (cliente + variantes con stock) =="
req GET "$TOKEN" "/clientes/?activo=true&page_size=5"
CLIENTE_ID=$(jqr '.data[0].id')
[ -n "$CLIENTE_ID" ] && [ "$CLIENTE_ID" != "null" ] && pass "cliente activo id=$CLIENTE_ID" || {
  fail "no hay clientes activos o falló la consulta (HTTP $HTTP)"
  exit 1
}

# Se juntan variantes activas e inactivas (toda la tabla) para poder armar
# pedidos de prueba con 3 líneas distintas. El modelo agrupa las variantes
# "inactivas" en el listado; para el contrato de pedidos solo importa que la
# variante exista (el stock solo se valida al confirmar).
cat_variantes() { # activo -> llena los arreglos VIDS/VSKUS/VSTOCK/VPRECIO
  local activo="$1" i n
  req GET "$TOKEN" "/variantes/?activo=$activo&page_size=100"
  mapfile -t _ids < <(jq -r '.data[] | .id' <<<"$BODY")
  mapfile -t _skus < <(jq -r '.data[] | .sku' <<<"$BODY")
  mapfile -t _stocks < <(jq -r '.data[] | .stock' <<<"$BODY")
  mapfile -t _precios < <(jq -r '.data[] | .precio_al_mayor' <<<"$BODY")
  n=${#_ids[@]}
  for ((i = 0; i < n; i++)); do
    VIDS+=("${_ids[i]}")
    VSKUS+=("${_skus[i]}")
    VSTOCK+=("${_stocks[i]}")
    VPRECIO+=("${_precios[i]}")
  done
}
cat_variantes true
cat_variantes false

if [ "${#VIDS[@]}" -lt 3 ]; then
  fail "se necesitan al menos 3 variantes en catálogo (hay ${#VIDS[@]})"
  exit 1
fi

# Normaliza el stock de las 3 variantes elegidas a 10 uds para que las
# aserciones de descuento/restauración sean deterministas en cada corrida.
STOCK_BASE=10
declare -a ORIG_STOCK=()
normalizar_stock() { # indice
  local idx="$1"
  ORIG_STOCK[idx]=$(stock_variante "$TOKEN" "${VIDS[idx]}")
  local delta=$((STOCK_BASE - ORIG_STOCK[idx]))
  if [ "$delta" -ne 0 ]; then
    req POST "$TOKEN" "/variantes/${VIDS[idx]}/ajustar-stock/" "{\"cantidad\":$delta,\"motivo\":\"smoke test fase 7\"}"
  fi
}
restaurar_stock() { # índice
  local idx="$1"
  local actual
  actual=$(stock_variante "$TOKEN" "${VIDS[idx]}")
  local delta=$((ORIG_STOCK[idx] - actual))
  if [ "$delta" -ne 0 ]; then
    req POST "$TOKEN" "/variantes/${VIDS[idx]}/ajustar-stock/" "{\"cantidad\":$delta,\"motivo\":\"restaurar tras smoke test\"}"
  fi
}
for i in 0 1 2; do normalizar_stock "$i"; done
pass "stock de variantes normalizado a $STOCK_BASE uds (${VSKUS[0]}, ${VSKUS[1]}, ${VSKUS[2]})"

restaurar_todo() {
  local i
  for i in 0 1 2; do restaurar_stock "$i"; done
}
trap restaurar_todo EXIT

# Expected totals (Decimal ROUND_HALF_UP, como el backend)
totales() { # JSON "[[p,q],[p,q]]" -> "subtotal impuesto total"
  python3 -c "
import json
from decimal import Decimal, ROUND_HALF_UP
pares = json.loads('$1')
st = sum(Decimal(str(p))*Decimal(str(q)) for p,q in pares).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
imp = (st*Decimal('0.16')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
print(st, imp, st+imp)
"
}

# --- 2. Crear pedido en borrador -------------------------------------------------
say "== 2. Crear pedido (borrador) =="
BODY_CREAR="{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"smoke test fase 7\",\"detalles\":[{\"variante\":${VIDS[0]},\"cantidad\":2,\"precio_unitario\":${VPRECIO[0]}},{\"variante\":${VIDS[1]},\"cantidad\":1,\"precio_unitario\":${VPRECIO[1]}},{\"variante\":${VIDS[2]},\"cantidad\":1,\"precio_unitario\":${VPRECIO[2]}}]}"
req POST "$TOKEN" "/pedidos/" "$BODY_CREAR"

PED1=$(jqr '.data.id')
NUM1=$(jqr '.data.numero_pedido')
EST1=$(jqr '.data.estado')
ST1=$(jqr '.data.subtotal'); IMP1=$(jqr '.data.impuesto'); TOT1=$(jqr '.data.total')
NLINEAS1=$(jqr '.data.detalles | length')

[ "$HTTP" = "201" ] && [ "$EST1" = "borrador" ] && pass "pedido creado (PED $PED1)" || fail "crear pedido: HTTP $HTTP estado=$EST1"
echo "     -> $NUM1, estado=$EST1, subtotal=$ST1, impuesto=$IMP1, total=$TOT1"
[ "$NLINEAS1" = "3" ] && pass "3 líneas creadas" || fail "líneas creadas: $NLINEAS1"

read -r ESP_ST ESP_IMP ESP_TOT <<<"$(totales "[[${VPRECIO[0]},2],[${VPRECIO[1]},1],[${VPRECIO[2]},1]]")"
[ "$ST1" = "$ESP_ST" ] && pass "subtotal calculado ($ST1 = $ESP_ST)" || fail "subtotal: got $ST1, esperado $ESP_ST"
[ "$IMP1" = "$ESP_IMP" ] && pass "impuesto 16% calculado ($IMP1 = $ESP_IMP)" || fail "impuesto: got $IMP1, esperado $ESP_IMP"
[ "$TOT1" = "$ESP_TOT" ] && pass "total calculado ($TOT1 = $ESP_TOT)" || fail "total: got $TOT1, esperado $ESP_TOT"
case "$NUM1" in PED-*) pass "numeración PED-NNNNNN ($NUM1)";; *) fail "numeración del pedido: $NUM1";; esac

# --- 3. Editar borrador (quitar línea + cambiar cantidades) ------------------------
say "== 3. Editar pedido en borrador =="
DET_PED1_0=$(jqr '.data.detalles[0].id')
BODY_EDITAR="{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"actualizado smoke\",\"detalles\":[{\"id\":$DET_PED1_0,\"variante\":${VIDS[0]},\"cantidad\":3,\"precio_unitario\":${VPRECIO[0]}},{\"variante\":${VIDS[2]},\"cantidad\":2,\"precio_unitario\":${VPRECIO[2]}}]}"
req PUT "$TOKEN" "/pedidos/$PED1/" "$BODY_EDITAR"

NLINEAS1B=$(jqr '.data.detalles | length')
TOT1B=$(jqr '.data.total')
[ "$HTTP" = "200" ] && [ "$NLINEAS1B" = "2" ] && pass "edición reduce a 2 líneas" || fail "editar: HTTP $HTTP líneas=$NLINEAS1B"
[ "$(jqr '.data.notas')" = "actualizado smoke" ] && pass "notas actualizadas" || fail "notas no actualizadas"
read -r _ _ ESP_TOTB <<<"$(totales "[[${VPRECIO[0]},3],[${VPRECIO[2]},2]]")"
[ "$TOT1B" = "$ESP_TOTB" ] && pass "totales recalculados tras editar ($TOT1B = $ESP_TOTB)" || fail "total tras editar: $TOT1B vs $ESP_TOTB"

# --- 4. Filtros de lista -----------------------------------------------------------
say "== 4. Filtros de lista =="
req GET "$TOKEN" "/pedidos/?estado=borrador&page_size=50"
jq -e --argjson p "$PED1" '.data[] | select(.id == $p)' <<<"$BODY" >/dev/null 2>&1 && pass "filtro ?estado=borrador incluye PED $PED1" || fail "filtro ?estado=borrador no incluye PED $PED1"

req GET "$TOKEN" "/pedidos/?search=PED&page_size=50"
jq -e --arg num "$NUM1" '.data[] | select(.numero_pedido == $num)' <<<"$BODY" >/dev/null 2>&1 && pass "búsqueda ?search=PED encuentra $NUM1" || fail "búsqueda por número no encontró $NUM1"

req GET "$TOKEN" "/pedidos/?cliente=$CLIENTE_ID&page_size=50"
[ "$(jqr '.meta.count')" -ge 1 ] 2>/dev/null && pass "filtro ?cliente=$CLIENTE_ID devuelve registros" || fail "filtro por cliente sin resultados"

HOY=$(date +%Y-%m-%d)
req GET "$TOKEN" "/pedidos/?fecha_creado_after=$HOY&fecha_creado_before=$HOY&page_size=50"
[ "$(jqr '.meta.count')" -ge 1 ] 2>/dev/null && pass "filtro por fecha (hoy) devuelve registros" || fail "filtro por fecha sin resultados"

# --- 5. Cancelar borrador con motivo (vendedor) -------------------------------------
say "== 5. Cancelar pedido en borrador (vendedor, con motivo) =="
req POST "$T_VENDEDOR" "/pedidos/$PED1/cambiar-estado/" '{"nuevo_estado":"cancelado","motivo":"no lo quiere el cliente"}'
[ "$HTTP" = "200" ] && [ "$(jqr '.data.estado')" = "cancelado" ] && pass "borrador cancelado con motivo" || fail "cancelar borrador: HTTP $HTTP estado=$(jqr '.data.estado')"

req POST "$T_VENDEDOR" "/pedidos/$PED1/confirmar/"
[ "$HTTP" = "409" ] && pass "confirmar un cancelado -> 409" || fail "confirmar cancelado: HTTP $HTTP (esperado 409)"

# --- 6. Confirmar (stock + asiento débito) -------------------------------------------
say "== 6. Confirmar pedido (admin) — stock y asiento débito =="
req POST "$TOKEN" "/pedidos/" "{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"confirmar\",\"detalles\":[{\"variante\":${VIDS[0]},\"cantidad\":2,\"precio_unitario\":${VPRECIO[0]}},{\"variante\":${VIDS[1]},\"cantidad\":1,\"precio_unitario\":${VPRECIO[1]}}]}"
PED2=$(jqr '.data.id'); NUM2=$(jqr '.data.numero_pedido'); TOT2=$(jqr '.data.total')
echo "     -> creado PED $PED2 ($NUM2, total $TOT2)"

STOCK_ANTES0=$(stock_variante "$TOKEN" "${VIDS[0]}")
STOCK_ANTES1=$(stock_variante "$TOKEN" "${VIDS[1]}")

req POST "$TOKEN" "/pedidos/$PED2/confirmar/"
[ "$HTTP" = "200" ] && [ "$(jqr '.data.estado')" = "confirmado" ] && pass "pedido confirmado" || fail "confirmar: HTTP $HTTP estado=$(jqr '.data.estado')"

STOCK_DSPS0=$(stock_variante "$TOKEN" "${VIDS[0]}")
STOCK_DSPS1=$(stock_variante "$TOKEN" "${VIDS[1]}")
[ "$((STOCK_ANTES0 - STOCK_DSPS0))" = "2" ] && pass "stock variante 1 descontado 2 uds ($STOCK_ANTES0 -> $STOCK_DSPS0)" || fail "stock variante 1: $STOCK_ANTES0 -> $STOCK_DSPS0"
[ "$((STOCK_ANTES1 - STOCK_DSPS1))" = "1" ] && pass "stock variante 2 descontado 1 uds ($STOCK_ANTES1 -> $STOCK_DSPS1)" || fail "stock variante 2: $STOCK_ANTES1 -> $STOCK_DSPS1"

req GET "$TOKEN" "/libro-mayor/?cliente=$CLIENTE_ID&page_size=50"
DEBITO_MONTO=$(jq -r --argjson p "$PED2" '.data[] | select(.pedido == $p and .tipo_asiento == "debito") | .monto' <<<"$BODY" | head -1)
[ -n "$DEBITO_MONTO" ] && [ "$DEBITO_MONTO" = "$TOT2" ] && pass "asiento débito por $TOT2 en libro mayor" || fail "asiento débito: monto $DEBITO_MONTO (esperado $TOT2)"

req POST "$TOKEN" "/pedidos/$PED2/confirmar/"
[ "$HTTP" = "409" ] && pass "doble confirmación -> 409" || fail "doble confirmar: HTTP $HTTP (esperado 409)"

# Regresión (bug Fase 7): borrador->confirmado SOLO por /confirmar/. El endpoint
# /cambiar-estado/ debe rechazarlo (409) para no saltarse stock + asiento débito.
req POST "$TOKEN" "/pedidos/" "{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"regresion confirmar\",\"detalles\":[{\"variante\":${VIDS[0]},\"cantidad\":2,\"precio_unitario\":${VPRECIO[0]}}]}"
PED5=$(jqr '.data.id')
req POST "$TOKEN" "/pedidos/$PED5/cambiar-estado/" '{"nuevo_estado":"confirmado"}'
[ "$HTTP" = "409" ] && pass "confirmar vía /cambiar-estado/ (borrador) -> 409" || fail "cambiar-estado a confirmado: HTTP $HTTP (esperado 409)"
req DELETE "$TOKEN" "/pedidos/$PED5/"
[ "$HTTP" = "200" ] && pass "borrador de regresión eliminado" || fail "limpieza del borrador de regresión: HTTP $HTTP"

# --- 7. Transiciones por rol (403 / 200 / 409) ---------------------------------------
say "== 7. Transiciones de estado por rol =="
req POST "$T_VENDEDOR" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"en_taller"}'
[ "$HTTP" = "403" ] && pass "vendedor confirmado->en_taller -> 403" || fail "vendedor transición: HTTP $HTTP (esperado 403)"

req POST "$TOKEN" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"en_taller"}'
[ "$HTTP" = "200" ] && [ "$(jqr '.data.estado')" = "en_taller" ] && pass "admin confirmado->en_taller -> 200" || fail "admin transición: HTTP $HTTP estado=$(jqr '.data.estado')"

req POST "$TOKEN" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"enviado"}'
[ "$HTTP" = "409" ] && pass "salto en_taller->enviado -> 409" || fail "salto de estado: HTTP $HTTP (esperado 409)"

req POST "$T_TECNICO" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"listo_para_despacho"}'
[ "$HTTP" = "200" ] && pass "técnico en_taller->listo -> 200" || fail "técnico transición: HTTP $HTTP"

req POST "$T_VENDEDOR" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"enviado"}'
[ "$HTTP" = "403" ] && pass "vendedor listo->enviado -> 403" || fail "vendedor enviado: HTTP $HTTP (esperado 403)"

req POST "$T_ALMACEN" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"enviado"}'
[ "$HTTP" = "200" ] && [ "$(jqr '.data.estado')" = "enviado" ] && pass "almacén listo->enviado -> 200 (terminal)" || fail "almacén transición: HTTP $HTTP estado=$(jqr '.data.estado')"

req POST "$T_ALMACEN" "/pedidos/$PED2/cambiar-estado/" '{"nuevo_estado":"en_taller"}'
[ "$HTTP" = "409" ] && pass "enviado (terminal) no transiciona -> 409" || fail "terminal transiciona: HTTP $HTTP (esperado 409)"

# --- 8. Cancelar confirmado (reversión de stock y asiento) ----------------------------
say "== 8. Cancelar pedido confirmado (reversión) =="
req POST "$TOKEN" "/pedidos/" "{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"cancelar confirmado\",\"detalles\":[{\"variante\":${VIDS[0]},\"cantidad\":1,\"precio_unitario\":${VPRECIO[0]}}]}"
PED3=$(jqr '.data.id'); TOT3=$(jqr '.data.total')
STOCK_ANTES=$(stock_variante "$TOKEN" "${VIDS[0]}")
req POST "$TOKEN" "/pedidos/$PED3/confirmar/"
STOCK_CONF=$(stock_variante "$TOKEN" "${VIDS[0]}")
[ "$((STOCK_ANTES - STOCK_CONF))" = "1" ] && pass "stock v1 descontado al confirmar PED3" || fail "confirmar PED3 no descontó stock"

req POST "$T_VENDEDOR" "/pedidos/$PED3/cambiar-estado/" '{"nuevo_estado":"cancelado","motivo":"error de tipeo en la cantidad"}'
[ "$HTTP" = "200" ] && [ "$(jqr '.data.estado')" = "cancelado" ] && pass "confirmado cancelado con motivo" || fail "cancelar confirmado: HTTP $HTTP"

req GET "$TOKEN" "/libro-mayor/?cliente=$CLIENTE_ID&page_size=50"
RETORNO=$(jq -r -e --argjson p "$PED3" '.data[] | select(.pedido == $p and .tipo_asiento == "credito") | .descripcion' <<<"$BODY" | head -1)
[ -n "$RETORNO" ] && pass "asiento de crédito por reversión creado: \"$RETORNO\"" || fail "no se encontró reversión del débito en libro mayor"

STOCK_FIN=$(stock_variante "$TOKEN" "${VIDS[0]}")
[ "$STOCK_FIN" = "$STOCK_ANTES" ] && pass "stock restaurado tras cancelar ($STOCK_ANTES -> $STOCK_FIN)" || fail "stock no restaurado: $STOCK_ANTES -> $STOCK_FIN"

# --- 9. Eliminar (solo borrador) -------------------------------------------------------
say "== 9. Eliminar pedido =="
req DELETE "$TOKEN" "/pedidos/$PED3/"
[ "$HTTP" = "409" ] && pass "eliminar cancelado -> 409" || fail "eliminar cancelado: HTTP $HTTP (esperado 409)"

req POST "$TOKEN" "/pedidos/" "{\"cliente\":$CLIENTE_ID,\"receta\":null,\"notas\":\"borrar\",\"detalles\":[{\"variante\":${VIDS[1]},\"cantidad\":1,\"precio_unitario\":${VPRECIO[1]}}]}"
PED4=$(jqr '.data.id')
req DELETE "$TOKEN" "/pedidos/$PED4/"
[ "$HTTP" = "200" ] && pass "eliminar borrador -> 200" || fail "eliminar borrador: HTTP $HTTP"
req GET "$TOKEN" "/pedidos/$PED4/"
[ "$HTTP" = "404" ] && pass "el borrado ya no existe -> 404" || fail "detalle tras eliminar: HTTP $HTTP (esperado 404)"

# --- 10. Lectura para todos los roles ----------------------------------------------------
say "== 10. Lectura de lista para almacén/técnico =="
for t in "$T_ALMACEN" "$T_TECNICO"; do
  req GET "$t" "/pedidos/?page_size=5"
  [ "$HTTP" = "200" ] && pass "lista leída OK" || fail "lectura de lista: HTTP $HTTP"
done

# --- resumen --------------------------------------------------------------------------------
echo
echo "==================================="
if [ "$FAILS" -eq 0 ]; then
  echo "  RESULTADO: TODOS LOS CHECKS PASARON"
  exit 0
else
  echo "  RESULTADO: $FAILS CHECK(S) FALLARON"
  exit 1
fi
echo "==================================="