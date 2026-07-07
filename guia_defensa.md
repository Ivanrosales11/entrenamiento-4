# 📘 Guía de Estudio y Defensa — Juego Batalla Pokémon

Esta guía explica detalladamente la arquitectura, el flujo del juego, el funcionamiento de cada botón y los conceptos clave de JavaScript que implementamos. Está diseñada para que puedas leerla y usarla como base para explicar tu código en la defensa del entrenamiento.

---

## 1. Estructura general (Arquitectura de Módulos)

El código está dividido en **módulos** usando la directiva `type="module"` en el HTML. Esto significa que cada archivo `.js` tiene su propio espacio de nombres cerrado (ámbito privado) y comparte información únicamente mediante `export` (exportar) e `import` (importar).

```
index.html ──► js/script.js (Orquestador principal)
                   ├── js/storage.js   (Manejo de LocalStorage)
                   ├── js/inicio.js    (Pantalla de tarjetas y edición)
                   └── js/combate.js   (Lógica de turnos y pelea)
```

---

## 2. Flujo paso a paso y funcionamiento de Botones

### Paso A: El arranque de la página
Cuando la página carga, se ejecuta `js/script.js`, que dispara el inicio:

1. **`inicializarStorage()` (en `storage.js`):**
   * Hace un bucle `for` del `0` al `3` (por los 4 pokémon en `pokemons.js`).
   * Revisa si existe la clave `pokemon_0`, `pokemon_1`, etc., en `localStorage`.
   * **Si no existe:** Guarda un objeto inicial con el nombre original, sus poderes base y las estadísticas en cero (`combates: 0, ganados: 0, perdidos: 0`).
   * **Si ya existe:** Carga el nombre y poderes editados de ese pokémon al array en memoria para mantener los cambios de sesiones anteriores.
2. **`inicializarInicio()` (en `inicio.js`):**
   * Pinta en el HTML la imagen (obtenida de la URL de la PokeAPI mediante `urlImagen(i)`) y el nombre en cada tarjeta.
   * Agrega los listeners (escuchadores de eventos) a los elementos visuales de la vista de inicio.

---

### Paso B: La selección del Pokémon
* **Los Radio Buttons (`input[name="pokemon-seleccionado"]`):**
  Al tildar uno, se dispara la función `alSeleccionarPokemon()`. Guarda el índice del pokémon elegido en la variable `pokemonSeleccionado` y **habilita** el botón "Combatir" (`disabled = false`).
* **Botón "Combatir":**
  Al hacerle click, se dispara la función callback `alCombatir(indice)`. Esta función oculta la vista de inicio, muestra la vista de combate y llama a `iniciarCombate()` en `combate.js`.

---

### Paso C: El modal "Ver / Editar"
Cada tarjeta tiene su propio botón "Ver".

1. **Botón "Ver" (`.btn-ver`):**
   * Dispara `abrirModal(indice)`.
   * Lee la información actualizada del pokémon en memoria.
   * Llama a `leerStorage(indice)` para obtener las estadísticas actuales (combates, ganados, perdidos) y las pinta en el párrafo `#modal-stats`.
   * Llena todos los campos de texto (`<input>`) del modal con el nombre y los 3 poderes (nombre, usos y daño).
   * Remueve la clase `.oculto` para hacer visible el modal.
2. **Botón "Guardar" (`#btn-guardar`):**
   * Guarda los nuevos valores que escribió el usuario en el array en memoria.
   * **Validación anti-NaN (campos vacíos):** Usa `parseInt()` para leer los números de usos y daño. Si el usuario dejó el campo vacío, `parseInt()` devuelve `NaN` (Not a Number). Usamos `Number.isNaN()` para verificar esto: si es NaN, conservamos el valor anterior; de lo contrario, aplicamos el nuevo número.
   * Llama a `guardarStorage(indice)` para persistir estos cambios en el `localStorage`.
   * Actualiza el nombre impreso en la tarjeta del menú principal.
   * Oculta el modal de nuevo.
3. **Botón "Cerrar" (`#btn-cerrar-ver`):**
   * Simplemente oculta el modal sin tocar los datos.

---

### Paso D: La pantalla de Combate y Turnos
Al iniciar el combate se ejecuta `iniciarCombate()`:

1. **Sorteo del Rival:** Un bucle `do-while` selecciona un índice aleatorio del 0 al 3. La condición del bucle garantiza que el rival sorteado sea **diferente** al que elegiste tú.
2. **Clonación (`clonarParaCombate`):** Crea copias frescas de los objetos pokémon. Esto es fundamental para que la vida y los usos de los poderes se consuman **únicamente durante este combate** sin alterar los valores guardados en el disco o en la memoria global.
3. **Sorteo del Turno:** `Math.random() < 0.5` da un 50% de probabilidad de arrancar tú o el rival. El botón `#btn-lanzar-poder` se deshabilita visualmente con `.disabled = true` si arranca el rival.
4. **Turno del Usuario (Tu turno):**
   * Hacés click en **"Lanzar poder"**: Antes de abrir el modal, el código verifica si te queda algún poder con usos mayores a 0. Si no te quedan poderes, perdés de forma automática. Si te quedan, se abre el modal mostrando los 3 botones con la información actualizada. Los botones de poderes sin usos quedan deshabilitados individuales.
   * Seleccionás un poder: Se resta 1 uso, se calcula el daño al rival (`Math.max(0, vidaRival - poder.energia)` para no tener vida negativa) y se dispara la animación de golpe.
   * **Animación:** Se agrega la clase CSS `.animacion-ataque` a la imagen. Un `setTimeout` de 500ms remueve la clase y, si el rival sigue con vida, le pasa el turno desactivando tu botón de ataque.
