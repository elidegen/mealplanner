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
      // Ohne type waere der Button in einem <form> automatisch ein
      // Submit-Button und wuerde bei Enter die Seite neu laden
      type="button"
      className={`t-button ${selected ? "selected" : ""}`}
      onClick={onClicked}
      disabled={disabled}
    >
      <p>{text}</p>
    </button>
  );
}

export default TextButton;
