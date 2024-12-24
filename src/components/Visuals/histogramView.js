import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Plotly component with SSR disabled
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const HistogramView = ({ tagFrequencies }) => {
  // Convert tag frequencies to a format suitable for Plotly
  const data = [{
    x: Object.keys(tagFrequencies),
    y: Object.values(tagFrequencies),
    type: 'bar',
    marker: {
      color: 'blue', // Color of the bars, you can customize this or make it dynamic
    }
  }];

  const layout = {
    title: 'Tag Frequency',
    xaxis: {
      title: 'Tags',
      automargin: true,
      tickangle: -45 // Adjust based on label length
    },
    yaxis: {
      title: 'Frequency'
    },
    margin: { t: 40, l: 70, r: 30, b: 150 }, // Adjust margins to prevent clipping
    hovermode: 'closest',
    showlegend: false,
    autosize: true,
  };

  const config = {
    responsive: true,
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: 'tag_frequency_histogram',
      height: 600,
      width: 1200,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '400px' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default HistogramView;
