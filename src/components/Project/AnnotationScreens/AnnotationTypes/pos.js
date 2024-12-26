import { useState } from "react";
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

export default function PartOfSpeechAnnotationComponent({
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
}) {
  const allUserAnnotations = currentRow.original.annotations;
  const [selectedUserId, setSelectedUserId] = useState(new Set([user.id]));
  const [tags] = useState(currentRow.original.tags.map((currTag) => ({
    tagName: currTag,
    color: randomColor({ luminosity: "light" }),
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

  // Function to render the text with highlights for annotated words, including punctuation
// Function to render the text with highlights for annotated words and punctuation
const renderAnnotatedText = () => {
  const text = currentRow.original.data[currentRow.original.fieldToAnnotate];
  const annotations = selectedAnnotations.tags || [];

  // Split the text based on spaces, but keep the word boundaries intact
  const words = text.match(/[\u0600-\u06FF\w]+|[^\s\w]/g); // Matches Arabic words, letters, or punctuation

  return words.map((word, index) => {
    const matchingAnnotation = annotations.find((annotation) => annotation.text === word);
    const tagInfo = matchingAnnotation
      ? tags.find((tag) => tag.tagName.toLowerCase() === matchingAnnotation.tag.toLowerCase())
      : null;
    const backgroundColor = tagInfo ? tagInfo.color : "transparent";

    return (
      <span
        key={index}
        onClick={() => handleWordClick(word)}
        style={{
          backgroundColor,
          padding: "2px",
          borderRadius: "4px",
          margin: "0 2px",
          display: "inline-block",
          cursor: "pointer",
          direction: "rtl", // Ensure right-to-left display for Arabic text
          whiteSpace: "nowrap", // Prevent breaking up words into letters
        }}
      >
        {word}
      </span>
    );
  });
};

  const clearSelections = () => {
    setSelectedAnnotations({ ...selectedAnnotations, tags: [] });
  };

  return (
    <Allotment minSize={300} defaultSizes={[200, 50]}>
      <Allotment vertical minSize={300} defaultSizes={[200, 50]}>
        <div>
          <div className="p-2">
            <div style={{ display: "flex", gap: "16px" }}>
              <div className="flex gap-2">
                <Button
                  color="warning"
                  onPress={() => {
                    setShowDetailedSplit(false);
                  }}
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
              </div>
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
                {job.assigned_reviewer_id === user.id &&
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
          <div
            style={{
              height: "100vh",
              width: "100vw",
              backgroundColor: "#FAFAFA",
              padding: "20px",
              overflowY: "auto",
              maxHeight: "400px",
            }}
          >
            <div style={{ maxWidth: "700px" }}>
              <div
                id="theText"
                style={{
                  minHeight: "300px",
                  padding: "10px",
                  whiteSpace: "normal",
                  direction: "rtl",
                  textAlign: "left",
                }}
              >
                {renderAnnotatedText()}
              </div>
            </div>
            <button
              onClick={clearSelections}
              type="button"
              className="clear-button"
              style={{
                color: "red",
                position: "absolute",
                bottom: "10px",
                right: "10px",
              }}
            >
              Clear Selections
            </button>
          </div>
        </div>
        <div className="relative h-full">
          <div className="overflow-y-auto" style={{ height: "150px" }}>
            <div className="mr-3 ml-3 mt-3">
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
                let newAnnotations = [...annotationsWithoutCurrent];
                if (selectedAnnotations.tags && selectedAnnotations.tags.length > 0) {
                  newAnnotations.push({
                    user: selectedAnnotations.user,
                    tags: selectedAnnotations.tags,
                  });
                  setAnnotatedDataCount(annotatedDataCount + 1);
                } else if (selectedAnnotations.tags && selectedAnnotations.tags.length === 0) {
                  newAnnotations = newAnnotations.filter((ann) => ann.user.id !== selectedAnnotations.user.id);
                  setAnnotatedDataCount(annotatedDataCount - 1);
                }

                const { _id } = currentRow.original;
                await AxiosWrapper.post(
                  `http://50.19.124.30:8000/projects/${projectId}/jobs/${jobId}/annotations`,
                  JSON.stringify({
                    _id,
                    annotations: newAnnotations,
                  })
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
