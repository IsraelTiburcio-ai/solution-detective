(function () {
  "use strict";

  window.SD_TYPES = [
    {
      key: "optima",
      label: "ÓPTIMA",
      name: "Solución óptima",
      className: "optima",
      definition: "Satisface todas las restricciones y optimiza la F.O."
    },
    {
      key: "multiple",
      label: "MÚLTIPLE",
      name: "Solución múltiple",
      className: "multiple",
      definition: "2 o más soluciones óptimas proporcionan el mismo valor de la F.O."
    },
    {
      key: "no-acotada",
      label: "NO ACOTADA",
      name: "Solución no acotada",
      className: "no-acotada",
      definition: "La región crece indefinidamente."
    },
    {
      key: "no-factible",
      label: "NO FACTIBLE",
      name: "Solución no factible",
      className: "no-factible",
      definition: "No existe solución factible."
    }
  ];

  window.SD_CASES = [
    {
      id: "e2-optima",
      type: "optima",
      code: "EXP G2-46-02",
      source: "Ejemplo 2 · pág. 46",
      title: "El vértice atrapado",
      model: {
        objective: "max z = 6x₁ − x₂",
        constraints: ["2x₁ − x₂ ≤ 2", "x₁ ≤ 4", "x₁, x₂ ≥ 0"]
      },
      graph: {
        view: { x: [-1, 7], y: [-3, 9] },
        step: 1,
        xTicks: [2, 4, 6],
        yTicks: [-2, 2, 4, 6, 8],
        regions: [
          {
            points: [[0, 0], [1, 0], [4, 6], [4, 9], [0, 9]],
            openEdges: [[[0, 9], [4, 9]]]
          }
        ],
        lines: [
          { points: [[0, -2], [5.5, 9]], label: "R1", labelAt: [5.35, 7.8] },
          { points: [[4, -3], [4, 9]], label: "R2", labelAt: [4.18, 8.2] }
        ],
        isoLines: [
          { points: [[3.2, 1.2], [4.5, 9]], label: "z = 18", labelAt: [3.48, 3.7] }
        ],
        points: [{ x: 4, y: 6, label: "(4, 6) · z = 18", kind: "star", dx: -1.7, dy: -0.45 }],
        watermark: { x: 5.65, y: 8.05, text: "…", size: 25 }
      },
      feedback: {
        correct: ["Correcto: una única solución optimiza la F.O.", "z = 18 en (4, 6)."],
        incorrect: ["Es solución óptima: un único punto optimiza la F.O.", "z = 18 en (4, 6)."]
      }
    },
    {
      id: "p43-optima",
      type: "optima",
      code: "EXP G2-43-01",
      source: "Ejemplo de la pág. 43",
      title: "La fábrica sospechosa",
      model: {
        objective: "max z = 3x + 2y",
        constraints: ["2x + y ≤ 80", "x + y ≤ 50", "x, y ≥ 0"]
      },
      graph: {
        view: { x: [-5, 60], y: [-8, 62] },
        step: 10,
        xTicks: [10, 20, 30, 40, 50],
        yTicks: [10, 20, 30, 40, 50, 60],
        regions: [{ points: [[0, 0], [40, 0], [30, 20], [0, 50]] }],
        lines: [
          { points: [[5, 70], [45, -10]], label: "R1", labelAt: [42, -4] },
          { points: [[-10, 60], [60, -10]], label: "R2", labelAt: [54, -4] }
        ],
        isoLines: [
          { points: [[10, 50], [46.67, -5]], label: "z = 130", labelAt: [11, 49] }
        ],
        points: [{ x: 30, y: 20, label: "(30, 20) · z = 130", kind: "star", dx: 1.2, dy: -0.8 }]
      },
      feedback: {
        correct: ["Correcto: una única solución optimiza la F.O.", "z = 130 en (30, 20)."],
        incorrect: ["Es solución óptima: un único punto optimiza la F.O.", "z = 130 en (30, 20)."]
      }
    },
    {
      id: "e3-multiple",
      type: "multiple",
      code: "EXP G2-46-03",
      source: "Ejemplo 3 · pág. 46",
      title: "El borde clonado",
      model: {
        objective: "max z = 4x₁ + 14x₂",
        constraints: ["2x₁ + 7x₂ ≤ 21", "7x₁ + 2x₂ ≤ 21", "x₁, x₂ ≥ 0"]
      },
      graph: {
        view: { x: [-0.5, 4.5], y: [-0.5, 4.5] },
        step: 1,
        xTicks: [1, 2, 3, 4],
        yTicks: [1, 2, 3, 4],
        regions: [{ points: [[0, 0], [3, 0], [7 / 3, 7 / 3], [0, 3]] }],
        lines: [
          { points: [[-0.5, 22 / 7], [4.5, 12 / 7]], label: "R1", labelAt: [0.12, 3.25] },
          { points: [[12 / 7, 4.5], [22 / 7, -0.5]], label: "R2", labelAt: [1.9, 4.25] }
        ],
        isoLines: [
          { points: [[-0.5, 22 / 7], [4.5, 12 / 7]], label: "z = 42", labelAt: [0.65, 3.55], overlap: true }
        ],
        segments: [{ points: [[0, 3], [7 / 3, 7 / 3]] }],
        points: [
          { x: 0, y: 3, label: "(0, 3)", kind: "pin", dx: 0.2, dy: -0.32 },
          { x: 7 / 3, y: 7 / 3, label: "(7/3, 7/3)", kind: "pin", dx: 0.18, dy: 0.55 }
        ]
      },
      feedback: {
        correct: ["Correcto: todo el borde da z = 42.", "La F.O. es múltiplo de R1."],
        incorrect: ["Es solución múltiple: el borde da z = 42.", "La F.O. es múltiplo de R1."]
      }
    },
    {
      id: "e1-no-acotada",
      type: "no-acotada",
      code: "EXP G2-46-01",
      source: "Ejemplo 1 · pág. 46",
      title: "La región fugitiva",
      model: {
        objective: "max z = 2x₁ + x₂",
        constraints: ["x₁ − x₂ ≤ 10", "2x₁ − x₂ ≤ 40", "x₁, x₂ ≥ 0"]
      },
      graph: {
        view: { x: [-6, 46], y: [-14, 42] },
        step: 10,
        xTicks: [10, 20, 30, 40],
        yTicks: [-10, 10, 20, 30, 40],
        regions: [
          {
            points: [[0, 0], [10, 0], [30, 20], [41, 42], [0, 42]],
            openEdges: [[[0, 42], [41, 42]]]
          }
        ],
        lines: [
          { points: [[-4, -14], [46, 36]], label: "R1", labelAt: [43, 33] },
          { points: [[13, -14], [41, 42]], label: "R2", labelAt: [38, 36] }
        ],
        isoLines: [
          { points: [[0, 20], [10, 0]], label: "z = 20", labelAt: [0.6, 19.2] },
          { points: [[0, 40], [20, 0]], label: "z = 40", labelAt: [0.8, 38.5] }
        ],
        watermark: { x: 35.7, y: 39, text: "∞", size: 27 }
      },
      feedback: {
        correct: ["Correcto: la región crece sin fin; z → ∞."],
        incorrect: ["Es no acotada: la región crece sin fin.", "z → ∞."]
      }
    },
    {
      id: "e4-no-acotada",
      type: "no-acotada",
      code: "EXP G2-47-04",
      source: "Ejemplo 4 · pág. 47",
      title: "El pasillo infinito",
      model: {
        objective: "max z = 10x₁ + 4x₂",
        constraints: ["x₁ + x₂ ≥ 5", "x₂ = 2", "x₁, x₂ ≥ 0"]
      },
      graph: {
        view: { x: [-0.6, 10], y: [-1, 7] },
        step: 1,
        xTicks: [2, 4, 6, 8],
        yTicks: [2, 4, 6],
        regions: [],
        lines: [
          { points: [[-0.6, 5.6], [5.6, -0.6]], label: "R1", labelAt: [0.4, 4.6] },
          { points: [[-0.6, 2], [10, 2]], label: "R2", labelAt: [8.3, 2.38] }
        ],
        rays: [{ points: [[3, 2], [10, 2]], kind: "feasible" }],
        isoLines: [
          { points: [[1.2, 7], [4.4, -1]], label: "z = 40", labelAt: [1.35, 6.25] },
          { points: [[5.2, 7], [8.4, -1]], label: "z = 80", labelAt: [5.35, 6.25] }
        ],
        points: [{ x: 3, y: 2, label: "inicio", kind: "dot", dx: 0.25, dy: -0.42 }],
        watermark: { x: 8.7, y: 1.15, text: "∞", size: 27 }
      },
      feedback: {
        correct: ["Correcto: el pasillo x₂ = 2 continúa; z → ∞."],
        incorrect: ["Es no acotada: x₂ = 2 continúa sin fin.", "z → ∞."]
      }
    },
    {
      id: "e5-no-factible",
      type: "no-factible",
      code: "EXP G2-47-05",
      source: "Ejemplo 5 · pág. 47",
      title: "Las restricciones en guerra",
      model: {
        objective: "max z = 2x₁ + 3x₂",
        constraints: ["x₁ + x₂ ≥ 5", "x₁ + x₂ ≤ 2", "x₁, x₂ ≥ 0"]
      },
      graph: {
        view: { x: [-0.6, 7], y: [-0.6, 7] },
        step: 1,
        xTicks: [2, 4, 6],
        yTicks: [2, 4, 6],
        regions: [
          { points: [[0, 5], [5, 0], [7, 0], [7, 7], [0, 7]] },
          { points: [[0, 0], [2, 0], [0, 2]] }
        ],
        lines: [
          { points: [[-0.6, 5.6], [5.6, -0.6]], label: "R1", labelAt: [0.18, 5.2] },
          { points: [[-0.6, 2.6], [2.6, -0.6]], label: "R2", labelAt: [0.15, 2.2] }
        ],
        watermark: { x: 3.25, y: 3.6, text: "∅", size: 38 }
      },
      feedback: {
        correct: ["Correcto: no existe región factible.", "≤ 2 y ≥ 5 se contradicen."],
        incorrect: ["Es no factible: las restricciones se contradicen.", "No existe región factible."]
      }
    }
  ];
}());
