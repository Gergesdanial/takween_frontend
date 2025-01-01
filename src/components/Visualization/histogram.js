import { useState, useEffect } from "react";
import { Button, Select, SelectItem, Checkbox, Input } from "@nextui-org/react";
import AxiosWrapper from "../../utils/axiosWrapper";
import HistogramView from "../../components/Visuals/histogramView";
import { useRouter } from "next/router";

export default function Histogram({ projects }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [tagFrequencies, setTagFrequencies] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    console.log("Projects in Histogram:", projects);
  }, [projects]);

  // Fetch jobs when a project is selected
  useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedProject) return;
      setIsLoading(true);
      try {
        const response = await AxiosWrapper.get(
          `https://takween.ddns.net/projects/${selectedProject}/jobs`
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
    router.push("/home/visualization");
  };

  const visualizeTagFrequencies = async () => {
    if (!selectedProject || !selectedJob) {
      alert("Please select a project and a job");
      return;
    }
    setIsLoading(true);
    try {
      const response = await AxiosWrapper.get(
        `https://takween.ddns.net/projects/${selectedProject}/jobs/${selectedJob}/tag-frequencies`
      );
      setTagFrequencies(response.data.tag_frequencies || {});
    } catch (err) {
      console.error("Failed to retrieve tag frequencies", err);
      alert("Failed to retrieve tag frequencies");
    }
    setIsLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".ndjson")) {
      const reader = new FileReader();
      reader.onload = () => {
        const lines = reader.result.split("\n").filter((line) => line.trim());
        const data = lines.map((line) => JSON.parse(line));
        processUploadedData(data);
      };
      reader.readAsText(file);
      setUploadedFile(file);
    } else {
      alert("Please upload a valid .ndjson file");
    }
  };

  const processUploadedData = (data) => {
    const frequencies = {};
    data.forEach((item) => {
      if (item.annotations) {
        item.annotations.forEach((annotation) => {
          const tags = annotation.tags || [];
          tags.forEach((tagEntry) => {
            const tag = tagEntry.tag;
            if (tag) {
              frequencies[tag] = (frequencies[tag] || 0) + 1;
            }
          });
        });
      }
    });
    setTagFrequencies(frequencies);
  };

  return (
    <div>
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
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled>No projects available</SelectItem>
            )}
          </Select>

          <Select
            className="mt-5"
            fullWidth
            disallowEmptySelection
            label="Select Job..."
            selectedKeys={selectedJob}
            onSelectionChange={(e) => setSelectedJob(e.currentKey)}
          >
            {isLoading ? (
              <SelectItem disabled>Loading jobs...</SelectItem>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled>No jobs available</SelectItem>
            )}
          </Select>

          <div className="flex mt-5 space-x-4">
            <Button onPress={handleCancel} auto color="error" flat>
              Cancel
            </Button>
            <Button
              onPress={visualizeTagFrequencies}
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

      {tagFrequencies && <HistogramView tagFrequencies={tagFrequencies} />}
    </div>
  );
}
