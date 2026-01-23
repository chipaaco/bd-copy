browser.runtime.onMessage.addListener((request) => {
    if (request.action === "copyContent") {
        const viewerDiv = document.querySelector("div.viewer");

        if (viewerDiv) {
            // 1. Extracción del Título
            const headers = document.querySelectorAll(
                "span.flex.h-6.items-center.overflow-hidden.text-ellipsis.text-left.w-40.lg",
            );

            let titleText = "";
            if (headers.length > 0) {
                // Usamos el segundo span (Lección) como título principal
                chapter = headers[0] ? headers[0].textContent.trim() : "";
                lesson = headers[1] ? headers[1].textContent.trim() : "";
                titleText = `${chapter} - ${lesson}`;
            }

            // 2. Limpieza del HTML (Obtenemos el nodo procesado)
            const cleanNode = getCleanNode(viewerDiv);

            // 3. Extracción y Procesamiento de Enlaces
            const links = cleanNode.querySelectorAll("a");
            let linksHtmlFooter = "";
            let linksTextFooter = "";

            if (links.length > 0) {
                // Cabecera de la sección de referencias
                linksHtmlFooter = `
                    <br/><br/>
                    <p>References:</p>
                    <ol>`;

                linksTextFooter =
                    "\n\n------------------\nReferencias extraídas:\n";

                links.forEach((link, index) => {
                    const href = link.href; // URL absoluta
                    const text = link.innerText.trim() || href; // Texto o URL si está vacío

                    // Construcción HTML (Estilo gris consistente)
                    linksHtmlFooter += `
                        <li style="margin-bottom: 4px; color: #888888;">
                            <a href="${href}">${href}</a>
                        </li>`;

                    // Construcción Texto Plano
                    linksTextFooter += `${index + 1}. ${text}: ${href}\n`;
                });

                linksHtmlFooter += "</ol>";
            }

            // 4. Construcción de Payloads (HTML y Texto)

            // Payload Texto Plano
            const plainTextPayload =
                (titleText ? titleText + "\n\n" : "") +
                cleanNode.innerText.trim() +
                linksTextFooter;

            // Payload HTML (Envuelto en div gris)
            const htmlContent = cleanNode.innerText;
            const htmlPayload = `
                <div style="color: #888888; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
                    ${titleText ? `<p style="color: #666666;">${titleText}</p><br/><br/>` : ""}
                    ${htmlContent}
                    ${linksHtmlFooter}
                </div>
            `;

            // 5. Escritura en el portapapeles
            const textBlob = new Blob([plainTextPayload], {
                type: "text/plain",
            });
            const htmlBlob = new Blob([htmlPayload], { type: "text/html" });

            navigator.clipboard
                .write([
                    new ClipboardItem({
                        "text/plain": textBlob,
                        "text/html": htmlBlob,
                    }),
                ])
                .then(() => {
                    const count = links.length;
                    showNotification(
                        `¡Copiado! ${count} enlace${count !== 1 ? "s" : ""} procesado${count !== 1 ? "s" : ""}.`,
                    );
                })
                .catch((err) => {
                    console.error("Error al copiar:", err);
                    showNotification("Error al copiar al portapapeles", true);
                });
        } else {
            showNotification("No se encontró el contenido de la lección", true);
        }
    }
});

/**
 * Muestra una notificación visual temporal
 */
function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.innerText = message;
    Object.assign(notification.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "12px 24px",
        backgroundColor: isError ? "#ef4444" : "#10b981",
        color: "#ffffff",
        borderRadius: "8px",
        zIndex: "999999",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: "600",
        fontSize: "14px",
        pointerEvents: "none",
        opacity: "0",
        transition: "opacity 0.3s ease-in-out",
        transform: "translateY(-10px)",
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-10px)";
        setTimeout(() => notification.remove(), 300);
    }, 2000); // Aumentado a 2 segundos para leer mejor
}

/**
 * Limpia el HTML y retorna el NODO clonado
 */
function getCleanNode(originalNode) {
    const include_stuff = ["href", "src", "alt", "title", "target", "controls"];
    const tagsToRemove = [
        "script",
        "style",
        "svg",
        "path",
        "circle",
        "button",
        "iframe",
        "nav",
        "footer",
        "header",
        "form",
        "input",
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

        // Opcional: Eliminar clases para evitar conflictos de CSS externos
        el.removeAttribute("class");
    });

    return clone;
}
