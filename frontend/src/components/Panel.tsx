import "./App.css";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode[];
}) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default Panel;
