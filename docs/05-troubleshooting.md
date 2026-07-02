# Troubleshooting — problemas reales y cómo se resolvieron

Registro de los problemas encontrados durante el armado de la electrónica, para no repetir el
mismo diagnóstico si el sistema se vuelve a montar o si alguien más retoma el proyecto.

## 1. Pin EEP (sleep) del DRV8833 flotante

El módulo DRV8833 (UNIT Electronics) tiene un pin `EEP` que pone el driver en modo de bajo
consumo cuando está en 0 lógico. Junto a ese pin hay un jumper de soldadura `J1` que, en algunos
lotes, viene puenteando `EEP` a VCC o GND de fábrica.

**Se verificó con multímetro** (modo continuidad, EEP↔VCC y EEP↔GND, sin nada más conectado):
ninguna de las dos hizo continuidad → el pin estaba flotando.

**Solución:** cablear `EEP` directo al `3V3` del microcontrolador para forzar el driver a estar
siempre despierto. Sin este cable, el driver puede quedarse dormido de forma intermitente.

## 2. El DRV8833 no tiene limitación de corriente propia

A diferencia de drivers como A4988/DRV8825/TMC2209 (que sí tienen chopper con pines VREF/sense),
este módulo DRV8833 específico solo expone `VCC, GND, IN1-4, OUT1-4, EEP, ULT(FAULT)` — sin
forma de fijar un límite de corriente en el propio driver.

**Síntoma observado:** al mandar el primer comando de extrusión con la fuente en modo **OCP**
(over-current protection = corte total), el motor se movió ligeramente y luego la fuente cortó
la salida por completo, mostrando "OCP" en pantalla.

**Causa:** sin chopper, la corriente que jala cada bobina depende solo de V÷R de la bobina, sin
nada que la module. En el instante de energizar, la corriente sube de golpe por encima del
límite configurado (1A) — y en modo OCP la fuente corta en vez de regular.

**Solución:** usar el switch de la fuente en modo **C.C** (constant current), no OCP. En C.C, al
llegar al límite de corriente la fuente **regula bajando el voltaje** para sostener ese límite,
en vez de cortar. Con un driver sin chopper, la fuente misma actúa como el limitador de corriente
del sistema.

## 3. Identificación de pares de bobinas del motor

Los 4 cables del NEMA17 no tienen un código de color universal entre fabricantes. Antes de
conectar, se debe medir continuidad entre pares de cables con multímetro — dos cables que hacen
continuidad entre sí (típicamente unos pocos Ω) forman una bobina.

*Pendiente:* esta verificación específica para el motor usado en este build **no se ha
confirmado todavía** — quedó identificada solo visualmente por color. Confirmar antes de la
siguiente sesión de pruebas.

## 4. Elección de rodamiento 608-2RS sobre 608-ZZ

Mismo tamaño y función, pero 608-2RS tiene sellos de hule (más herméticos) en vez de tapas
metálicas. Se eligió 2RS por el ambiente de laboratorio, donde hay biomateriales líquidos y
riesgo de salpicaduras que podrían entrar a un rodamiento con tapa metálica no hermética.
