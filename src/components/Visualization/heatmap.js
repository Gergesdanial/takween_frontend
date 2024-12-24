import { useState, useEffect } from "react";
import { Button, Select, SelectItem, Checkbox, Input } from "@nextui-org/react";
import AxiosWrapper from "../../utils/axiosWrapper";
import HeatmapView from "../../components/Visuals/heatmapView"; // Ensure this component exists and is properly exported
import { useRouter } from "next/router";

export default function Heatmap({ projects }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fetch jobs when a project is selected
  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedProject) return;
      setIsLoading(true);
      try {
        const response = await AxiosWrapper.get(
          `http://127.0.0.1:8000/projects/${selectedProject}/jobs`
        );
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        alert("Failed to fetch jobs");
      }
      setIsLoading(false);
    };
    fetchJobs();
  }, [selectedProject]);

  const handleCancel = () => {
    router.push('/home/visualization');
  };

  // Visualize heatmap data from selected job
  const visualizeHeatmap = async () => {
    if (!selectedProject || !selectedJob) {
      alert("Please select a project and a job");
      return;
    }
    setIsLoading(true);
    try {
      const response = await AxiosWrapper.get(
        `http://127.0.0.1:8000/projects/${selectedProject}/jobs/${selectedJob}/heatmap-data`
      );
      setHeatmapData(response.data.annotationDensity || []);
    } catch (err) {
      console.error("Failed to retrieve heatmap data", err);
      alert("Failed to retrieve heatmap data");
    }
    setIsLoading(false);
  };

  // Handle .ndjson file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.ndjson')) {
      const reader = new FileReader();
      reader.onload = () => {
        const lines = reader.result.split('\n').filter(line => line.trim());
        const data = lines.map(line => JSON.parse(line));
        processUploadedData(data);
      };
      reader.readAsText(file);
      setUploadedFile(file);
    } else {
      alert("Please upload a valid .ndjson file");
    }
  };

  // Process uploaded data to calculate annotation density for heatmap
  const processUploadedData = (data) => {
    const annotationDensity = data.map((item) => {
      const annotations = item.annotations || [];
      // Sum the number of tags in each annotation to get annotation density
      return annotations.reduce((count, annotation) => count + (annotation.tags ? annotation.tags.length : 0), 0);
    });

    setHeatmapData(annotationDensity);
  };

  return (
    <div>
      {/* Toggle between existing job selection and upload mode */}
      <Checkbox
        isSelected={uploadMode}
        onChange={setUploadMode}
        className="mt-5"
        size="lg"
        color="primary"
      >
        Upload .ndjson File
      </Checkbox>

      {!uploadMode ? (
        <>
          {/* Select Project and Job when not in upload mode */}
          <Select
            className="mt-5"
            fullWidth
            disallowEmptySelection
            label="Select Project..."
            selectedKeys={selectedProject}
            onSelectionChange={(e) => setSelectedProject(e.currentKey)}
            placeholder="Choose a project"
          >
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </Select>

          <Select
            className="mt-5"
            fullWidth
            disallowEmptySelection
            label="Select Job..."
            selectedKeys={selectedJob}
            onSelectionChange={(e) => setSelectedJob(e.currentKey)}
            placeholder="Choose a job"
            disabled={!selectedProject}
          >
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </Select>

          <div className="flex mt-5 space-x-4">
            <Button onPress={handleCancel} auto color="error" flat>
              Cancel
            </Button>
            <Button
              onPress={visualizeHeatmap}
              auto
              color="primary"
              flat
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Visualize"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Upload .ndjson file in upload mode */}
          <Input
            type="file"
            accept=".ndjson"
            onChange={handleFileUpload}
            className="mt-5"
            fullWidth
          />
        </>
      )}

      {/* Render HeatmapView if heatmap data is available */}
      {heatmapData && <HeatmapView heatmapData={heatmapData} />}
    </div>
  );
}
