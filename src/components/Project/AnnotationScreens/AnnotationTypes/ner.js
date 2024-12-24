import { useState, useEffect } from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import Image from "next/image";
import {
  RadioGroup, Radio,
  Button, Tooltip,
  Select, SelectItem,
} from "@nextui-org/react";
import randomColor from "randomcolor";
import AxiosWrapper from "../../../../utils/axiosWrapper";

import GhostButton from "../../../Reusable/ghostButton";
import buttonStyles from "../../../../styles/components/Reusable/navbar.module.css";
import TableIcon from "../../../Icons/tableIcon";

export default function NamedEntityRecognitionComponent({
  currentRow,
  selectedAnnotations,
  setSelectedAnnotations,
  getPreviousRow,
  getNextRow,
  user,
  annotatedDataCount,
  setAnnotatedDataCount,
  projectId,
  jobId,
  job,
  setShowDetailedSplit,
  projectCreatedById,
}) {
  const allUserAnnotations = currentRow.original.annotations;
  const [selectedUserId, setSelectedUserId] = useState(new Set([user.id]));
  const [assignedUserAnnotations, setAssignedUserAnnotations] = useState([]);

  useEffect(() => {
    const fetchAnnotationsForCreator = async () => {
      try {
        const response = await AxiosWrapper.get(`/projects/${projectId}/jobs/${jobId}/is-creator-annotations`);
        if (response.data.is_creator) {
          setAssignedUserAnnotations(response.data.annotations);
        }
      } catch (error) {
        console.error("Error fetching annotations:", error);
      }
    };

    if (user.id === projectCreatedById) {
      fetchAnnotationsForCreator();
    }
  }, [projectId, jobId, projectCreatedById, user.id]);

  const [tags] = useState(currentRow.original.tags.map((currTag) => ({
    tagName: currTag,
    color: randomColor({ luminosity: "light", seed: currTag }),
  })));
  const [currentTag, setCurrentTag] = useState(tags[0]);

  const handleWordClick = (word) => {
    const annotations = selectedAnnotations.tags || [];
    const existingAnnotationIndex = annotations.findIndex((annotation) => annotation.text === word);

    if (existingAnnotationIndex >= 0) {
      annotations[existingAnnotationIndex].tag = currentTag.tagName;
    } else {
      annotations.push({ text: word, tag: currentTag.tagName });
    }

    setSelectedAnnotations({ ...selectedAnnotations, tags: annotations });
  };

  const renderAnnotatedText = () => {
    const text = currentRow.original.data[currentRow.original.fieldToAnnotate];
    const annotations = selectedAnnotations.tags || [];
    const tokens = text.match(/\p{L}+|\p{P}|\s+/gu) || [];

    return tokens.map((token, index) => {
      const matchingAnnotation = annotations.find((annotation) => annotation.text === token);
      const tagInfo = matchingAnnotation
        ? tags.find((tag) => tag.tagName.toLowerCase() === matchingAnnotation.tag.toLowerCase())
        : null;
      const backgroundColor = tagInfo ? tagInfo.color : "transparent";

      return (
        <span
          key={index}
          onClick={() => handleWordClick(token)}
          style={{
            backgroundColor,
            padding: "2px",
            borderRadius: "4px",
            margin: "0 2px",
            display: "inline-block",
            cursor: "pointer",
          }}
        >
          {token}
        </span>
      );
    });
  };

  const clearSelections = () => {
    setSelectedAnnotations({ ...selectedAnnotations, tags: [] });
  };

  
  const getFilteredAnnotations = () => {
    const documentId = currentRow.original._id;
    const filteredAnnotations = assignedUserAnnotations.length > 0
      ? assignedUserAnnotations.filter((annotation) => annotation.document_id === documentId)
      : currentRow.original.annotations;
    return filteredAnnotations;
  };

  const renderAssignedUserAnnotations = () => {
    const filteredAnnotations = getFilteredAnnotations();
    return (
      <div style={{
        padding: "15px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Assigned User Annotations</h3>
        {filteredAnnotations.length > 0 ? (
          filteredAnnotations.map((annotation, index) => (
            <div key={annotation.user.email || index} style={{ marginBottom: "10px" }}>
              <p style={{ fontWeight: "bold", color: "#333", marginBottom: "4px" }}>{annotation.user.email}</p>
              <p style={{ color: "#555", margin: "0", fontSize: "14px" }}>
                {annotation.tags.map((tag, tagIndex) => `${tag.text} - ${tag.tag}`).join(", ")}
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "#777", fontSize: "14px" }}>No annotations available for this document.</p>
        )}
      </div>
    );
  };

  return (
    <Allotment minSize={300} defaultSizes={[200, 50]}>
      <Allotment vertical minSize={300} defaultSizes={[200, 50]}>
        <div>
          <div className="p-2">
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Button
                color="warning"
                onPress={() => setShowDetailedSplit(false)}
                startContent={<TableIcon />}
              >
                View Table
              </Button>
              <Tooltip color="warning" content="Shows the current Id of the record" delay={1000}>
                <Button color="warning" variant="flat">
                  {`Id ${currentRow.original._id}`}
                </Button>
              </Tooltip>
              <Tooltip color="warning" closeDelay={2000} content="Shows the conflict status">
                <Button color="warning" variant="flat">
                  {currentRow.original?.conflict ? "Existing Conflict" : "No Conflict"}
                </Button>
              </Tooltip>

              <Select
                fullWidth
                disallowEmptySelection
                label="Annotated by"
                variant="underlined"
                selectedKeys={selectedUserId}
                defaultSelectedKeys={selectedUserId}
                onSelectionChange={(e) => {
                  const userId = e.currentKey;
                  const currUserAnnotation = allUserAnnotations.find((currAnn) => currAnn.user.id === userId);

                  if (currUserAnnotation) {
                    setSelectedAnnotations(currUserAnnotation);
                  } else {
                    setSelectedAnnotations({ user });
                  }
                  setSelectedUserId(e);
                }}
              >
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
                {user.id === projectCreatedById &&
                  allUserAnnotations
                    .filter((currUserAnnotation) => currUserAnnotation.user.id !== user.id)
                    .map((currUserAnnotation) => (
                      <SelectItem key={currUserAnnotation.user.id} value={currUserAnnotation.user.id}>
                        {currUserAnnotation.user.email}
                      </SelectItem>
                    ))}
              </Select>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            justifyContent: "space-between",
            maxWidth: "1000px"
          }}>
            <div style={{
              backgroundColor: "#FAFAFA",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              width: "60%",
              overflowY: "auto",
              maxHeight: "300px"
            }}>
              <h4 style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "16px" }}>Text to Annotate</h4>
              <div id="theText" style={{ whiteSpace: "normal", direction: "rtl", textAlign: "left" }}>
                {renderAnnotatedText()}
              </div>
            </div>

            <div style={{
              width: "35%",
            }}>
              {renderAssignedUserAnnotations()}
            </div>
          </div>
        </div>

        <div className="relative h-full" style={{ marginTop: "20px" }}>
          <div className="overflow-y-auto" style={{ height: "150px" }}>
            <RadioGroup
              isDisabled={selectedAnnotations.user.id !== user.id}
              label="Select Tag"
              orientation="horizontal"
              onValueChange={(value) => {
                setCurrentTag(tags.find((tag) => value === tag.tagName));
              }}
              value={currentTag.tagName}
            >
              {tags.map((tag) => (
                <Radio
                  key={tag.tagName}
                  value={tag.tagName}
                  style={{ display: "flex", alignItems: "center", marginRight: "10px" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: tag.color,
                      borderRadius: "50%",
                      marginRight: "5px",
                    }}
                  />
                  {tag.tagName}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <div className="absolute bottom-20 left-0 w-full p-3 flex justify-between">
            <Image
              className={buttonStyles.burgerMenu}
              onClick={() => {
                setSelectedUserId(new Set([user.id]));
                getPreviousRow();
                clearSelections();
              }}
              alt="previous"
              height={60}
              radius="sm"
              src="/images/left-arrow.svg"
              width={60}
            />
            <GhostButton
              isDisabled={selectedAnnotations.user.id !== user.id}
              customStyle={{
                fontSize: "25px",
                width: "500px",
                height: "50px",
              }}
              onPress={async () => {
                const annotationsWithoutCurrent = [...currentRow.original.annotations].filter(
                  (ann) => ann.user.id !== selectedAnnotations.user.id
                );
                const newAnnotations = selectedAnnotations.tags && selectedAnnotations.tags.length > 0
                  ? [...annotationsWithoutCurrent, { user: selectedAnnotations.user, tags: selectedAnnotations.tags }]
                  : annotationsWithoutCurrent;

                const { _id } = currentRow.original;
                await AxiosWrapper.post(
                  `http://localhost:8000/projects/${projectId}/jobs/${jobId}/annotations`,
                  JSON.stringify({ _id, annotations: newAnnotations })
                );

                setSelectedUserId(new Set([user.id]));
                getNextRow();
                clearSelections();
              }}
            >
              Submit
            </GhostButton>
            <Image
              className={buttonStyles.burgerMenu}
              onClick={() => {
                setSelectedUserId(new Set([user.id]));
                getNextRow();
                clearSelections();
              }}
              alt="next"
              height={60}
              radius="sm"
              src="/images/right-arrow.svg"
              width={60}
            />
          </div>
        </div>
      </Allotment>
      <Allotment vertical minSize={200}>
        <div className="m-4" style={{ maxHeight: "400px", maxWidth: "1000px", overflow: "auto" }}>
          <JsonView src={currentRow.original.data} />
        </div>
        <div style={{ height: "260px" }} className="overflow-y-auto">
          <JsonView src={selectedAnnotations?.tags || []} />
        </div>
      </Allotment>
    </Allotment>
  );
}
