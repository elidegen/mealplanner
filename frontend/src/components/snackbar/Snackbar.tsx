import { useEffect, useState } from "react";
import "./Snackbar.css";

type SnackbarProps = {
  text: string;
  color: string;
  duration: number;
};

function Snackbar({ text, color, duration }: SnackbarProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!text || !visible) return null;

  return (
    <div className="snackbar" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
}

export default Snackbar;
