#!/bin/bash
# Script de Verificación - Correcciones FASE 1
# Uso: bash verify_corrections.sh
# O en Windows (Git Bash): ./verify_corrections.sh

echo "🔍 Verificando correcciones FASE 1..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de checks
PASSED=0
FAILED=0

# Función para verificar
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS:${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL:${NC} $1"
        ((FAILED++))
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "1. VERIFICAR TRADUCCIÓN DE OrderStatus"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Buscando 'Pendiente' en OrderStatus.php..."
grep -q "'Pendiente'" Backend/app/Enums/OrderStatus.php
check_result "OrderStatus.php contiene 'Pendiente'"

echo "Buscando 'Confirmado' en OrderStatus.php..."
grep -q "'Confirmado'" Backend/app/Enums/OrderStatus.php
check_result "OrderStatus.php contiene 'Confirmado'"

echo "Buscando 'Preparando' en OrderStatus.php..."
grep -q "'Preparando'" Backend/app/Enums/OrderStatus.php
check_result "OrderStatus.php contiene 'Preparando'"

echo "Buscando 'En camino' en OrderStatus.php..."
grep -q "'En camino'" Backend/app/Enums/OrderStatus.php
check_result "OrderStatus.php contiene 'En camino'"

echo "Buscando 'Entregado' en OrderStatus.php..."
grep -q "'Entregado'" Backend/app/Enums/OrderStatus.php
check_result "OrderStatus.php contiene 'Entregado'"

echo "Verificando que NO hay 'Pending' en OrderStatus.php..."
if ! grep -q "'Pending'" Backend/app/Enums/OrderStatus.php; then
    echo -e "${GREEN}✅ PASS:${NC} OrderStatus.php NO contiene textos en inglés"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} OrderStatus.php aún contiene textos en inglés"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2. VERIFICAR REMOVER console.log DE Header.jsx"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Contando console.log en Header.jsx..."
CONSOLE_COUNT=$(grep -c "console\.log" Frontend/src/components/Header.jsx || echo 0)
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ PASS:${NC} Header.jsx tiene 0 console.log (esperado: 0)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} Header.jsx aún tiene $CONSOLE_COUNT console.log"
    ((FAILED++))
    echo "    Líneas:"
    grep -n "console\.log" Frontend/src/components/Header.jsx | head -5
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3. VERIFICAR CONSISTENCIA DE ROLES EN Header.jsx"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Verificando variable 'userRole' en Header.jsx..."
grep -q "const userRole" Frontend/src/components/Header.jsx
check_result "Header.jsx define 'userRole'"

echo "Verificando variable 'isAdmin' usa 'userRole'..."
grep -q "const isAdmin = userRole" Frontend/src/components/Header.jsx
check_result "Header.jsx define 'isAdmin' con 'userRole'"

echo "Verificando variable 'isRestaurant' existe..."
grep -q "const isRestaurant = userRole" Frontend/src/components/Header.jsx
check_result "Header.jsx define 'isRestaurant' con 'userRole'"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4. VERIFICAR ELIMINACIÓN DE Profile.jsx.backup"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Verificando que Profile.jsx.backup NO existe..."
if [ ! -f "Frontend/src/pages/Profile.jsx.backup" ]; then
    echo -e "${GREEN}✅ PASS:${NC} Profile.jsx.backup ha sido eliminado"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} Profile.jsx.backup aún existe"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5. VERIFICAR DOCUMENTACIÓN GENERADA"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Verificando COMPREHENSIVE_ANALYSIS.md existe..."
if [ -f "COMPREHENSIVE_ANALYSIS.md" ]; then
    echo -e "${GREEN}✅ PASS:${NC} COMPREHENSIVE_ANALYSIS.md generado"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} COMPREHENSIVE_ANALYSIS.md NO existe"
    ((FAILED++))
fi

echo "Verificando CORRECTIONS_PHASE_1_COMPLETED.md existe..."
if [ -f "CORRECTIONS_PHASE_1_COMPLETED.md" ]; then
    echo -e "${GREEN}✅ PASS:${NC} CORRECTIONS_PHASE_1_COMPLETED.md generado"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} CORRECTIONS_PHASE_1_COMPLETED.md NO existe"
    ((FAILED++))
fi

echo "Verificando ANALYSIS_SUMMARY.md existe..."
if [ -f "ANALYSIS_SUMMARY.md" ]; then
    echo -e "${GREEN}✅ PASS:${NC} ANALYSIS_SUMMARY.md generado"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL:${NC} ANALYSIS_SUMMARY.md NO existe"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "RESUMEN"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Checks Pasados:${NC} $PASSED"
echo -e "${RED}Checks Fallidos:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS CORRECCIONES SE APLICARON CORRECTAMENTE${NC}"
    exit 0
else
    echo -e "${RED}❌ ALGUNAS CORRECCIONES NO SE APLICARON CORRECTAMENTE${NC}"
    exit 1
fi
