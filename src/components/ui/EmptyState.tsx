import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Estado vacío unificado con soporte de accesibilidad.
 * Uso:
 *   <EmptyState
 *     emoji="📷"
 *     title="Aún no tienes diagnósticos"
 *     description="¡Saca tu primera foto!"
 *     action={<button onClick={...}>Empezar</button>}
 *   />
 */
export function EmptyState({
  emoji = "📭",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="card border-dashed p-8 text-center"
      role="status"
      aria-label={title}
    >
      {emoji && (
        <div className="text-5xl mb-4" aria-hidden="true">
          {emoji}
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