5. **Turno del Rival (Automático):**
   * El código filtra los poderes del rival para ver cuáles tienen usos disponibles.
   * Si no tiene ninguno, el rival pierde inmediatamente.
   * Si tiene, elige uno de manera aleatoria con `Math.random()`, resta el uso, actualiza la vida del usuario y aplica la animación.
   * **El Fix del Botón:** Tu botón "Lanzar poder" solo se vuelve a habilitar **dentro del setTimeout de 500ms**, cuando la animación del golpe del rival termina. Esto evita que puedas clickear "anticipadamente".
6. **Botón "Rendirse":** Termina el combate inmediatamente, dándole la victoria al rival y actualizando las estadísticas.

---

### Paso E: Fin del Combate
Se dispara `terminarCombate(ganador, perdedor)`:

1. **`actualizarStats(ganador, perdedor)` (en `storage.js`):**
   * Suma `+1` combate y `+1` ganado al ganador en el `localStorage`.
   * Suma `+1` combate y `+1` perdido al perdedor en el `localStorage`.
2. **Modal de resultado:** Se actualiza el emoji (🏆 para victoria, 😞 para derrota), el título y la descripción, y se abre el modal `#modal-resultado`.
3. **Botón "Volver al inicio":**
   * Oculta el modal de resultados y la pantalla de combate.
   * Limpia la selección previa del menú de inicio (deselecciona los radios y deshabilita el botón "Combatir").
   * Muestra la pantalla principal.

---

## 3. ¿Cómo funciona el LocalStorage unificado?

Para almacenar la información, usamos el método nativo `localStorage.setItem(clave, valor)` y `localStorage.getItem(clave)`.

### El truco del formato JSON
`localStorage` **solo puede almacenar texto plano**. No entiende arrays u objetos complejos de JavaScript directamente.
* Para **guardar** un objeto, usamos `JSON.stringify(objeto)`, que lo transforma en una cadena de texto.
* Para **leer** un objeto, tomamos ese texto y usamos `JSON.parse(texto)`, que lo vuelve a convertir en un objeto manipulable en JS.

### Estructura de almacenamiento
Usamos una única clave por pokémon basada en su posición: `pokemon_0`, `pokemon_1`, `pokemon_2`, `pokemon_3`.

Ejemplo de cómo se ve guardado en el disco:
```json
{
  "nombre": "Charmander",
  "poderes": [
    { "nombre": "Arañazo", "energia": 10, "usos": 4 },
    { "nombre": "Lanzallamas", "energia": 30, "usos": 2 },
    { "nombre": "Dragoaliento", "energia": 25, "usos": 3 }
  ],
  "combates": 5,
  "ganados": 3,
  "perdidos": 2
}
```

> 💡 **Pregunta típica de examen:** ¿Por qué usamos el índice `pokemon_${i}` como clave y no el nombre del pokémon?
> **Respuesta:** Porque el nombre del pokémon es **editable**. Si el usuario edita "Pikachu" y lo renombra a "PikaPika", si usáramos el nombre como clave perderíamos el historial de estadísticas y de poderes. El índice de la tarjeta (`0`, `1`, `2`, `3`) es constante y nunca cambia.

---

## 4. Glosario de Conceptos JS Clave para explicar en la defensa

* **`type="module"` (Módulos):** Permite organizar el código en archivos independientes, importando y exportando variables o funciones específicas. Evita contaminar el ámbito global.
* **Template Literals (Backticks `` ` ``):** Nos permiten concatenar cadenas de texto y variables de manera sencilla usando `${variable}` sin necesidad de usar el operador `+`.
* **Callbacks:** Son funciones que se pasan como argumentos a otras funciones para ser ejecutadas más tarde (por ejemplo, pasamos `mostrarInicio` como el callback `alTerminar` a la función de combate).
* **Clonación Profunda (Deep Copy):** El proceso de copiar las propiedades de un objeto a otro nuevo para evitar que las modificaciones del objeto nuevo afecten al original. Se usa al iniciar el combate para que los usos de los poderes y vida vuelvan a estar al 100% en la siguiente pelea.
* **`setTimeout(funcion, milisegundos)`:** Registra un temporizador que ejecuta la función pasada una vez que transcurre el tiempo especificado. Lo usamos para controlar el flujo de los turnos automáticos del rival y las duraciones de las animaciones.
* **`Number.isNaN(valor)`:** Método que determina si el valor es un tipo `NaN` (Not a Number), lo cual ocurre si intentamos convertir a entero un campo vacío de texto.
