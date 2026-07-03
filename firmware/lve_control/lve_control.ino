// LVE — Control del NEMA17 vía DRV8833 desde XIAO ESP32-C3
// Extrusor de jeringa — prueba de validación de extrusión
//
// Cableado (ya armado):
//   D0 -> IN1   D1 -> IN2   D2 -> IN3   D3 -> IN4
//   3V3 -> EEP  (EEP estaba flotante, se confirmó con multímetro)
//   GND común entre XIAO, DRV8833 y la fuente
//   D4 -> resistencia 220ohm -> LED azul (+) -> LED (-) -> GND
//         (LED indicador: encendido mientras el motor está en operación)
//
// Protocolo Serial (115200 baud, line ending: Newline):
//   e<pasos>  -> extruye              (ej: e200)
//   r<pasos>  -> retrae               (ej: r200)
//   v<ms>     -> velocidad, delay entre micro-pasos (ej: v5)
//   s         -> STOP: aborta el movimiento en curso
//   p         -> imprime la posición actual
// Respuestas: "POS <n>" tras cada movimiento/consulta, seguido de "Listo."
// (el puente FastAPI parsea "POS " para la posición y usa "Listo." como fin de comando)

const int IN1 = D0;
const int IN2 = D1;
const int IN3 = D2;
const int IN4 = D3;

const int LED_PIN = D4;  // LED azul indicador de operación (D4 -> resistencia 220ohm -> LED -> GND)

// Secuencia de paso completo (full-step), motor bipolar
const int SEQ_LEN = 4;
const bool secuencia[SEQ_LEN][4] = {
  {1, 0, 1, 0},
  {0, 1, 1, 0},
  {0, 1, 0, 1},
  {1, 0, 0, 1}
};

int stepDelayMs = 5;   // delay entre micro-pasos; sube el número para ir más lento
long posicion = 0;     // pasos netos acumulados (e = +, r = -), en unidades del comando
bool detener = false;  // se pone true cuando llega 's' durante un movimiento

void escribirPaso(int a1, int a2, int b1, int b2) {
  digitalWrite(IN1, a1);
  digitalWrite(IN2, a2);
  digitalWrite(IN3, b1);
  digitalWrite(IN4, b2);
}

void reportarPosicion() {
  Serial.print("POS ");
  Serial.println(posicion);
}

// direccion: 1 = extruir, -1 = retraer
void step(int direccion, int pasos) {
  detener = false;
  digitalWrite(LED_PIN, HIGH);  // en operación
  for (int p = 0; p < pasos; p++) {
    // Chequeo de stop: durante el movimiento lo único que manda el host es 's'.
    // Con stepDelayMs=5 esto se evalúa ~cada 20 ms -> aborto responsivo.
    if (Serial.available()) {
      char c = Serial.read();
      if (c == 's' || c == 'S') detener = true;
    }
    if (detener) break;

    for (int i = 0; i < SEQ_LEN; i++) {
      int idx = (direccion == 1) ? i : (SEQ_LEN - 1 - i);
      escribirPaso(secuencia[idx][0], secuencia[idx][1], secuencia[idx][2], secuencia[idx][3]);
      delay(stepDelayMs);
    }
    posicion += direccion;
  }
  escribirPaso(0, 0, 0, 0);  // apaga bobinas al terminar, evita calentamiento en reposo
  digitalWrite(LED_PIN, LOW);  // fin de operación
}

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.begin(115200);
  delay(300);
  Serial.println("LVE listo. Comandos por Serial Monitor (line ending: Newline):");
  Serial.println("  e<pasos>  -> extruye   (ej: e200)");
  Serial.println("  r<pasos>  -> retrae    (ej: r200)");
  Serial.println("  v<ms>     -> velocidad, delay entre micro-pasos (ej: v5)");
  Serial.println("  s         -> STOP (aborta el movimiento en curso)");
  Serial.println("  p         -> posicion actual");
  reportarPosicion();
}

void loop() {
  if (!Serial.available()) return;

  String linea = Serial.readStringUntil('\n');
  linea.trim();
  if (linea.length() < 1) return;

  char cmd = linea.charAt(0);

  // Comandos sin argumento.
  // Nota: si 's' llega DURANTE un movimiento, lo consume step() (no llega aquí);
  // este handler solo aplica cuando el motor ya está en reposo.
  if (cmd == 's' || cmd == 'S') {
    Serial.println("STOP");
    reportarPosicion();
    Serial.println("Listo.");
    return;
  }
  if (cmd == 'p' || cmd == 'P') {
    reportarPosicion();
    Serial.println("Listo.");
    return;
  }

  // Comandos con argumento numérico.
  if (linea.length() < 2) {
    Serial.println("Comando no reconocido. Usa e<pasos>, r<pasos>, v<ms>, s o p.");
    return;
  }
  int valor = linea.substring(1).toInt();

  if (cmd == 'e') {
    Serial.print("Extruyendo "); Serial.print(valor); Serial.println(" pasos...");
    step(1, valor);
    reportarPosicion();
    Serial.println("Listo.");
  } else if (cmd == 'r') {
    Serial.print("Retrayendo "); Serial.print(valor); Serial.println(" pasos...");
    step(-1, valor);
    reportarPosicion();
    Serial.println("Listo.");
  } else if (cmd == 'v') {
    stepDelayMs = valor;
    Serial.print("Velocidad ajustada: "); Serial.print(valor); Serial.println(" ms entre micro-pasos");
    Serial.println("Listo.");
  } else {
    Serial.println("Comando no reconocido. Usa e<pasos>, r<pasos>, v<ms>, s o p.");
  }
}
