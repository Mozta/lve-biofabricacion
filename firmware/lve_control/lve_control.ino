// LVE — Control del NEMA17 vía DRV8833 desde XIAO ESP32-C3
// Extrusor de jeringa — prueba de validación de extrusión
//
// Cableado (ya armado):
//   D0 -> IN1   D1 -> IN2   D2 -> IN3   D3 -> IN4
//   3V3 -> EEP  (EEP estaba flotante, se confirmó con multímetro)
//   GND común entre XIAO, DRV8833 y la fuente

const int IN1 = D0;
const int IN2 = D1;
const int IN3 = D2;
const int IN4 = D3;

// Secuencia de paso completo (full-step), motor bipolar
const int SEQ_LEN = 4;
const bool secuencia[SEQ_LEN][4] = {
  {1, 0, 1, 0},
  {0, 1, 1, 0},
  {0, 1, 0, 1},
  {1, 0, 0, 1}
};

int stepDelayMs = 5;  // delay entre micro-pasos; sube el número para ir más lento

void escribirPaso(int a1, int a2, int b1, int b2) {
  digitalWrite(IN1, a1);
  digitalWrite(IN2, a2);
  digitalWrite(IN3, b1);
  digitalWrite(IN4, b2);
}

// direccion: 1 = extruir, -1 = retraer
void step(int direccion, int pasos) {
  for (int p = 0; p < pasos; p++) {
    for (int i = 0; i < SEQ_LEN; i++) {
      int idx = (direccion == 1) ? i : (SEQ_LEN - 1 - i);
      escribirPaso(secuencia[idx][0], secuencia[idx][1], secuencia[idx][2], secuencia[idx][3]);
      delay(stepDelayMs);
    }
  }
  escribirPaso(0, 0, 0, 0);  // apaga bobinas al terminar, evita calentamiento en reposo
}

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  Serial.begin(115200);
  delay(300);
  Serial.println("LVE listo. Comandos por Serial Monitor (line ending: Newline):");
  Serial.println("  e<pasos>  -> extruye   (ej: e200)");
  Serial.println("  r<pasos>  -> retrae    (ej: r200)");
  Serial.println("  v<ms>     -> velocidad, delay entre micro-pasos (ej: v5)");
}

void loop() {
  if (Serial.available()) {
    String linea = Serial.readStringUntil('\n');
    linea.trim();
    if (linea.length() < 2) return;

    char cmd = linea.charAt(0);
    int valor = linea.substring(1).toInt();

    if (cmd == 'e') {
      Serial.print("Extruyendo "); Serial.print(valor); Serial.println(" pasos...");
      step(1, valor);
      Serial.println("Listo.");
    } else if (cmd == 'r') {
      Serial.print("Retrayendo "); Serial.print(valor); Serial.println(" pasos...");
      step(-1, valor);
      Serial.println("Listo.");
    } else if (cmd == 'v') {
      stepDelayMs = valor;
      Serial.print("Velocidad ajustada: "); Serial.print(valor); Serial.println(" ms entre micro-pasos");
    } else {
      Serial.println("Comando no reconocido. Usa e<pasos>, r<pasos> o v<ms>.");
    }
  }
}
