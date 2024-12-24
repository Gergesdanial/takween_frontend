// components/Visuals/heatmapView.js
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Plotly component with SSR disabled
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const HeatmapView = ({ heatmapData }) => {
  // Prepare the heatmap data, where each value represents annotation density for a single sentence
  const zData = [heatmapData];  // Single-row array for 1D heatmap representation

  // Custom hover text for each sentence
  const hoverText = heatmapData.map((density, index) => `Sentence ${index}: Density ${density}`);

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h2>Annotation Density per Sentence</h2>
      <Plot
        data={[
          {
            z: zData,
            type: 'heatmap',
            colorscale: 'Viridis',
            text: [hoverText],  // Set custom hover text for each cell
            hovertemplate: '%{text}<extra></extra>'  // Display only custom text without additional info
          }
        ]}
        layout={{
          width: 900, 
          height: 400, 
          title: 'Sentence Annotation Density',
          xaxis: {
            title: 'Sentence Index',
            tickmode: 'array',
            tickvals: Array.from({ length: heatmapData.length }, (_, i) => i),
            ticktext: Array.from({ length: heatmapData.length }, (_, i) => `Sentence ${i}`)
          },
          yaxis: {
            title: '',
            showticklabels: false  // Hide y-axis labels since it's a single row
          }
        }}
      />
    </div>
  );
};

export default HeatmapView;
