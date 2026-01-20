browser.runtime.onMessage.addListener((request) => {
    if (request.action === "copyContent") {
        const viewerDiv = document.querySelector("div.viewer");

        if (viewerDiv) {
            // 1. Extracción de encabezados (Sección y Lección)
            const headers = document.querySelectorAll(
                "span.flex.h-6.items-center.overflow-hidden.text-ellipsis.text-left.w-40.lg",
            );
            let headerText = "";

            if (headers.length > 0) {
                const section = headers[0] ? headers[0].textContent.trim() : "";
                const lesson = headers[1] ? headers[1].textContent.trim() : "";
                // headerText = `${section} - ${lesson}\n\n`;
                headerText = `${lesson}\n\n`;
            }

            // 2. Limpieza del HTML
            const cleanHtml = getCleanHtml(viewerDiv);

            // 3. Concatenación y copiado
            const finalPayload = headerText + cleanHtml;

            navigator.clipboard
                .writeText(finalPayload)
                .then(() => {
                    showNotification("¡Contenido copiado al portapapeles!");
                })
                .catch((err) => {
                    console.error("Error al copiar:", err);
                    showNotification("Error al copiar", true);
                });
        } else {
            showNotification("No se encontró el contenido de la lección", true);
        }
    }
});

/**
 * Muestra una notificación visual temporal en la pantalla
 */
function showNotification(message, isError = false) {
    // Crear elemento
    const notification = document.createElement("div");

    // Estilos visuales (inline para evitar CSS externo)
    notification.innerText = message;
    Object.assign(notification.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 24px",
        backgroundColor: isError ? "#ef4444" : "#10b981", // Rojo / Verde
        color: "#ffffff",
        borderRadius: "8px",
        zIndex: "999999", // Por encima de todo
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: "600",
        fontSize: "14px",
        pointerEvents: "none", // Permite clics debajo
        opacity: "0",
        transition: "opacity 0.3s ease-in-out",
        transform: "translateY(-10px)", // Pequeña animación de entrada
    });

    document.body.appendChild(notification);

    // Animación de entrada
    requestAnimationFrame(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
    });

    // Retirar notificación después de 1.5 segundos
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-10px)";
        setTimeout(() => notification.remove(), 300);
    }, 1500);
}

/**
 * Limpia el HTML de atributos y etiquetas no deseados
 */
function getCleanHtml(originalNode) {
    const include_stuff = ["href", "src", "alt", "title", "target", "controls"];
    const tagsToRemove = [
        "script",
        "style",
        "svg",
        "path",
        "circle",
        "button",
        "iframe",
    ];

    const clone = originalNode.cloneNode(true);

    // Eliminar etiquetas basura
    tagsToRemove.forEach((tagName) => {
        clone.querySelectorAll(tagName).forEach((el) => el.remove());
    });

    // Limpiar atributos
    clone.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
            if (!include_stuff.includes(attr.name.toLowerCase())) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return clone.innerText.trim();
}
