function IconButton({ icon, action }: { icon: string; action: string }) {
  return (
    <>
      <button>{icon}</button>
    </>
  );
}

function handleClick(action): void {}

export default IconButton;
