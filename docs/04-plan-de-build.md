# Plan de armado

Plan original de 6-7 días para llegar de "diseño" a "prueba con biomaterial real". Marcar cada
etapa conforme se complete.

| Día | Actividad | Estado |
|---|---|---|
| 1 | Definir piezas a diseñar/imprimir (medir motor, varilla, jeringa). Mandar a imprimir base + bloque empujador + collar. Conseguir electrónica y ferretería en paralelo | ✅ |
| 2 | Armar banco de pruebas de electrónica (driver + microcontrolador + fuente) en protoboard, sin mecánica todavía. Probar firmware moviendo el motor en vacío | ✅ |
| 3 | Recoger piezas impresas. Ensamblar mecánica: tuerca en bloque empujador, varilla + rodamientos, acople motor-varilla | ✅ |
| 4 | Montar jeringa, conectar manguera/aguja. Calibrar corriente del driver (fuente en modo C.C, no OCP — ver troubleshooting). Purgar el sistema con agua/jabón y validar que no hay fugas ni atascos mecánicos | 🔲 |
| 5 | Prueba con el biomaterial real a velocidad baja. Ajustar velocidad/torque/calibre de aguja según resultados | 🔲 |
| 6–7 (colchón) | Ajustes finos, documentar resultados (video de la extrusión, medir consistencia), decidir si esto valida seguir por este camino para el rediseño completo de la impresora | 🔲 |

## Notas de avance

- El cableado se verificó pin por pin con multímetro antes de energizar (ver
  `docs/05-troubleshooting.md`) — vale la pena repetir esa disciplina en cualquier reconstrucción
  futura del sistema.
- Falta confirmar con multímetro qué par de cables del motor corresponde a Bobina A y cuál a
  Bobina B (están identificados visualmente por color pero no verificados por continuidad).
