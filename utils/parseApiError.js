/**
 * Converts a structured backend error body into a locale-aware message string.
 *
 * Backend error shape:
 *   { error_code, message, details: { fields: [{ field, message }] } }
 *
 * Resolution order:
 *   1. Field-level errors  → t("error_field_<field>")  — one per field, joined with " • "
 *   2. Error code          → t("error_<error_code lower>")
 *   3. Raw backend message → body.message
 *   4. Generic fallback    → t("error_server")
 *
 * To add a new translatable error: add the key to en.js + ar.js. No code changes needed.
 */
export function parseApiError(body, t) {
    const fields = body?.details?.fields;

    if (fields?.length) {
        return fields
            .map((f) => {
                const key = `error_field_${f.field}`;
                const translated = t(key);
                return translated !== key ? translated : f.message;
            })
            .join(" • ");
    }

    if (body?.error_code) {
        const key = `error_${body.error_code.toLowerCase()}`;
        const translated = t(key);
        if (translated !== key) return translated;
    }

    return body?.message ?? t("error_server");
}
