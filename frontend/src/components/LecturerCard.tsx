import "./App.css";

export interface LeCaProps {
  name: string;
  age: number;
  subject: string;
  img?: string;
  hidden?: boolean;
}

function LecturerCard({ name, age, subject, img, hidden }: LeCaProps) {
  return (
    <div className="lec-card">
      {hidden ? (
        <i>Lecturer is hidden</i>
      ) : (
        <>
          <h1>Lecturer:</h1> <h2>Prof. {name}</h2>
          <p>Age: {age}</p>
          <p>Subject: {subject}</p>
          {img ? <img src={img} alt="image" /> : ""}
        </>
      )}
    </div>
  );
}

export default LecturerCard;
