# Mecanismo y decisión de diseño

Basado en: Pusch, K., Hinton, T.J., Feinberg, A.W. *"Large volume syringe pump extruder for
desktop 3D printers"*, HardwareX 3 (2018) 49–61 (Large Volume Extruder, LVE).

## Cómo funciona el mecanismo original

El LVE es un extrusor **Bowden de husillo (leadscrew)**:

1. Un motor **NEMA17** gira un engrane pequeño autocentrante montado en su eje.
2. Ese engrane mueve un engrane grande fijo a una **varilla roscada M8 (leadscrew)**, sostenida
   por dos rodamientos 608ZZ en una pieza llamada "Core".
3. Sobre la varilla viaja un **"nut shuttle"**: dos tuercas de latón comprimidas entre una placa
   atornillada, que avanzan/retroceden según gira el tornillo. Como están "atrapadas" sin
   holgura, el sistema puede **retraer** (revertir dirección del motor) sin perder movimiento —
   eso evita que el material gotee entre movimientos.
4. El nut shuttle empuja el émbolo (3D impreso, reemplazando el de plástico de fábrica) de una
   **jeringa BD de 60 mL Luer-Lock**.
5. La jeringa se conecta vía **manguera de poliuretano (Bowden)** a una **aguja**.
6. El peso de todo el conjunto descansa en el **marco de la impresora**, no en el cabezal que se
   mueve en X/Y — así no se sacrifica velocidad ni se causa vibración pese al volumen grande de
   material.

El parámetro crítico que reporta el paper es **9255.38 pasos/mm** del émbolo — muy alto
comparado con un extrusor FDM típico (~400–800 pasos/mm), lo cual indica que la relación de
engranes da una reducción/multiplicación de torque considerable. Esto importa porque jeringas de
60 mL tienen diámetro de barril grande, así que mover el émbolo requiere más fuerza para generar
presión suficiente al pasar por una aguja angosta — sin ese torque extra, el motor puede patinar
(perder pasos) en vez de empujar.

## Decisión de diseño: versión fiel vs. versión rápida

| | Versión fiel al paper | Versión rápida (la que se construyó) |
|---|---|---|
| Multiplicación de torque | Engranes herringbone impresos a medida | Motor NEMA17 con caja planetaria integrada / motor comercial |
| Piezas a imprimir | 8 piezas (Core, Plunger, Nut Shuttle, Nut Shuttle Plate, 2 engranes, Syringe Guide, Syringe Collar) | 3 piezas (base/soporte, bloque empujador, abrazadera de jeringa) |
| Émbolo | Reemplazo impreso del émbolo de fábrica | Se reutiliza el émbolo de fábrica de la jeringa |
| Retracción | Nut shuttle de precisión | Firmware controla dirección del motor directamente |
| Integración | Se integra al firmware/motherboard de una impresora existente | Standalone: microcontrolador dedicado (XIAO ESP32-C3) + driver |
| Riesgo de atorarse en fabricación | Alto (tolerancias de engranes) | Bajo |

**Por qué esta decisión importó:** el cuello de botella que estaba frenando el rediseño de la
impresora completa (a cargo del becario) era, con alta probabilidad, la fabricación y ajuste de
los engranes herringbone de precisión. Sustituir esa transmisión por un motor comercial elimina
justo esa complejidad, a cambio de perder algo de la "elegancia open-source todo-impreso" del
diseño original — un intercambio razonable para una prueba de concepto que necesitaba resolverse
en días, no semanas.

## Referencia a los archivos originales

Si en algún punto el proyecto necesita ser más fiel al diseño completo del paper (por ejemplo,
retracción de precisión para imprimir capas y no solo validar extrusión), los archivos STL/CAD
originales del LVE completo (Core, Plunger, Nut Shuttle, engranes, Syringe Guide/Collar, Needle
Adapter, jigs para epoxiar agujas) están listados en:

`https://3dprint.nih.gov/discover/3dpx-008366` (licencia CC-BY-SA 4.0)

Verificar que el enlace siga activo — el paper es de 2018 y los repositorios institucionales a
veces cambian de dirección con el tiempo.
