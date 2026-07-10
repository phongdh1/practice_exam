import { MaterialIcon } from "./material-icon";

export interface MaintenanceScreenProps {
  message: string;
}

/** Branded maintenance page for candidate surfaces (W-90, Z-90) */
export function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container">
        <MaterialIcon name="construction" size={32} className="text-primary" />
      </div>
      <h1 className="mb-3 text-display-sm text-primary">Practice Exam</h1>
      <p className="max-w-lg text-body text-ink-muted">{message}</p>
    </div>
  );
}
