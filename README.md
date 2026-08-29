# SOLUTION DETECTIVE

Microjuego web educativo mobile-first para investigar los tipos de solución en programación lineal.

## Nombre

**SOLUTION DETECTIVE**

Subtítulo: **Investiga el tipo de solución**

## Concepto académico

La actividad refuerza la identificación visual de los cuatro tipos de solución del método gráfico:

- **Solución óptima:** satisface todas las restricciones y optimiza la función objetivo (F.O.).
- **Solución múltiple:** existen 2 o más soluciones óptimas que proporcionan el mismo valor de la F.O.
- **Solución no acotada:** la región crece indefinidamente.
- **Solución no factible:** no existe solución factible.

La fuente académica principal es el material **Gimnasio 2. Modelos de Programación Lineal**, Optimización I, en la sección **Tipos de Solución en la Programación Lineal** y sus ejemplos de las páginas 45 a 47. Los modelos usados en los casos corresponden a los ejemplos del material; también se incluye como variante un ejercicio de la página 43.

## Mecánica

1. Se abre un expediente.
2. En cada ronda se presentan cuatro casos, uno de cada tipo de solución.
3. El jugador observa la mini gráfica, lee el modelo y sella una respuesta.
4. Después de cada sello aparece una retroalimentación breve.
5. El cierre muestra el puntaje, el tiempo y el repaso de los cuatro tipos.

## Tiempo estimado

Una partida dura aproximadamente **50 a 90 segundos** y tiene **4 casos**. El orden de los casos y algunas variantes cambian al investigar otra vez.

## Despliegue

El sitio es estático y se despliega automáticamente en GitHub Pages mediante `.github/workflows/pages.yml` cada vez que se actualiza la rama `main`.

Para publicarlo en un repositorio nuevo:

```bash
gh repo create solution-detective --public --source . --push
```

Después de que finalice el workflow, la URL tendrá este formato:

```text
https://USUARIO.github.io/solution-detective/
```

En el repositorio, revisar **Settings > Pages** para confirmar que la fuente sea **GitHub Actions**.

## Estructura

- `index.html`: estructura de portada, casos y cierre.
- `styles.css`: identidad visual de expediente, diseño mobile-first y accesibilidad.
- `data.js`: tipos, modelos, gráficas y retroalimentación académica.
- `script.js`: flujo del juego, renderizado SVG, timer y audio Web Audio.
- `assets/`: favicon del juego.
- `.github/workflows/pages.yml`: autodeploy de GitHub Pages.

## Tecnología

HTML, CSS y JavaScript vanilla. Las mini gráficas se dibujan como SVG y los efectos de sonido se generan localmente con Web Audio API, sin dependencias externas.

## Accesibilidad

Incluye botones HTML reales, labels y anuncios para lector de pantalla, foco visible, contraste alto, áreas táctiles amplias, funcionamiento sin hover y soporte para `prefers-reduced-motion`.
