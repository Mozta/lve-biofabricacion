# Calibración: pasos/mm y flujo volumétrico

## Pasos por mm del émbolo

Fórmula general:

```
pasos/mm (del émbolo) = (pasos_motor_por_rev × microstepping × relación_gearbox) / paso_de_rosca_mm
```

Ejemplo con NEMA17 estándar (200 pasos/rev de paso completo), gearbox 5.18:1, varilla M8×1.25
(paso = 1.25mm, una sola entrada), sin microstepping (full-step, que es lo que hace el firmware
actual con el DRV8833 — ver `firmware/lve_control/lve_control.ino`):

```
pasos/mm = (200 × 1 × 5.18) / 1.25 ≈ 828.8 pasos/mm
```

**Importante:** este número es de ejemplo. Antes de confiar en él:
- Mide el paso real de la varilla con un calibrador (no todos los M8 son 1.25mm exactos).
- Confirma la relación real del gearbox del motor que se está usando (etiqueta/datasheet).
- Si más adelante se agrega microstepping (el DRV8833 actual corre en full-step, controlado
  manualmente por firmware), hay que multiplicar por el factor de microstepping usado.

## Flujo volumétrico (mL por mm de avance del émbolo)

Útil cuando se quiera calibrar flujo real, no indispensable para la primera prueba de "¿sí
extruye?":

```
volumen por mm = área interna del barril de la jeringa (mm²)
```

Medir el diámetro interno real de la jeringa de 60 mL con calibrador (suele rondar 26–27mm,
varía por marca/fabricante) y calcular el área (`π × r²`) para obtener mL/mm de avance.

Combinando ambas fórmulas se puede llegar a mL/paso, que es lo que finalmente se necesita para
programar volúmenes de extrusión exactos desde la interfaz de control (pendiente, ver README).

## Pendiente de documentar aquí

- [ ] Paso real medido de la varilla usada
- [ ] Relación de gearbox real del motor usado (o confirmar que es motor directo sin gearbox)
- [ ] Diámetro interno real de la jeringa SensiMedical usada
- [ ] Tabla de pasos/mm y mL/paso ya calculados con los valores reales
