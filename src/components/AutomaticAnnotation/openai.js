import {
    Button,
    Select,
    SelectItem,
    Input,
    Card,
    Spacer,
    Chip,
  } from "@nextui-org/react";
  import { useState } from "react";
  import { useRouter } from "next/router";
  import AxiosWrapper from "../../utils/axiosWrapper";
  
  export default function OpenAIAnnotation({ projects, user }) {
    const router = useRouter();
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedDataSource, setSelectedDataSource] = useState(null);
    const [jobTitle, setJobTitle] = useState("");
    const [model, setModel] = useState(""); // User-entered model
    const [annotationType, setAnnotationType] = useState(""); // User-selected type
    const [apiKey, setApiKey] = useState(""); // User-provided API key
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
  
    const handleCancel = () => {
      router.push("/home/automatic-annotation");
    };
  
    const handleAnnotate = async () => {
      if (!selectedProject || !selectedDataSource || !jobTitle || !model || !apiKey || tags.length === 0 || !annotationType) {
        alert("Please fill out all fields and add at least one tag.");
        return;
      }
  
      setIsLoading(true);
      setStatus("");
  
      try {
        const payload = {
          job_title: jobTitle,
          model,
          api_key: apiKey,
          tags,
          type: annotationType,
        };
  
        const response = await AxiosWrapper.post(
          `http://127.0.0.1:8000/openai-annotate/${selectedProject}/${selectedDataSource}`,
          payload
        );
  
        setStatus(response.data.message || "OpenAI Annotation successful!");
      } catch (err) {
        setStatus("Error during annotation: " + (err.response?.data?.message || err.message));
      }
  
      setIsLoading(false);
    };
  
    const addTag = () => {
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    };
  
    const removeTag = (tagToRemove) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    };
  
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <p>Loading...</p>
          </div>
        )}
        <Card
          css={{ mw: "600px", p: "20px", margin: "0 auto" }}
          className="shadow-lg rounded-lg relative"
        >
          <h3 className="text-xl font-semibold mb-4">OpenAI Annotation</h3>
          <Spacer y={1} />
  
          <Select
            fullWidth
            disallowEmptySelection
            label="Select Project"
            selectedKeys={selectedProject ? new Set([selectedProject]) : new Set()}
            onSelectionChange={(e) => setSelectedProject(e.currentKey)}
            placeholder="Select a project"
            className="mb-5"
          >
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </Select>
  
          <Select
            fullWidth
            disallowEmptySelection
            label="Select Data Source"
            selectedKeys={selectedDataSource ? new Set([selectedDataSource]) : new Set()}
            onSelectionChange={(e) => setSelectedDataSource(e.currentKey)}
            placeholder="Select a data source"
            className="mb-5"
            isDisabled={!selectedProject}
          >
            {selectedProject &&
              projects
                .find((proj) => proj.id === selectedProject)
                ?.dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.file_name}
                  </SelectItem>
                ))}
          </Select>
  
          <Input
            clearable
            fullWidth
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter the job title"
            className="mb-5"
          />
  
          <Input
            clearable
            fullWidth
            label="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="mb-5"
            type="password" // For security, display as a password field
          />
  
          <Input
            clearable
            fullWidth
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Enter model name (e.g., gpt-4o-mini)"
            className="mb-5"
          />
  
          <Select
            fullWidth
            disallowEmptySelection
            label="Annotation Type"
            selectedKeys={annotationType ? new Set([annotationType]) : new Set()}
            onSelectionChange={(e) => setAnnotationType(e.currentKey)}
            placeholder="Select annotation type"
            className="mb-5"
          >
            <SelectItem key="ner" value="ner">Named Entity Recognition</SelectItem>
            <SelectItem key="pos" value="pos">Part of Speech</SelectItem>
            <SelectItem key="text_classification" value="text_classification">Text Classification</SelectItem>
          </Select>
  
          <Input
            clearable
            fullWidth
            label="Add Custom Tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTag()}
            placeholder="Type a tag and press Enter"
            className="mb-5"
          />
  
          <div className="tags-container mb-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                closable
                color="primary"
                className="mr-2"
              >
                {tag}
              </Chip>
            ))}
          </div>
  
          <div className="flex justify-end space-x-3">
            <Button auto color="error" flat onPress={handleCancel}>
              Cancel
            </Button>
            <Button auto color="primary" flat onPress={handleAnnotate} disabled={isLoading}>
              Annotate
            </Button>
          </div>
  
          <Spacer y={1} />
          {status && (
            <p className={`mt-3 ${status.includes("successful") ? "text-green-600" : "text-red-600"}`}>
              {status}
            </p>
          )}
        </Card>
        <style jsx>{`
          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .text-green-600 {
            color: green;
          }
          .text-red-600 {
            color: red;
          }
        `}</style>
      </div>
    );
  }
