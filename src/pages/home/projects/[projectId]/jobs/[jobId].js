/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import _ from "lodash";
import { MaterialReactTable } from "material-react-table";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Modal, ModalContent, ModalBody, ModalFooter, Button, useDisclosure,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  DropdownSection, cn,
  Progress,
  Avatar, AvatarGroup,
  Chip,
  ButtonGroup,
  Switch,
  Tooltip as StatsTooltip,
} from "@nextui-org/react";
import JsonView from "react18-json-view";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import cookieParse from "cookie-parse";
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,

} from "recharts";

import Navigation from "../../../../../components/Reusable/Navigation/navBarSideBar";
import LoadingSymbol from "../../../../../components/Reusable/loadingSymbol";
import "react18-json-view/src/style.css";
import closerLookButtonStyles from "../../../../../styles/components/Reusable/navbar.module.css";
import MainAnnotationScreen from "../../../../../components/Project/AnnotationScreens/mainScreen";
import AxiosWrapper from "../../../../../utils/axiosWrapper";
import DeleteDocumentIcon from "../../../../../components/Icons/DeleteDocument";
import EditDocumentIcon from "../../../../../components/Icons/EditDocumentIcons";
import AnnotatorEditComponent from "../../../../../components/Project/EditProject/AnnotationSetup/annotatorEditComponent";

const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

