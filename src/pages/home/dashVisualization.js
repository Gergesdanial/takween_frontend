import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import cookieParse from "cookie-parse";
import styles from "./DashVisualization.module.css";
import Navigation from "../../components/Reusable/Navigation/navBarSideBar"; // Import Navigation

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DragItemType = {
  COLUMN: "column",
};

const DraggableColumn = ({ column }) => {
  const [, drag] = useDrag(() => ({
    type: DragItemType.COLUMN,
    item: { name: column },
  }));

  return (
    <div ref={drag} className={styles.draggableColumn}>
      {column}
    </div>
  );
};

const DroppableZone = ({ label, onDrop, currentValue }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DragItemType.COLUMN,
    drop: (item) => onDrop(item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${styles.dropZone} ${isOver ? styles.dropZoneActive : ""}`}
    >
      <span>{label}: {currentValue || "Drop a column here"}</span>
    </div>
  );
};

const DashVisualization = ({ initialToken }) => {
  const [columns, setColumns] = useState([]);
  const [dataPreview, setDataPreview] = useState([]);
  const [selectedChart, setSelectedChart] = useState("");
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [thirdColumn, setThirdColumn] = useState("");
  const [plotData, setPlotData] = useState(null);
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!initialToken) {
      const cookies = cookieParse.parse(document.cookie || "");
      setToken(cookies.accessToken || "");
    }
  }, [initialToken]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const res = await fetch("https://takween.ddns.net/upload_csv/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await res.json();
      if (res.ok) {
        setColumns(response.columns);
        setDataPreview(response.data);
      } else {
        console.error("Error fetching columns:", response.detail);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const generateVisualization = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chart_type", selectedChart);
    if (xColumn) formData.append("x_column", xColumn);
    if (yColumn) formData.append("y_column", yColumn);
    if (thirdColumn) formData.append("third_column", thirdColumn);

    try {
      const res = await fetch("https://takween.ddns.net/visualize/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await res.text();
      if (res.ok) {
        const plotlyData = JSON.parse(JSON.parse(responseText));
        const { data, layout } = plotlyData;
        setPlotData({ data, layout });
      } else {
        console.error("Error generating visualization:", responseText);
      }
    } catch (error) {
      console.error("Error generating visualization:", error);
    }
  };

  const explainChart = async () => {
    const formData = new FormData();
    formData.append("chart_type", selectedChart);
    formData.append("x_column", xColumn || "N/A");
    formData.append("y_column", yColumn || "N/A");
    formData.append("third_column", thirdColumn || "N/A");
    formData.append(
      "column_details",
      `Available columns: ${columns.join(", ")}`
    );

    try {
      const res = await fetch("https://takween.ddns.net/explain_chart/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await res.json();
      if (res.ok) {
        setExplanation(response.explanation);
      } else {
        console.error("Error explaining chart:", response.detail);
        alert(`Failed to explain chart: ${response.detail}`);
      }
    } catch (error) {
      console.error("Error explaining chart:", error);
      alert("An unexpected error occurred while explaining the chart.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <Navigation
          showCreateProjectButton={false}
          breadcrumbs={[{ text: "Dash Visualization", href: "/home/dashvisualization" }]}
        />
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>Data Visualization Dashboard</h1>
          </header>
          <section className={styles.fileUpload}>
            <h2>Step 1: Upload Your Dataset</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </section>
          {columns.length > 0 && (
            <div className={styles.workspace}>
              <aside className={styles.columnsPanel}>
                <h3>Columns</h3>
                {columns.map((col) => (
                  <DraggableColumn key={col} column={col} />
                ))}
              </aside>
              <main className={styles.chartBuilder}>
                <h3>Step 2: Build Your Chart</h3>
                <div className={styles.dropZones}>
                  <DroppableZone
                    label="X Axis"
                    currentValue={xColumn}
                    onDrop={(col) => setXColumn(col)}
                  />
                  <DroppableZone
                    label="Y Axis"
                    currentValue={yColumn}
                    onDrop={(col) => setYColumn(col)}
                  />
                  <DroppableZone
                    label="Optional Axis"
                    currentValue={thirdColumn}
                    onDrop={(col) => setThirdColumn(col)}
                  />
                </div>
                <div className={styles.chartTypeSelector}>
                  <label>Select Chart Type:</label>
                  <select onChange={(e) => setSelectedChart(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="scatterplot">Scatterplot</option>
                    <option value="bubble_chart">Bubble Chart</option>
                    <option value="lineplot">Lineplot</option>
                    <option value="boxplot">Boxplot</option>
                    <option value="bar_plot">Bar Plot</option>
                    <option value="histogram">Histogram</option>
                    <option value="pie_chart">Pie Chart</option>
                    <option value="heatmap">Heatmap</option>
                  </select>
                </div>
                <div className={styles.buttons}>
                  <button className={styles.generateButton} onClick={generateVisualization}>Generate Chart</button>
                  {selectedChart && (
                    <button className={styles.explainButton} onClick={explainChart}>Explain Chart</button>
                  )}
                </div>
              </main>
            </div>
          )}
          {plotData && (
            <section className={styles.chart}>
              <h2>Visualization</h2>
              <Plot
                data={plotData.data}
                layout={plotData.layout}
                config={plotData.config}
              />
            </section>
          )}
          {explanation && (
            <section className={styles.explanation}>
              <h2>Chart Insights</h2>
              <p>{explanation}</p>
            </section>
          )}
        </div>
      </>
    </DndProvider>
  );
};

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  return {
    props: {
      initialToken: accessToken || null,
    },
  };
}

export default DashVisualization;
