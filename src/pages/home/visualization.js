import { useState } from "react";
import { useDisclosure, Modal, ModalBody, ModalContent, Card, CardFooter, Button } from "@nextui-org/react";
import Image from "next/image";
import Navigation from "../../components/Reusable/Navigation/navBarSideBar";
import Histogram from "../../components/Visualization/histogram";
import Heatmap from "../../components/Visualization/heatmap";
import Matrix from "../../components/Visualization/martix";
import Scatter from "../../components/Visualization/scatter";  // Import Scatter component
import AxiosWrapper from "../../utils/axiosWrapper";
import cookieParse from "cookie-parse";

export default function Visualization({ projects, user }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalComponent, setModalComponent] = useState(null);

  const openModal = (componentType) => {
    setModalComponent(componentType);
    onOpen();
  };

  return (
    <>
      <Navigation
        showCreateProjectButton={false}
        breadcrumbs={[{ text: "Visualization", href: "/home/visualization" }]}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        hideCloseButton
        className="custom-modal"
      >
        <ModalContent>
          <div className="modal-header">
            <h2 className="text-xl font-semibold">Visualization Tool</h2>
            <Button auto light onPress={onOpenChange} className="close-button">✕</Button>
          </div>
          <ModalBody>
            {modalComponent === "histogram" && <Histogram projects={projects} user={user} />}
            {modalComponent === "heatmap" && <Heatmap projects={projects} user={user} />}
            {modalComponent === "matrix" && <Matrix projects={projects} user={user} />}
            {modalComponent === "scatter" && <Scatter projects={projects} user={user} />}  {/* Scatter component */}
          </ModalBody>
        </ModalContent>
      </Modal>

      <div className="flex flex-wrap gap-4 p-4">
        {[
          { type: "histogram", title: "Histogram", image: "/images/histogram.svg" },
          { type: "heatmap", title: "Heatmap", image: "/images/heatmap.svg" },
          { type: "matrix", title: "Entity Co-occurrence Matrix", image: "/images/matrix.svg" },
          { type: "scatter", title: "Scatter-Plot", image: "/images/scatter.svg" },  // Scatter button
        ].map((item, idx) => (
          <Card
            key={idx}
            isFooterBlurred
            radius="lg"
            isPressable
            onPress={() => openModal(item.type)}
            className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-lg"
            css={{ maxWidth: "200px" }}
          >
            <Image
              alt={item.title}
              className="object-cover rounded-t-lg"
              height={140}
              src={item.image}
              width={200}
            />
            <CardFooter className="py-1.5">
              <p className="text-center text-sm font-medium">{item.title}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <style jsx>{`
        .custom-modal {
          background-color: white;
          border-radius: 8px;
          padding: 0;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .close-button {
          font-size: 1.25rem;
          cursor: pointer;
          background: none;
          border: none;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  try {
    const projects = (await AxiosWrapper.get("http://50.19.124.30:8000/projects", {
      accessToken: accessToken || "",
    })).data;

    const projectsWithUsersDataSources = await Promise.all(projects.map(async (project) => {
      const userCreatedProject = (await AxiosWrapper.get(`http://50.19.124.30:8000/users/${project.created_by_id}`, {
        accessToken: accessToken || "",
      })).data;
      const fileDataSources = (await AxiosWrapper.get(`http://50.19.124.30:8000/projects/${project.id}/file-data-sources`, {
        accessToken: accessToken || "",
      })).data;
      return { ...project, user: userCreatedProject, dataSources: fileDataSources };
    }));

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
