import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const MatrixView = ({ matrixData }) => {
  const { labels, co_occurrence } = matrixData;

  const data = [{
    x: labels,
    y: labels,
    z: co_occurrence,
    type: 'heatmap',
    colorscale: 'Viridis'
  }];

  const layout = {
    title: 'Entity Co-occurrence Matrix',
    xaxis: {
      title: 'Entities',
      automargin: true,
      tickangle: -45
    },
    yaxis: {
      title: 'Entities',
      automargin: true
    },
    margin: { t: 40, l: 70, r: 30, b: 150 },
    hovermode: 'closest',
    showlegend: false,
    autosize: true,
  };

  const config = {
    responsive: true,
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'entity_co_occurrence_matrix',
      height: 600,
      width: 1200,
      scale: 1
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

export default MatrixView;
