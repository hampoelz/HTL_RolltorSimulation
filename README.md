# 🚧 Rolltor Simulation
ℹ Eine kleine Aufgabenstellung der [HTL Weiz](https://htlweiz.at/), bei der ein Rolltor gesteuert werden soll.

**➡ Die Simulation kann unter [/simulation.html](https://hampoelz.github.io/RolltorSimulation/simulation.html) gefunden werden.**

✔ Die Steuerung sollte auf einem Arduino stattfinden. Deshalb wurde bei der Simulation ein Webworker eingesetzt, um eine Endlosschleife zu verwirklichen. Ohne Webworker würde die Rolltor-Steuerung im UI Thread ausgeführt werden und die Simulation würde einfrieren, da die Schleife den Haupt-Thread blockiert. 

🤔 _Die Steuerung könnte natürlich auch um einiges einfacher mit einem Intervall im UI Thread verwirklicht werden. Allerdings würde dabei der Browser die Zyklen steuern und die Steuerungs-Funktion würde alle x Millisekunden wiederholt werden. Dadurch würde die Steuerung nicht gleichermaßen ausgeführt werden, wie beispielsweise bei einem Arduino._

## Aufgabenstellung
Ein Rolltor soll gesteuert werden.

Das Rolltor wird mit 2 Ausgängen angesteuert: „Motor_Auf“ und „Motor_Zu“. Hardwaretechnisch befindet sich an den Ausgängen eine Wendeschützschaltung mit Selbstverriegelung.

Zwei Entschalter „ES_oben“ und „ES_unten“ schalten den Motor ab wenn das Tor vollständig geöffnet bzw. geschlossen ist.

Eine Lichtschranke im Tor erkennt ein durchfahrendes Fahrzeug. Sollte das Tor nicht vollständig geöffnet sein, öffnet sich das Tor. Das Schließen des Tores erfolgt bei wieder freier Lichtschranke ein paar Sekunden zeitverzögert.

Folgende Taster sollen für die Bedienung zur Verfügung stehen:

„Taster_Auf“: Wird der Taster kurz betätigt, öffnet sich das Tor. Sollte die Lichtschranke 10 Sekunden lang nicht unterbrochen werden schließt sich das Tor wieder.
„Taster_Stop“: Wird der Taster kurz betätigt verharrt das Tor in seiner aktuellen Position
„Taster_Zu“: Wird der Taster kurz betätigt schließt sich das Tor vollständig.

## Screenshot
![Rolltor Simulation](https://raw.github.com/hampoelz/RolltorSimulation/master/screenshot.png)

---

<p align="center">
  Made with ❤️ by Rene Hampölz
  <br><br>
  <a href="https://github.com/hampoelz"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://www.instagram.com/rene_hampi/"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"></a>
  <a href="https://twitter.com/rene_hampi/"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"></a>
</p>