export default function JobPage({
  project, job, firstAnnotationDataBatch, projectId, jobId, totalRowCount,
  finishedAnnotations, user, stats, entropyf, projectCreatedById, // Add this here
}) {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenVisualization,
    onOpen: onOpenVisualization,
    onOpenChange: onOpenChangeVisualization,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [annotatedDataCount, setAnnotatedDataCount] = useState(finishedAnnotations);
  const [visualizationData, setVisualizationData] = useState(null);
  const [annotationData, setAnnotationData] = useState(firstAnnotationDataBatch);
  const [currentDataToAnnotate, setCurrentDataToAnnotate] = useState(null);
  const [showDetailedSplit, setShowDetailedSplit] = useState(false);
  const [onlyShowUnanotatedData, setOnlyShowUnanotatedData] = useState(false);
  const [onlyShowUnreviewedData, setOnlyShowUnreviewedData] = useState(false);
  const [statistics, setStatistics] = useState(stats);
  const [theEntropy, setTheEntropy] = useState(entropyf);
  const [showOnlyConflicts, setShowOnlyConflicts] = useState(false);


  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [currentItemCloserLook, setCurrentItemCloserLook] = useState(null);
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onOpenChange: onOpenChangeModal,
  } = useDisclosure();

  const [currentItemCloserLookUserAnnot, setCurrentItemCloserLookUserAnnot] = useState([]);
  const {
    isOpen: isOpenModalUserAnnot,
    onOpen: onOpenModalUserAnnot,
    onOpenChange: onOpenChangeModalUserAnnot,
  } = useDisclosure();

  const {
    isOpen: isOpenModalDelete,
    onOpen: onOpenModalDelete,
    onOpenChange: onOpenChangeModalDelete,
  } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      const nextAnnotationData = (await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations?page=${pagination.pageIndex}&itemsPerPage=${pagination.pageSize}&onlyShowUnanotatedData=${onlyShowUnanotatedData}`)).data;
  
      setStatistics(nextAnnotationData.stats);
  
      // Sort annotationData by `_id` in ascending order
      const sortedData = nextAnnotationData.data.sort((a, b) => a._id - b._id);
  
      if (onlyShowUnreviewedData) {
        setAnnotationData(sortedData.filter((d) => !d?.wasReviewed));
      } else {
        setAnnotationData(sortedData);
      }
      
      setAnnotatedDataCount(nextAnnotationData.finishedAnnotations);
  
      if (job.active_learning) {
        const { entropy } = nextAnnotationData;
        setTheEntropy(entropy);
      }
  
      setIsLoading(false);
    };
  
    fetchData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    showDetailedSplit,
    onlyShowUnanotatedData,
    onlyShowUnreviewedData,
  ]);
  




  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  const columns = [
    {
      accessorFn: (row) => row._id,
      id: "id",
      header: "ID",
      size: 150,
    },
    {
      id: "annotation",
      header: "Annotation",
      Cell: ({ cell }) => {
        const { annotations, _id } = cell.row.original;
  
        // Determine if the user is the project creator
        const isProjectCreator = user.id === projectCreatedById;
  
        return (
          <AvatarGroup key={_id}>
            {/* Show all users' annotations if the user is the project creator */}
            {isProjectCreator
              ? annotations.map((ann) => (
                  <Avatar
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentItemCloserLookUserAnnot([_id, { ...ann, user: ann.user.email }, ann]);
                      onOpenModalUserAnnot();
                    }}
                    key={ann.user.id}
                    name={ann.user.email.slice(0, 3)} // Show only the first three letters of the email
                  />
                ))
              : // Otherwise, show only the current user's annotation if they have one
                annotations
                  .filter((ann) => ann.user.id === user.id)
                  .map((ann) => (
                    <Avatar
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentItemCloserLookUserAnnot([_id, { ...ann, user: ann.user.email }, ann]);
                        onOpenModalUserAnnot();
                      }}
                      key={ann.user.id}
                      name={ann.user.email.slice(0, 3)}
                    />
                  ))}
          </AvatarGroup>
        );
      },
    },
    {
      accessorFn: (row) => {
        let dataToDisplay = row.data[job.field_to_annotate];
        if (typeof dataToDisplay === "object" && dataToDisplay !== null) {
          dataToDisplay = JSON.stringify(dataToDisplay);
        }

        return _.truncate(dataToDisplay, { length: 50 });
      },
      id: "data",
      header: "Data",
      size: 150,
    },
    {
      // eslint-disable-next-line no-underscore-dangle
      accessorKey: "none",
      header: "Review",
      size: 150,
      Cell: ({ cell }) => {
        // eslint-disable-next-line camelcase
        const { _id, data } = cell.row.original;
        if (cell.row.original?.wasReviewed) {
          return (
            <Button
              color="success"
              disabled
              disableAnimation
            >
              Approved
            </Button>
          );
        }
        return cell.row.original.annotations.length > 0 && (

          <ButtonGroup>
            <Button
              color="success"
              onPress={async () => {
                await AxiosWrapper.post(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations`, JSON.stringify({
                  _id,
                  wasReviewed: true,
                }));
                if (onlyShowUnreviewedData) {
                  setAnnotationData(annotationData.filter((currD) => currD._id !== _id));
                } else {
                  setAnnotationData(annotationData.map((currD) => {
                    if (currD._id === _id) {
                      return { ...currD, wasReviewed: true };
                    }
                    return currD;
                  }));
                }
              }}
            >
              Approve
            </Button>
            <Button
              color="danger"
              onPress={async () => {
                await AxiosWrapper.post(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations`, JSON.stringify({
                  _id,
                  annotations: [],
                }));
                setAnnotationData(annotationData.filter((currD) => currD._id !== _id));
              }}
            >
              Reject
            </Button>
          </ButtonGroup>

        );
      },
    },
    {
      accessorKey: "none",
      header: "",
      size: 150,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: ({ cell }) => {
        // eslint-disable-next-line camelcase
        const { data } = cell.row.original;
        return (
          <div>
            <Image
              className={closerLookButtonStyles.burgerMenu}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentItemCloserLook(data);
                onOpen();
              }}
              alt="nextui logo"
              height={25}
              radius="sm"
              src="/images/magnifier.svg"
              width={25}
            />
            {cell.row.original.conflict && job.assigned_reviewer_id === user.id && (
            <Image
              className={`${closerLookButtonStyles.burgerMenu} ml-5`}
              alt="nextui logo"
              height={25}
              radius="sm"
              src="/images/warning.svg"
              width={25}
            />
            )}
          </div>
        );
      },
    },
  ].filter((col) => {
    if (col.header !== "Review" || (col.header === "Review" && job.assigned_reviewer_id === user.id)) {
      return true;
    }
    return false;
  });



  const handleExport = async (type, merge = false) => {
    setIsLoading(true);
    try {
      let response;
      if (merge) {
        response = await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations/merge/export?type=${type}`, {
          responseType: "blob",
        });
      } else {
        response = await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations/export?type=${type}`, {
          responseType: "blob",
        });
      }
  
      if (response.status === 200) {
        const reader = new FileReader();
        reader.onload = () => {
          const textContent = reader.result;
          const blob = new Blob([textContent], { type: "application/ndjson;charset=utf-8" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `data.${type}`;
          a.click();
          window.URL.revokeObjectURL(url);
        };
        reader.readAsText(response.data, "UTF-8"); // Read the blob as UTF-8 text to handle Arabic characters correctly
      } else {
        console.error("Export failed.");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  




  const getStats = () => {
    if (statistics.type === "text_classification") {
      return (
        <>
          <StatsTooltip
            color="danger"
            className="capitalize"
            content={<div className="text-big font-bold">Inter-Annotator Agreement (IAA) assesses the level of agreement among different annotators when multiple individuals independently annotate the same set of data</div>}
            size="lg"
            showArrow
          >
            <Button variant="flat" color="danger" className="capitalize" disableAnimation disableRipple>
              {`Intra Conflict Percentage ${statistics.conflict_percentage}`}
            </Button>
          </StatsTooltip>
          <br />
          <br />
          <div className="flex flex-wrap gap-4">
            {statistics.result.map(({ _id, count }) => <Chip color="warning">{`${_id || "Not Annotated"}: ${count}`}</Chip>)}
          </div>
        </>
      );
    }
    return (
      <StatsTooltip
        color="danger"
        className="capitalize"
        content={<div className="text-big font-bold">Inter-Annotator Agreement (IAA) assesses the level of agreement among different annotators when multiple individuals independently annotate the same set of data</div>}
        size="lg"
        showArrow
      >
        <Button variant="flat" color="danger" className="capitalize" disableAnimation disableRipple>
          {`Intra Conflict Percentage ${statistics.conflict_percentage}`}
        </Button>
      </StatsTooltip>
    );
  };

  function MyChart({ data }) {
    const dataWithDateString = data.by_date.map((entry) => ({ ...entry, dateString: `${entry.day}-${entry.month}-${entry.year}` }));
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    return (
      <div>
        {/* Total Finished vs Total */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[data]}>
            <Bar dataKey="total" fill="#8884d8" />
            <Bar dataKey="total_finished" fill="#82ca9d" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
          </BarChart>
        </ResponsiveContainer>

        {/* Finished by User */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="count"
              isAnimationActive={false}
              data={data.by_user}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
            {data.by_user.map((entry, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Cell key={`cell-${index}`} fill={getRandomColor()} />
            ))}
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              payload={data.by_user.map((entry) => ({ value: entry.user_email, type: "circle", color: "#8884d8" }))}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Distribution of Count over Time */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataWithDateString}>
            <Bar dataKey="count" fill="#8884d8" />
            <XAxis dataKey="dateString" />
            <YAxis />
            <Tooltip />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
        <br />
        <br />
      </div>
    );
  }

  const mainBody = () => (
    <>
      <Modal
        size="3xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="m-4" style={{ maxHeight: "400px", maxWidth: "1000px", overflow: "auto" }}>
                  <JsonView src={currentItemCloserLook} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="3xl"
        isOpen={isOpenModalUserAnnot}
        onOpenChange={onOpenChangeModalUserAnnot}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="m-4" style={{ maxHeight: "400px", maxWidth: "1000px", overflow: "auto" }}>
                  <JsonView src={currentItemCloserLookUserAnnot[1]} />
                </div>
              </ModalBody>
              <ModalFooter>
                {
  job.assigned_reviewer_id === user.id && (
  <Button
    color="success"
    variant="flat"
    onPress={async () => {
      const _id = currentItemCloserLookUserAnnot[0];
      await AxiosWrapper.post(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations`, JSON.stringify({
        _id,
        annotations: [currentItemCloserLookUserAnnot[2]],
      }));
      await AxiosWrapper.post(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations`, JSON.stringify({
        _id,
        wasReviewed: true,
      }));
      if (onlyShowUnreviewedData) {
        setAnnotationData(annotationData.filter((currD) => currD._id !== _id));
      } else {
        setAnnotationData(annotationData.map((currD) => {
          if (currD._id === _id) {
            return { ...currD, wasReviewed: true };
          }
          return currD;
        }));
      }
      onClose();
    }}
  >
    Approve
  </Button>
  )
}
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {visualizationData && (
      <Modal
        size="5xl"
        style={{
          height: "500px",
        }}
        isOpen={isOpenVisualization}
        onOpenChange={onOpenChangeVisualization}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="m-4" style={{ maxHeight: "400px", maxWidth: "1000px", overflow: "auto" }}>
                  {/* <div className="flex flex-col ml-3 mr-5 mb-3"> */}
                  <Progress
                    aria-label="Downloading..."
                    size="md"
                    value={annotatedDataCount}
                    maxValue={totalRowCount}
                    minValue={0}
                    color="success"
                  />
                  <br />
                  {getStats()}

                  <br />
                  <br />
                  <MyChart data={visualizationData} />
                  <br />
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="absolute bottom-0 right-0 mr-5 mb-5">
                  <div className="flex space-x-4">
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => {
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>

                  </div>
                </div>
                {/* <br /> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      )}
      <Modal
        style={{
          height: "500px",
        }}
        isOpen={isOpenModal}
        onOpenChange={onOpenChangeModal}
        isDismissable={false}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <AnnotatorEditComponent
                created_by_id={project.created_by_id}
                onClose={onClose}
                projectId={projectId}
                jobId={jobId}
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
      <Modal
        style={{
          height: "150px",
        }}
        isOpen={isOpenModalDelete}
        onOpenChange={onOpenChangeModalDelete}
        isDismissable={false}
        size="sm"
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>

              <div className="text-4xl">Are you sure?</div>
              <p className="text-s text-gray-500 mb-2">This action cannot be undone</p>

              <div className="absolute bottom-0 right-0 mr-5 mb-5">
                <div className="flex space-x-4">
                  <Button
                    color="default"
                    variant="solid"
                    onPress={() => {
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    variant="ghost"
                    onPress={async () => {
                      await AxiosWrapper.delete(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}`);
                      window.location = `/home/projects/${projectId}`;
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>

            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <MaterialReactTable
  enableStickyHeader
  enableRowSelection
  columns={columns}
  data={showOnlyConflicts ? annotationData.filter((row) => row.conflict) : annotationData}
  page
  manualPagination
  onPaginationChange={(v) => {
    handlePaginationChange(v);
  }}
  rowCount={totalRowCount}
  state={{
    isLoading,
    pagination,
  }}


  muiTableBodyRowProps={({
  row, table,
}) => ({
  onClick: () => {
    const rowData = {
      ...row,
      totalRowCount,
      allRows: table.getRowModel().rowsById,
      pagination,
      setPagination,
      setShowDetailedSplit,
    };
    setShowDetailedSplit(!showDetailedSplit);
    setCurrentDataToAnnotate(rowData);
  },
  sx: {
    cursor: "pointer",
    // Only apply red background and text color for conflicts if the user is the project creator
    backgroundColor: user.id === projectCreatedById && row.original.conflict ? "#ffe6e6" : (row.original.annotations.length > 0 ? "#e1e9f5" : "white"),
    color: user.id === projectCreatedById && row.original.conflict ? "red" : "black",
  },
})}


  renderTopToolbarCustomActions={() => (
  <div className="w-full flex justify-between items-center">
    
    {/* Left Side: Job Menu Button */}
    <Dropdown
      showArrow
      classNames={{
        base: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black",
        arrow: "bg-default-200",
      }}
    >
      <DropdownTrigger>
        <Button variant="bordered">Job Menu</Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
        <DropdownSection title="Actions">
          <DropdownItem
            onClick={async () => {
              setIsLoading(true);
              const vizData = (await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/visualization`)).data;
              setVisualizationData(vizData);
              setIsLoading(false);
              onOpenVisualization();
            }}
            key="visualize"
            description="Visualize Annotation Info"
            startContent={<Image className={closerLookButtonStyles.burgerMenu} alt="visualize" height={25} radius="sm" src="/images/visualize.svg" width={25} />}
          >
            Visualize
          </DropdownItem>
          <DropdownItem
            onClick={() => handleExport("ndjson", false)}
            key="export"
            description="Export Annotated Data"
            startContent={<Image className={closerLookButtonStyles.burgerMenu} alt="ndjson" height={25} radius="sm" src="/images/json.svg" width={25} />}
          >
            Export as NdJson
          </DropdownItem>
          <DropdownItem
            onClick={() => handleExport("csv", false)}
            key="export"
            description="Export Annotated Data"
            startContent={<Image className={closerLookButtonStyles.burgerMenu} alt="csv" height={25} radius="sm" src="/images/csv.svg" width={25} />}
          >
            Export as CSV
          </DropdownItem>
          {user.id === job.created_by_id && !job?.active_learning && (
            <DropdownItem onClick={onOpenModal} key="edit" description="Edit job annotators" startContent={<EditDocumentIcon className={iconClasses} />}>
              Annotators
            </DropdownItem>
          )}
        </DropdownSection>
        {job.assigned_reviewer_id === user.id && (
          <DropdownSection>
            <DropdownItem
              onClick={() => handleExport("ndjson", true)}
              key="merge"
              className="text-warning"
              color="warning"
              description="Merge Reviewed Annotations"
              startContent={<Image className={closerLookButtonStyles.burgerMenu} alt="merge" height={25} radius="sm" src="/images/merge.svg" width={25} />}
            >
              Merge
            </DropdownItem>
          </DropdownSection>
        )}
        {user.id === job.created_by_id && (
          <DropdownSection>
            <DropdownItem
              onClick={onOpenModalDelete}
              key="delete"
              className="text-danger"
              color="danger"
              description="Permanently delete job"
              startContent={<DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />}
            >
              Delete Job
            </DropdownItem>
          </DropdownSection>
        )}
      </DropdownMenu>
    </Dropdown>
    
    {/* Center: Progress Bar */}
    <div className="flex flex-col ml-3 mr-5 mb-3">
      <Progress aria-label="Downloading..." size="md" value={annotatedDataCount} maxValue={totalRowCount} minValue={0} color="success" />
    </div>

    {/* Right Side: Toggles */}
    <div className="flex space-x-4 items-center">
      
      {/* Toggle for Only Un-annotated Data */}
      {!job?.active_learning && (
        <Switch
          onChange={(e) => setOnlyShowUnanotatedData(e.target.checked)}
          checked={onlyShowUnanotatedData}
          aria-label="Only show un-annotated data"
        >
          Only show Un-annotated Data
        </Switch>
      )}

      {/* Toggle for Show Only Conflicts */}
      <Switch
        onChange={(e) => setShowOnlyConflicts(e.target.checked)}
        checked={showOnlyConflicts}
        aria-label="Show only conflicts"
      >
        Show Only Conflicts
      </Switch>
    </div>
  </div>
)}



/>

    </>
  );

  return (
    <>
      <Navigation
        showCreateProjectButton={false}
        breadcrumbs={[
          { text: "Projects", href: "/home/projects" },
          { text: project.title, href: `/home/projects/${project.id}` },
          { text: job.title, href: `/home/projects/${project.id}/jobs/${job.id}` },
        ]}
      />

      {isLoading ? <LoadingSymbol height={200} width={200} /> : (
        <div style={{ width: "100%", height: "100vh" }}>

          {/* {showDetailedSplit ? (
            <Allotment
              minSize={200}
              defaultSizes={[50, 200]}
            >
              {mainBody()}
              <MainAnnotationScreen
                data={currentDataToAnnotate}
                user={user}
                projectId={projectId}
                jobId={jobId}
                type={job.type}
                annotatedDataCount={annotatedDataCount}
                setAnnotatedDataCount={setAnnotatedDataCount}
                job={job}
              />
            </Allotment>
          ) : mainBody()} */}
          {showDetailedSplit ? (
            <MainAnnotationScreen
              data={currentDataToAnnotate}
              user={user}
              projectId={projectId}
              jobId={jobId}
              type={job.type}
              annotatedDataCount={annotatedDataCount}
              setAnnotatedDataCount={setAnnotatedDataCount}
              job={job}
              setShowDetailedSplit={setShowDetailedSplit}
            />
          ) : mainBody()}

        </div>

      )}

    </>

  );
}

export async function getServerSideProps(context) {
  const {
    projectId,
    jobId,
  } = context.query;

  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  try {
    const project = (await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}`, {
      accessToken: accessToken || "",
    })).data;

    const job = (await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}`, {
      accessToken: accessToken || "",
    })).data;

    const firstAnnotationDataBatch = (await AxiosWrapper.get(`https://takween.ddns.net/projects/${projectId}/jobs/${jobId}/annotations?page=${0}&itemsPerPage=${10}&onlyShowUnanotatedData=${true}`, {
      accessToken: accessToken || "",
    })).data;

    const { entropy } = firstAnnotationDataBatch;

    const { stats } = firstAnnotationDataBatch;

    const user = (await AxiosWrapper.get("https://takween.ddns.net/currentuser", {
      accessToken: accessToken || "",
    })).data;

    return {
      props: {
        projectId,
        stats,
        jobId,
        entropyf: entropy,
        project: project.project,
        job: job.job,
        firstAnnotationDataBatch: firstAnnotationDataBatch.data,
        totalRowCount: firstAnnotationDataBatch.totalRowCount,
        finishedAnnotations: firstAnnotationDataBatch.finishedAnnotations,
        finishedAnnotationsByUser: firstAnnotationDataBatch.finishedAnnotationsByUser,
        user,
        projectCreatedById: project.project.created_by_id, // Pass the creator ID here
      },
    };
  } catch (error) {
    if (error.response.status === 401) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }
  return null;
}





