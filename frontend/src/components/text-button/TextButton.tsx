import "./TextButton.css";

type Props = {
  text: string;
  onClicked: () => void;
  disabled?: boolean;
  selected?: boolean;
};
function TextButton({ text, onClicked, disabled, selected }: Props) {
  return (
    <button
      className={`t-button ${selected ? "selected" : ""}`}
      onClick={onClicked}
      disabled={disabled}
    >
      <p>{text}</p>
    </button>
  );
}

export default TextButton;
