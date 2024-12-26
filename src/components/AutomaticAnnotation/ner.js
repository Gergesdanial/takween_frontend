import {
  Button,
  Select,
  SelectItem,
  Input,
  Checkbox,
  Card,
  Spacer,
  Chip,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import AxiosWrapper from "../../utils/axiosWrapper";
import { useRouter } from "next/router";
import LoadingSymbol from "../Reusable/loadingSymbol";
import cookieParse from "cookie-parse";

export default function NERAnnotation({ projects, user }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModels, setCustomModels] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Suggested Tags
  const [suggestionTags, setSuggestionTags] = useState([
    "B-LOC","I-LOC","B-PERS","I-PERS","B-ORG","I-ORG","B-MISC","I-MISC","O","DATE","TIME"
  ]);

  const modelOptions = [
    { id: 'camelbert-msa', name: 'CamelBert MSA' },
    { id: 'camelbert-da', name: 'CamelBert DA' },
    { id: 'bert-english', name: 'BERT English' },
  ];

  // Fetch custom models if the checkbox is selected
  useEffect(() => {
    const fetchCustomModels = async () => {
      try {
        const cookies = document.cookie;
        const tokenPair = cookies.split("; ").find((row) => row.startsWith("accessToken"));
        if (!tokenPair) {
          throw new Error("Access token not found in cookies");
        }
        const accessToken = tokenPair.split("=")[1];

        const response = await AxiosWrapper.get("http://50.19.124.30:8000/list-user-models", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const modelNames = response.data.models || [];
        setCustomModels(modelNames.map((name) => ({ id: name, name })));
      } catch (err) {
        console.error("Failed to fetch custom models:", err);
        alert("Failed to fetch custom models: " + err.message);
      }
    };

    if (useCustomModel) {
      fetchCustomModels();
    }
  }, [useCustomModel]);

  const handleCancel = () => {
    router.push("/home/automatic-annotation");
  };

  const handleAnnotate = async () => {
    if (!selectedProject || !selectedDataSource || !jobTitle || !selectedModel) {
      alert("Please fill out all fields");
      return;
    }
    if (customTags.length === 0) {
      alert("Please add at least one custom tag.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      const payload = {
        job_title: jobTitle,
        model: selectedModel,
        custom_tags: customTags,
      };

      let response;
      if (useCustomModel) {
        response = await AxiosWrapper.post(
          `http://50.19.124.30:8000/annotate-with-custom-ner-model/${selectedProject}/${selectedDataSource}/${selectedModel}`,
          payload
        );
      } else {
        response = await AxiosWrapper.post(
          `http://50.19.124.30:8000/NER-annotate/${selectedProject}/${selectedDataSource}`,
          payload
        );
      }

      setStatus(response.data.message || "NER Annotation successful!");
    } catch (err) {
      setStatus("Error during annotation: " + (err.response?.data?.message || err.message));
    }
    setIsLoading(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      setCustomTags([...customTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addSuggestedTag = (tag) => {
    if (!customTags.includes(tag)) {
      setCustomTags([...customTags, tag]);
      setSuggestionTags(suggestionTags.filter((suggestion) => suggestion !== tag));
    }
  };

  const removeTag = (tagToRemove) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove));
    setSuggestionTags([...suggestionTags, tagToRemove]);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <LoadingSymbol height={80} width={80} />
        </div>
      )}
      <Card
        css={{ mw: "600px", p: "20px", margin: "0 auto" }}
        className="shadow-lg rounded-lg relative"
      >
        <h3 className="text-xl font-semibold mb-4">NER Annotation</h3>
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
          label={useCustomModel ? "Select Custom Model..." : "Select NER Model..."}
          selectedKeys={selectedModel ? new Set([selectedModel]) : new Set()}
          onSelectionChange={(e) => setSelectedModel(e.currentKey)}
          placeholder={useCustomModel ? "Select a custom model" : "Select a NER model"}
          className="mb-5"
        >
          {(useCustomModel ? customModels : modelOptions).map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
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

        {/* Suggested Tags with Styling */}
        <div className="flex flex-wrap gap-2 mb-5">
          {suggestionTags.map((suggestedTag) => (
            <Chip
              key={suggestedTag}
              onClick={() => addSuggestedTag(suggestedTag)}
              color="default"
              bordered
              style={{
                cursor: "pointer",
                backgroundColor: "#f5f5f5",
                border: "1px dashed #0072F5",
              }}
            >
              {suggestedTag}
            </Chip>
          ))}
        </div>

        {/* Added Custom Tags */}
        <div className="tags-container mb-5">
          {customTags.map((tag) => (
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
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  try {
    const projects = (await AxiosWrapper.get("http://50.19.124.30:8000/projects", {
      accessToken: accessToken || "",
    })).data;

    const projectsWithUsersDataSources = await Promise.all(
      projects.map(async (project) => {
        const userCreatedProject = (await AxiosWrapper.get(
          `http://50.19.124.30:8000/users/${project.created_by_id}`,
          { accessToken: accessToken || "" }
        )).data;
        const fileDataSources = (await AxiosWrapper.get(
          `http://50.19.124.30:8000/projects/${project.id}/file-data-sources`,
          { accessToken: accessToken || "" }
        )).data;
        return { ...project, user: userCreatedProject, dataSources: fileDataSources };
      })
    );

    const user = (await AxiosWrapper.get("http://50.19.124.30:8000/currentuser", {
      accessToken: accessToken || "",
    })).data;

    return { props: { projects: projectsWithUsersDataSources, user } };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    return { props: {} };
  }
}
