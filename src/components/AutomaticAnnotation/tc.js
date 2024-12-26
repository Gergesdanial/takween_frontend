import { useState, useEffect } from "react";
import { Button, Select, SelectItem, Input, Checkbox, Card, Spacer, Chip } from "@nextui-org/react";
import AxiosWrapper from "../../utils/axiosWrapper";
import { useRouter } from 'next/router';
import LoadingSymbol from "../Reusable/loadingSymbol";

export default function TCAnnotation({ projects, user }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [classInput, setClassInput] = useState("");
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModels, setCustomModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("joeddav/xlm-roberta-large-xnli");  // Set default model here

  // Fetch custom models only if custom models checkbox is checked
  useEffect(() => {
    if (useCustomModel) {
      AxiosWrapper.get('http://50.19.124.30:8000/list-user-models')
        .then(response => {
          const modelNames = response.data.models || [];
          setCustomModels(modelNames.map(name => ({ id: name, name })));
        })
        .catch(err => {
          alert("Failed to fetch custom models: " + err.message);
        });
    }
  }, [useCustomModel]);

  const handleCancel = () => {
    router.push('/home/automatic-annotation');
  };

  const handleAddClass = () => {
    if (classInput && !classes.includes(classInput)) {
      setClasses([...classes, classInput]);
      setClassInput("");
    }
  };

  const handleDeleteClass = (classToDelete) => {
    setClasses(classes.filter(cls => cls !== classToDelete));
  };

  const handleAnnotate = async () => {
    if (!selectedProject || !selectedDataSource || classes.length === 0 || !jobTitle || !selectedModel) {
      alert("Please fill out all fields");
      return;
    }
    setIsLoading(true);
    setStatus(""); // Clear any previous status message

    try {
      let response;
      if (useCustomModel) {
        response = await AxiosWrapper.post(
          `http://50.19.124.30:8000/annotate-with-custom-tc-model/${selectedProject}/${selectedDataSource}/${selectedModel}`,
          { job_title: jobTitle, classes }
        );
      } else {
        response = await AxiosWrapper.post(
          `http://50.19.124.30:8000/text-classification/${selectedProject}/${selectedDataSource}`,
          { job_title: jobTitle, classes }
        );
      }

      setStatus(response.data.message || "Text Classification successful!");
    } catch (err) {
      setStatus("Error during text classification: " + (err.response?.data?.message || err.message));
    }
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <LoadingSymbol height={80} width={80} />
        </div>
      )}
      <Card css={{ mw: "600px", p: "20px", margin: "0 auto" }} className="shadow-lg rounded-lg relative">
        <h3 className="text-xl font-semibold mb-4">Text Classification Setup</h3>
        <Spacer y={1} />

        <Select
          fullWidth
          disallowEmptySelection
          label="Select Project..."
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
          label="Select Data Source..."
          selectedKeys={selectedDataSource ? new Set([selectedDataSource]) : new Set()}
          onSelectionChange={(e) => setSelectedDataSource(e.currentKey)}
          placeholder="Select a data source"
          className="mb-5"
          isDisabled={!selectedProject} // Disable if no project is selected
        >
          {selectedProject &&
            projects.find((proj) => proj.id === selectedProject)?.dataSources.map((ds) => (
              <SelectItem key={ds.id} value={ds.id}>
                {ds.file_name}
              </SelectItem>
            ))}
        </Select>

        <Input
          clearable
          underlined
          fullWidth
          label="Enter Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Enter the job title"
          className="mb-5"
        />

        <Checkbox
          isSelected={useCustomModel}
          onChange={(e) => setUseCustomModel(e.target.checked)}
          className="mb-5"
        >
          Use Custom Model
        </Checkbox>

        <Select
          fullWidth
          disallowEmptySelection
          label={useCustomModel ? "Select Custom Model..." : "Select Text Classification Model..."}
          selectedKeys={selectedModel ? new Set([selectedModel]) : new Set()}
          onSelectionChange={(e) => setSelectedModel(e.currentKey)}
          placeholder={useCustomModel ? "Select a custom model" : "Select a text classification model"}
          className="mb-5"
        >
          {(useCustomModel ? customModels : [{ id: "joeddav/xlm-roberta-large-xnli", name: "joeddav/xlm-roberta-large-xnli" }]).map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </Select>

        <div className="flex items-center mt-5">
          <Input
            clearable
            underlined
            fullWidth
            label="Add a Classification Class"
            value={classInput}
            onChange={(e) => setClassInput(e.target.value)}
            placeholder="Enter a class"
            className="mr-2"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddClass(); }}
          />
          <Button auto flat color="primary" onClick={handleAddClass}>
            Add
          </Button>
        </div>

        {classes.length > 0 && (
          <Card className="mt-5 p-4 shadow-sm rounded-lg">
            <h4 className="text-lg font-medium mb-3">Current Classes:</h4>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls, index) => (
                <Chip
                  key={index}
                  color="primary"
                  className="cursor-pointer"
                  onClose={() => handleDeleteClass(cls)}
                  closeable
                >
                  {cls}
                </Chip>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-3 mt-5">
          <Button auto color="error" flat onPress={handleCancel}>
            Cancel
          </Button>
          <Button
            auto
            color="primary"
            flat
            onPress={handleAnnotate}
            disabled={isLoading}
          >
            Classify Text
          </Button>
        </div>

        <Spacer y={1} />
        {status && (
          <p className={`mt-3 ${status.includes("successful") ? "text-green-600" : "text-red-600"}`}>
            {status}
          </p>
        )}
      </Card>
    </div>
  );
}
