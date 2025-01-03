import React from "react";

function AutomaticIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="45px" // You can adjust the size as needed
      height="45px"
      viewBox="0 0 32 32"
      fill="#000000" // Default fill color, can be overridden with props
      {...props}
    >
      <title>automatic</title>
      <path d="M26,16H22a2.002,2.002,0,0,0-2,2V30h2V25h4v5h2V18A2.002,2.002,0,0,0,26,16Zm-4,7V18h4v5Z" />
      <path d="M16,27a10.9862,10.9862,0,0,1-9.2156-5H12V20H4v8H6V24.3149A13.0239,13.0239,0,0,0,16,29Z" />
      <path d="M20,10h5.2155A10.9973,10.9973,0,0,0,5,16H3A13.0048,13.0048,0,0,1,26,7.6849V4h2v8H20Z" />
      <rect
        id="_Transparent_Rectangle_"
        data-name="<Transparent Rectangle>"
        className="cls-1"
        width="32"
        height="32"
        fill="none"
      />
    </svg>
  );
}

export default AutomaticIcon;
