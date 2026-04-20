import * as React from "react";

export function Button(props) {
  return (
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
      {props.children}
    </button>
  );
}
