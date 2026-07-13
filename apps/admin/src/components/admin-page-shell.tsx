/** Admin page content area (sidebar and top header live in `admin-app-frame.tsx`). */
export function AdminPageShell({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 p-gutter-desktop">{children}</div>;
}
