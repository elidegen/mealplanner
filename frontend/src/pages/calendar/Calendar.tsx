import { useState } from "react";
import "./Calendar.css";

type View = "Day" | "Week" | "Month";

const VIEWS: View[] = ["Day", "Week", "Month"];

function Calendar() {
  const [activeView, setActiveView] = useState<View>("Day");
  const [date, setDate] = useState<string>("");

  return (
    <div className="calendar-page">
      <nav>
        {VIEWS.map((view) => (
          <div
            key={view}
            className={`listbox ${activeView === view ? "selected" : ""}`}
            onClick={() => setActiveView(view)}
          >
            <span>{view}</span>
          </div>
        ))}
      </nav>
      <div className="calendar-wrapper">
        <input
          className="listbox"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Calendar;
