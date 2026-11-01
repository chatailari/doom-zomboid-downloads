#!/usr/bin/env python3
"""Prueba visual heurística; requiere además inspección de captura."""
from PIL import Image
from collections import Counter
im = Image.open("frontera-emulator.png").convert("RGB")
pixels = list(im.resize((240,135)).getdata())
warm = sum(1 for r,g,b in pixels if r>95 and r>g*1.12 and g>b*1.14)
green_dark = sum(1 for r,g,b in pixels if g>r*1.12 and g>b*1.04 and g<115)
blue = sum(1 for r,g,b in pixels if b>g*1.18 and g>r*1.08 and b>95)
print("CAPTURA", im.size, "CALIDOS", warm, "FONDO_VERDE", green_dark, "AZULES_SISTEMA", blue)
if min(im.size)<500:
    raise SystemExit("Captura no valida")
if warm<35 or green_dark<100:
    raise SystemExit("No se ven colores esperados del menu Frontera")
if blue>9000:
    raise SystemExit("Posible superposicion del sistema")
print("PASS: imagen con colores compatibles con el menu; validar imagen manualmente")
