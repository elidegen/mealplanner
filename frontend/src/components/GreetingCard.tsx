import "./App.css";

function GreetingCard({ name }: { name?: string }) {
  return (
    <>
      <p>Hallo {name ?? "no name"}</p>
    </>
  );
}

export default GreetingCard;
