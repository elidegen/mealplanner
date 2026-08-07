import type { KeyboardEvent } from "react";

// Enter in einem Eingabefeld loest dieselbe Aktion aus wie der Button daneben.
// preventDefault verhindert, dass ein umgebendes <form> zusaetzlich abgeschickt
// wird und die Seite neu laedt.
export function onEnter(action: () => void) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    action();
  };
}
