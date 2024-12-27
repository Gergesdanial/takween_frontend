import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import AxiosWrapper from "../../utils/axiosWrapper";

// Dynamically import CodeMirror to disable SSR
const CodeMirror = dynamic(
  () => import("react-codemirror2").then((mod) => mod.Controlled),
  { ssr: false }
);

// CodeMirror styles need to be imported only on the client side
if (typeof window !== "undefined") {
  require("codemirror/lib/codemirror.css");
  require("codemirror/theme/dracula.css");
  require("codemirror/mode/python/python");
}

export default function CodeEditorComponent() {
  const [code, setCode] = useState(`
  def load_model():
      # Import necessary components from the transformers library inside the function to encapsulate dependencies
  
      # Load the model and tokenizer specific for Arabic NER from Hugging Face's model hub
  
      # Setup the pipeline with grouped entities enabled
  
      return pipeline
  
  def annotate_text(text, model):
      # Perform the prediction on the input text
  
      # Extract tokens and their corresponding NER tags (entities)
      
      return tokens, tags
  `);
  const [modelName, setModelName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUploadCode = async () => {
    if (!modelName.trim()) {
      alert("Please enter a model name.");
      return;
    }

    try {
      const response = await AxiosWrapper.post(
        "https://takween.ddns.net/upload-custom-ner-model-code",
        {
          model_name: modelName,
          model_code: code,
        }
      );

      if (response.data.status === "success") {
        alert("Code uploaded successfully!");
      } else {
        alert(`Failed to upload code: ${response.data.message}`);
      }
    } catch (error) {
      alert(`Error uploading code: ${error.message}`);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await AxiosWrapper.post(
        "https://takween.ddns.net/upload-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        alert("File uploaded successfully!");
      } else {
        alert(`Failed to upload file: ${response.data.message}`);
      }
    } catch (error) {
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCancel = () => {
    router.push('/home/automatic-annotation');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-gray-50 rounded-xl shadow-md p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-800">Custom Model Code Editor</h2>
          <p className="text-gray-600">Edit your Python code below or upload a file to define your custom model.</p>
        </div>

        {/* Model Name Input */}
        <div className="space-y-2">
          <Input
            fullWidth
            clearable
            underlined
            label="Model Name"
            placeholder="Enter model name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Code Editor Section */}
        {isClient && (
          <div className="relative mb-6">
            <CodeMirror
              value={code}
              options={{
                mode: "python",
                theme: "dracula",
                lineNumbers: true,
                lineWrapping: true,
                indentUnit: 4,
                tabSize: 4,
                matchBrackets: true,
                autoCloseBrackets: true,
                extraKeys: { "Ctrl-Space": "autocomplete" },
              }}
              onBeforeChange={(editor, data, value) => {
                setCode(value);
              }}
              className="rounded-md border overflow-hidden"
            />
            <Button
              onPress={handleUploadCode}
              auto
              size="sm"
              color="success"
              className="absolute top-3 right-3"
              style={{ backgroundColor: "#28a745", color: "#fff" }}
            >
              Upload Code
            </Button>
          </div>
        )}

        {/* File Upload Section */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Any File</label>
            <div className="flex items-center space-x-3">
              <label htmlFor="file-upload" className="custom-file-upload cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md shadow-sm">
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400">You can upload any type of file.</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            onPress={handleCancel}
            auto
            color="error"
            flat
            size="md"
            className="transition-all hover:shadow-lg"
          >
            Cancel
          </Button>
          <Button
            onPress={handleFileUpload}
            auto
            color="primary"
            size="md"
            className="bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Upload File
          </Button>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
        }
        .CodeMirror {
          min-height: 400px;
          font-size: 14px;
          border: 1px solid #e5e7eb;
        }
        .custom-file-upload {
          background-color: #28a745;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
          transition: background-color 0.3s ease;
        }
        .custom-file-upload:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
}
