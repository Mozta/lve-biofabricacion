# Lista de materiales (BOM)

Adaptada del BOM oficial del paper LVE (Pusch, Hinton & Feinberg, HardwareX 2018), filtrada a lo
que realmente se necesita para la versión simplificada, con proveedores para México.

## Piezas impresas en 3D (diseño propio)

| Pieza | Función | Material/infill recomendado |
|---|---|---|
| Base / marco | Alinea motor, rodamientos, tornillo y jeringa en un solo eje | PLA, 30–40% infill, 3 perímetros |
| Bloque empujador ("pusher block") | Tuerca M8 embebida; se desliza sobre la varilla y empuja el émbolo | PLA, 70–100% infill, mín. 3 perímetros (recibe toda la carga de compresión) |
| Abrazadera/collar de jeringa de 60 mL | Sostiene la jeringa fija para que no se desplace al empujar | PLA, 40–50% infill |
| Soportes de rodamiento | Sostienen los 2 rodamientos que guían la varilla | PLA, 50–70% infill |

## Componentes comprados — mecánica

| Componente | Cantidad | Notas / dónde conseguirlo |
|---|---|---|
| Varilla roscada M8 × 1.25mm, ~300mm | 1 | Ferretería/tlapalería; acero inoxidable si es posible |
| Tuercas M8 (latón o acero) | 2–4 | Ferretería; latón da menos fricción/ruido |
| Rodamientos de bolas **608-2RS** | 2 | Amazon/MercadoLibre. Se eligió 2RS (sello de hule) sobre ZZ (tapa metálica) por el ambiente de laboratorio con biomateriales líquidos y riesgo de salpicaduras |
| Acoplador flexible eje motor → varilla M8 | 1 | Tiendas de impresión 3D/CNC |
| Tornillería M3 (10, 16, 20mm) + tuercas M3 | ~20 pzas | Ferretería/tlapalería |
| Jeringa BD/SensiMedical Luer-Lock 60 mL | 2 (llevar repuesto) | Farmacia grande o distribuidor de material médico, Amazon México/MercadoLibre |
| Manguera de poliuretano 1/8" OD, 1/16" ID | ~30–50cm | Tienda de neumática industrial, o "manguera Bowden PU 4mm/2mm" en tiendas de repuestos de impresión 3D |
| Aguja roma 18G, 4", Luer-Lock hembra | 2–3 (varios calibres) | Proveedores de laboratorio/veterinaria, MercadoLibre ("aguja roma luer lock") |
| Adaptador Luer macho a espiga de manguera 1/16" | 1–2 | Proveedores de laboratorio, MercadoLibre |
| Aguja Luer-Lock calibre 17G | 1 | Proveedores de laboratorio |
| Aguja Luer-Lock calibre 26G (opcional) | — | Solo si además de validar extrusión se quiere probar resolución fina |
| Epoxi reforzado con acero (opcional) | 1 | Solo si se van a unir/alargar dos agujas |
| Loctite azul (threadlocker) 242 | 1 | Evita que las tuercas se aflojen con la vibración del motor |

## Electrónica — lo realmente usado

| Componente | Cantidad | Notas |
|---|---|---|
| Seeed XIAO ESP32-C3 | 1 | Microcontrolador. Pines usados: D0-D3 (control motor), 3V3 (enable driver), GND |
| DRV8833 (puente H dual, UNIT Electronics) | 1 | Sin pines de sense/VREF — no tiene limitación de corriente propia (chopper); el límite de corriente lo pone la fuente de poder en modo C.C |
| NEMA17 bipolar, 4 hilos | 1 | Polaridad de bobinas confirmada por continuidad con multímetro antes de cablear |
| Wanptek DPS305U | 1 | Fuente ajustable 0-30V/5A. Operado a 8V, límite de corriente 1A, **modo C.C** (no OCP — ver `docs/05-troubleshooting.md` para por qué) |

> El plan original (ver `docs/01-mecanismo-y-diseno.md`) contemplaba de forma genérica un
> Arduino/Raspberry Pi + driver A4988/DRV8825/TMC2209 + fuente 12-24V/2A. En la práctica se usó
> el hardware disponible en el laboratorio (XIAO ESP32-C3 + DRV8833 + Wanptek), que funciona
> igual de bien para esta validación pero con matices propios (documentados en troubleshooting).
