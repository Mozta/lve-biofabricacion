# LVE — Extrusor de jeringa para validación de biomaterial

Proyecto de biofabricación: validar que el biomaterial desarrollado en el laboratorio puede
extruirse de forma consistente, **antes** de invertir tiempo en construir/adaptar la impresora
3D completa. Basado en el diseño *Large Volume Extruder (LVE)* de Pusch, Hinton & Feinberg
(HardwareX 3, 2018) — [DOI 10.1016/j.ohx.2018.02.001](https://doi.org/10.1016/j.ohx.2018.02.001).

## Estado actual

- [x] Piezas impresas (versión simplificada: base, bloque empujador, collar de jeringa)
- [x] Electrónica cableada y verificada con multímetro
- [x] Firmware cargado, motor girando con la fuente en modo C.C
- [ ] Confirmar polaridad exacta de Bobina A / Bobina B con multímetro
- [ ] Prueba de extrusión con el biomaterial real
- [ ] Calibración fina de pasos/mm y flujo volumétrico
- [ ] Interfaz de control (web)

## Decisión de diseño

Se optó por una **versión simplificada** del LVE original: en vez de fabricar el par de
engranes herringbone impresos (el cuello de botella típico de tolerancias finas), se usa un
motor NEMA17 comercial. Esto redujo las piezas impresas de 8 a 3 y evitó las semanas de ajuste
de engranes. Ver [`docs/01-mecanismo-y-diseno.md`](docs/01-mecanismo-y-diseno.md) para el detalle
completo de esta decisión y cómo funciona el mecanismo.

## Hardware real utilizado

| Función | Componente |
|---|---|
| Microcontrolador | Seeed XIAO ESP32-C3 |
| Driver de motor | DRV8833 (puente H dual, UNIT Electronics) |
| Motor | NEMA17 (bipolar, 4 hilos) |
| Fuente de poder | Wanptek DPS305U (0–30V/5A ajustable, usada a 8V / límite 1A en modo C.C) |
| Reservorio | Jeringa SensiMedical 60 mL Luer-Lock |
| Mecánica | Varilla roscada M8, rodamientos 608-2RS, piezas impresas propias |

> Nota: el plan original contemplaba Arduino/Raspberry Pi + A4988/DRV8825/TMC2209 de forma
> genérica (ver `docs/02-bom.md`); en la práctica se usó lo que ya se tenía disponible en el
> laboratorio (XIAO ESP32-C3 + DRV8833). El firmware está escrito para ese hardware específico.

## Estructura del repositorio

```
lve-biofabricacion/
├── firmware/
│   └── lve_control/
│       └── lve_control.ino      # Sketch Arduino para XIAO ESP32-C3 + DRV8833
├── hardware/
│   ├── bom.md                   # Lista de materiales completa (mecánica + electrónica)
│   └── wiring/
│       ├── diagrama_conexiones.svg      # Diagrama de cableado (estático)
│       └── diagrama_interactivo.html    # Mismo diagrama, interactivo (hover/tap por cable)
└── docs/
    ├── 01-mecanismo-y-diseno.md  # Cómo funciona el LVE y por qué se simplificó
    ├── 02-bom.md                 # (symlink lógico a hardware/bom.md, ver ahí)
    ├── 03-calibracion.md         # Fórmulas de pasos/mm y flujo volumétrico
    ├── 04-plan-de-build.md       # Plan de armado día por día
    └── 05-troubleshooting.md     # Problemas reales encontrados y cómo se resolvieron
```

## Quick start — firmware

1. Abre `firmware/lve_control/lve_control.ino` en Arduino IDE.
2. Tools → Board → **XIAO_ESP32C3** (paquete ESP32 de Espressif instalado vía Boards Manager).
3. Tools → Port → selecciona el puerto de la XIAO.
4. Sube el sketch.
5. Abre el Serial Monitor (115200 baud, terminador "Newline"). Comandos:
   - `e<pasos>` — extruye
   - `r<pasos>` — retrae
   - `v<ms>` — ajusta velocidad (delay entre micro-pasos)

Ver el diagrama de cableado antes de energizar: `hardware/wiring/diagrama_interactivo.html`
(ábrelo en cualquier navegador, no necesita servidor).

## Roadmap: interfaz de control

Pendiente de diseño, pero el firmware ya expone un protocolo simple por Serial (`e`, `r`, `v`)
pensado para conectarse después a:

- **Web Serial API** desde un frontend en React + Vite hablando directo al puerto, o
- Un puente en **FastAPI** que hable serial (`pyserial`) y exponga una API REST/WebSocket hacia
  el frontend — permitiría además loguear corridas de extrusión en Postgres para análisis
  posterior.

Nada de esto está implementado todavía; se documenta aquí para no perder el hilo cuando se
retome.

## Referencia

Pusch, K., Hinton, T.J., Feinberg, A.W. *"Large volume syringe pump extruder for desktop 3D
printers."* HardwareX 3 (2018) 49–61. Archivos CAD/STL del diseño original (CC-BY-SA 4.0):
https://3dprint.nih.gov/discover/3dpx-008366
