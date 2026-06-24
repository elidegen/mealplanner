import "./LoadingSpinner.css";

function LoadingSpinner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
    </div>
  );
}

export default LoadingSpinner;
