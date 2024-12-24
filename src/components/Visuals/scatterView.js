import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Plotly component with SSR disabled
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const ScatterView = ({ scatterData }) => {
  const tags = [...new Set(scatterData.map(d => d.tag_type))];  // Get unique tag types
  const colors = ['blue', 'green', 'red', 'orange'];  // Define colors for tag types

  const data = tags.map((tag, index) => ({
    x: scatterData.filter(d => d.tag_type === tag).map(d => d.frequency),
    y: scatterData.filter(d => d.tag_type === tag).map(d => d.average_length),
    mode: 'markers',
    type: 'scatter',
    name: tag,
    marker: {
      color: colors[index % colors.length],
      size: 10,
    },
    text: scatterData.filter(d => d.tag_type === tag).map(d => d.word),
  }));

  const layout = {
    title: 'Word Frequency vs. Average Word Length (Grouped by Tag Type)',
    xaxis: { title: 'Word Frequency' },
    yaxis: { title: 'Average Word Length (characters)' },
    hovermode: 'closest',
    showlegend: true,
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={layout}
        style={{ width: '100%', height: '400px' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default ScatterView;
