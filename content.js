browser.runtime.onMessage.addListener((request) => {
    if (request.action === "copyContent") {
        const viewerDiv = document.querySelector("div.viewer");

        if (viewerDiv) {
            // Búsqueda de los encabezados usando las clases de Tailwind específicas del sitio
            const headers = document.querySelectorAll(
                "span.flex.h-6.items-center.overflow-hidden.text-ellipsis.text-left.w-40.lg",
            );

            let headerText = "";

            // Verificamos si encontramos los elementos (generalmente [0] es Sección, [1] es Lección)
            if (headers.length > 0) {
                const section = headers[0] ? headers[0].textContent.trim() : "";
                const lesson = headers[1] ? headers[1].textContent.trim() : "";

                // Formato: "CH1: Intro - L5: Python?" seguido de saltos de línea
                headerText = `${section} - ${lesson}\n\n`;
            }

            // Concatenamos el texto del encabezado con el HTML crudo del visor
            const finalPayload = headerText + viewerDiv.innerHTML;

            navigator.clipboard
                .writeText(finalPayload)
                .then(() => {
                    console.log("Contenido copiado: Encabezados + HTML");
                })
                .catch((err) => {
                    console.error("Error al copiar al portapapeles:", err);
                });
        }
    }
});
