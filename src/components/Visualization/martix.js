import { useState, useEffect } from "react";
import { Button, Select, SelectItem, Checkbox, Input } from "@nextui-org/react";
import AxiosWrapper from "../../utils/axiosWrapper";
import MatrixView from "../../components/Visuals/matrixView";
import { useRouter } from "next/router";

export default function Matrix({ projects }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [matrixData, setMatrixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

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

  const visualizeMatrixData = async () => {
    if (!selectedProject || !selectedJob) {
      alert("Please select a project and a job");
      return;
    }
    setIsLoading(true);
    try {
      const response = await AxiosWrapper.get(
        `http://127.0.0.1:8000/projects/${selectedProject}/jobs/${selectedJob}/matrix-data`
      );
      setMatrixData(response.data.matrixData || {});
    } catch (err) {
      console.error("Failed to retrieve matrix data", err);
      alert("Failed to retrieve matrix data");
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
    } else {
      alert("Please upload a valid .ndjson file");
    }
  };

  // Process uploaded data to create a co-occurrence matrix
  const processUploadedData = (data) => {
    const entityPairs = {};
    const entitySet = new Set();

    data.forEach((item) => {
      const annotations = item.annotations || [];
      const entitiesInDoc = new Set();

      annotations.forEach(annotation => {
        annotation.tags.forEach(tagEntry => {
          const tag = tagEntry.tag;
          if (tag) entitiesInDoc.add(tag);
        });
      });

      entitiesInDoc.forEach((entityA) => {
        entitiesInDoc.forEach((entityB) => {
          if (entityA !== entityB) {
            const pair = [entityA, entityB].sort().join("-");
            entityPairs[pair] = (entityPairs[pair] || 0) + 1;
            entitySet.add(entityA);
            entitySet.add(entityB);
          }
        });
      });
    });

    const labels = Array.from(entitySet).sort();
    const matrix = labels.map((entityA) =>
      labels.map((entityB) => entityPairs[`${entityA}-${entityB}`] || 0)
    );

    setMatrixData({ labels, co_occurrence: matrix });
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
          <Select
            className="mt-5"
            fullWidth
            disallowEmptySelection
            label="Select Project..."
            selectedKeys={selectedProject}
            onSelectionChange={(e) => setSelectedProject(e.currentKey)}
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
              onPress={visualizeMatrixData}
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
        <Input
          type="file"
          accept=".ndjson"
          onChange={handleFileUpload}
          className="mt-5"
          fullWidth
        />
      )}

      {/* Render MatrixView if matrix data is available */}
      {matrixData && <MatrixView matrixData={matrixData} />}
    </div>
  );
}
