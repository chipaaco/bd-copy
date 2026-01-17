browser.runtime.onMessage.addListener((request) => {
    if (request.action === "copyContent") {
        const viewerDiv = document.querySelector("div.viewer");

        if (viewerDiv) {
            // 1. Obtener encabezados (Sección y Lección)
            const headers = document.querySelectorAll(
                "span.flex.h-6.items-center.overflow-hidden.text-ellipsis.text-left.w-40.lg",
            );
            let headerText = "";

            if (headers.length > 0) {
                const section = headers[0] ? headers[0].textContent.trim() : "";
                const lesson = headers[1] ? headers[1].textContent.trim() : "";
                headerText = `${section} - ${lesson}\n\n`;
            }

            // 2. Limpiar el HTML
            const cleanHtml = getCleanHtml(viewerDiv);

            // 3. Concatenar y copiar
            const finalPayload = headerText + cleanHtml;

            navigator.clipboard
                .writeText(finalPayload)
                .then(() => {
                    console.log("Contenido limpio copiado exitosamente.");
                })
                .catch((err) => {
                    console.error("Error al copiar:", err);
                });
        }
    }
});

/**
 * Genera una versión limpia del HTML manteniendo solo etiquetas de contenido
 * y atributos permitidos.
 */
function getCleanHtml(originalNode) {
    // Lista blanca de atributos permitidos
    const include_stuff = ["href", "src", "alt", "title", "target", "controls"];

    // Etiquetas que se eliminarán por completo (su contenido tampoco sirve para apuntes de texto)
    const tagsToRemove = ["script", "style", "svg", "path", "circle", "button"];

    // Clonamos el nodo para no modificar la página web real visible
    const clone = originalNode.cloneNode(true);

    // A. Eliminar etiquetas basura
    tagsToRemove.forEach((tagName) => {
        const elements = clone.querySelectorAll(tagName);
        elements.forEach((el) => el.remove());
    });

    // B. Limpiar atributos en todos los elementos restantes
    const allElements = clone.querySelectorAll("*");

    allElements.forEach((el) => {
        // Convertimos a array para poder iterar y borrar sin conflictos
        const attrs = Array.from(el.attributes);

        attrs.forEach((attr) => {
            if (!include_stuff.includes(attr.name.toLowerCase())) {
                el.removeAttribute(attr.name);
            }
        });

        // Opcional: Si una etiqueta queda vacía de atributos y contenido (como un div vacío), se podría borrar,
        // pero por seguridad mantenemos la estructura semántica.
    });

    // Retornamos el HTML limpio, eliminando espacios en blanco excesivos al inicio/final
    return clone.innerHTML.trim();
}
