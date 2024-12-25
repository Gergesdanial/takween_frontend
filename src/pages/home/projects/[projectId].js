import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Divider,
  Card, CardHeader, CardFooter, Avatar, useDisclosure, Modal, ModalBody, ModalContent, Button, CircularProgress,
  Accordion, AccordionItem,
} from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import moment from "moment-timezone";
import { useState } from "react";
import cookieParse from "cookie-parse";
import Slider from "react-slick";
import Navigation from "../../../components/Reusable/Navigation/navBarSideBar";
import AddDataComponent from "../../../components/Project/EditProject/DataSetup/addDataComponent";
import NewJobComponent from "../../../components/Project/EditProject/AnnotationSetup/newJobComponent";
import AxiosWrapper from "../../../utils/axiosWrapper";
import ManageUsersComponent from "../../../components/Project/EditProject/UserManagement/manageUsersComponent";

export default function ProjectDetailPage({
  projectId, project, jobs, user,
}) {
  const {
    isOpen,
    onOpen,
    onOpenChange,
  } = useDisclosure();

  const {
    isOpen: isOpenModalDelete,
    onOpen: onOpenModalDelete,
    onOpenChange: onOpenChangeModalDelete,
  } = useDisclosure();

  const [modalComponent, setModalComponent] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const getCurrentModalComponent = (onClose) => {
    switch (modalComponent) {
      case "data":
        return <AddDataComponent projectId={projectId} onClose={onClose} />;
      case "newAnnotationJob":
        return <NewJobComponent projectId={projectId} onClose={onClose} />;
      case "manageUsers":
        return (
          <ManageUsersComponent
            projectId={projectId}
            onClose={onClose}
            projectCreatedById={project.created_by_id}
          />
        );
      default:
        return null;
    }
  };

  const getJobImageDependingOnType = (annotationType) => {
    switch (annotationType) {
      case "text_classification":
        return "/images/classification.svg";
      case "part_of_speech":
        return "/images/pos.svg";
      case "named_entity_recognition":
        return "/images/ner.svg";
      default:
        return "";
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: true,
    adaptiveHeight: true,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
  };

  const sliderSettingsJobs = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
  };

  const filteredJobs = jobs.filter((job) => job.title.toLowerCase().includes(searchInput));

  return (
    <>
      <Navigation
        showCreateProjectButton={false}
        breadcrumbs={[
          { text: "Projects", href: "/home/projects" },
          { text: project.title, href: `/home/projects/${project.id}` }]}
      />

      <Modal
        style={{ height: "500px" }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              {getCurrentModalComponent(onClose)}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <Modal
        style={{ height: "150px" }}
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
              <p className="text-xs text-gray-500">This action cannot be undone</p>
              <div className="absolute bottom-0 right-0 mr-5 mb-5 pt-3">
                <div className="flex space-x-4">
                  <Button color="default" variant="solid" onPress={() => onClose()}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    variant="ghost"
                    onPress={async () => {
                      await AxiosWrapper.delete(`http://localhost:8000/projects/${projectId}`);
                      window.location = "http://localhost:3000/home/projects";
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

      <div className="flex">
        <div className="w-3/6 bg-300 p-4">
          <div className="p-3">
            <h1 style={{ fontSize: "35px", paddingTop: "10px", paddingRight: "20px" }}>
              <strong>{project.title}</strong>
            </h1>
            <Accordion disabledKeys={["2"]}>
              <AccordionItem key="1" aria-label="Project Description" subtitle="Press to expand" title="Project Description">
                <h4>{project.description ? project.description : "No description..."}</h4>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="w-3/6 bg-300 p-2">
          <div className="slider-container m-10">
            {(user.can_add_data || user.can_create_jobs) && (
              <Slider {...sliderSettings}>
                {user.can_add_data && (
                  <Card
                    isHoverable
                    className="max-w-[180px] min-w-[180px] min-h-[80px] max-h-[80px] mx-4 my-6"
                    isPressable
                    onPress={() => {
                      setModalComponent("data");
                      onOpen();
                    }}
                  >
                    <CardHeader className="flex gap-3">
                      <Image alt="nextui logo" height={30} src="/images/files.svg" width={40} />
                      <div className="flex flex-col">
                        <p className="text-sm">
                          Edit your Project&apos;s <strong>Data</strong>
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                )}
                {user.id === project.created_by_id && (
                  <Card
                    isHoverable
                    className="max-w-[180px] min-w-[180px] min-h-[80px] max-h-[80px] mx-4 my-6"
                    isPressable
                    onPress={onOpenModalDelete}
                  >
                    <CardHeader className="flex gap-3">
                      <Image alt="nextui logo" height={30} src="/images/delete.svg" width={40} />
                      <div className="flex flex-col">
                        <p className="text-md" style={{ color: "#bf0d0d" }}>Delete Project</p>
                      </div>
                    </CardHeader>
                  </Card>
                )}
                {user.can_create_jobs && (
                  <Card
                    isHoverable
                    className="max-w-[180px] min-w-[180px] min-h-[80px] max-h-[80px] mx-4 my-6"
                    isPressable
                    onPress={() => {
                      setModalComponent("newAnnotationJob");
                      onOpen();
                    }}
                  >
                    <CardHeader className="flex gap-3">
                      <Image alt="nextui logo" height={50} src="/images/annotation.svg" width={60} />
                      <div className="flex flex-col">
                        <p className="text-md">Create New Job</p>
                      </div>
                    </CardHeader>
                  </Card>
                )}
                {user.id === project.created_by_id && (
                  <Card
                    isHoverable
                    className="max-w-[180px] min-w-[180px] min-h-[80px] max-h-[80px] mx-4 my-6"
                    isPressable
                    onPress={() => {
                      setModalComponent("manageUsers");
                      onOpen();
                    }}
                  >
                    <CardHeader className="flex gap-3">
                      <Image alt="nextui logo" height={50} src="/images/users.svg" width={60} />
                      <div className="flex flex-col">
                        <p className="text-md">Manage Users</p>
                      </div>
                    </CardHeader>
                  </Card>
                )}
              </Slider>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 m-3">
        <h1 style={{ fontSize: "25px", marginBottom: "10px" }}>
          <strong>Active Jobs</strong>
        </h1>
        <input
          type="search"
          placeholder="Search jobs"
          value={searchInput}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded"
          style={{ width: "100%" }}
        />
        {filteredJobs.length > 0 && (
          <Slider {...sliderSettingsJobs}>
            {filteredJobs.map((job) => {
              const progress = job.finishedAnnotations && job.totalRowCount
                ? (job.finishedAnnotations / job.totalRowCount) * 100
                : 0;

              return (
                <div
                  key={job.id}
                  style={{
                    padding: "20px 0", // Added padding above and below each button
                  }}
                >
                  <Link href={`${project.id}/jobs/${job.id}`} key={job.id}>
                    <Card
                      className="mb-4 mt-4 max-w-[250px] min-w-[250px]"
                      isPressable
                      isHoverable
                      style={{ margin: "0 auto" }}
                    >
                      <CardHeader className="flex gap-3">
                        <CircularProgress
                          aria-label="Loading..."
                          size="sm"
                          value={progress}
                          color="warning"
                          showValueLabel
                        />
                        <div className="flex flex-col">
                          <p className="text-md text-left">{job.title}</p>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardFooter className="flex justify-between">
                        <span className="text-xs text-gray-500">
                          {moment(job.created_at)
                            .tz("America/New_York")
                            .format("llll")}
                        </span>
                        <Avatar
                          isBordered
                          className="transition-transform"
                          name={job.user.email}
                          size="sm"
                        />
                      </CardFooter>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </>
  );
}

function CustomArrow({ direction, onClick }) {
  const positionStyle =
    direction === "left" ? { left: "-30px" } : { right: "-2px" };

  return (
    <div
      onClick={onClick}
      className={`slick-arrow slick-${direction}`}
      style={{
        display: "block",
        background: "#808080",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        lineHeight: "38px",
        textAlign: "center",
        color: "white",
        fontSize: "18px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        position: "absolute",
        top: "50%",
        zIndex: 1,
        ...positionStyle,
        transform: "translateY(-50%)",
        cursor: "pointer",
        transition: "transform 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#6c757d")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#808080")}
    >
      {direction === "left" ? "<" : ">"}
    </div>
  );
}



export async function getServerSideProps(context) {
  const { projectId } = context.query;
  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  try {
    const project = (await AxiosWrapper.get(`http://50.19.124.30:8000/projects/${projectId}`, {
      accessToken: accessToken || "",
    })).data;
    const jobs = (await AxiosWrapper.get(`http://50.19.124.30:8000/projects/${projectId}/jobs`, {
      accessToken: accessToken || "",
    })).data;

    // Fetch detailed information for each job
    const jobsWithUsers = await Promise.all(jobs.jobs.map(async (job) => {
      const userCreatedJob = (await AxiosWrapper.get(`http://50.19.124.30:8000/users/${job.created_by_id}`, {
        accessToken: accessToken || "",
      })).data;

      // Fetch finishedAnnotations and totalRowCount for each job
      const jobDetails = (await AxiosWrapper.get(`http://50.19.124.30:8000/projects/${projectId}/jobs/${job.id}/annotations/summary`, {
        accessToken: accessToken || "",
      })).data;

      return { 
        ...job, 
        user: userCreatedJob, 
        finishedAnnotations: jobDetails.finishedAnnotations, 
        totalRowCount: jobDetails.totalRowCount 
      };
    }));

    const user = (await AxiosWrapper.get("http://50.19.124.30:8000/currentuser", {
      accessToken: accessToken || "",
    })).data;

    return {
      props: {
        project: project.project, jobs: jobsWithUsers, projectId, user,
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



