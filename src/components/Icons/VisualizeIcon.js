import React from "react";

function VisualizeIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="45px" // You can adjust the size as needed
      height="45px"
      viewBox="0 0 32 32"
      {...props}
    >
      <title>visualization</title>
      <style type="text/css">
        {".blueprint_een {fill: #111918;}"}
      </style>
      <path
        className="blueprint_een"
        d="M16,1C7.729,1,1,7.729,1,16s6.729,15,15,15s15-6.729,15-15S24.271,1,16,1z M28.949,15H17V3.051
          C23.37,3.539,28.461,8.63,28.949,15z M3,16C3,8.832,8.832,3,16,3v13l4.876,12.043C19.369,28.655,17.725,29,16,29
          C8.832,29,3,23.168,3,16z M21.786,27.625l-4.159-10.29l7.701,7.701C24.307,26.088,23.11,26.963,21.786,27.625z 
          M26.001,24.294L17.707,16H29C29,19.151,27.872,22.042,26.001,24.294z"
      />
    </svg>
  );
}

export default VisualizeIcon;
