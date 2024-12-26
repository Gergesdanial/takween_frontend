import { useState } from "react";
import { useDisclosure, Modal, ModalBody, ModalContent, Card, CardFooter, Button } from "@nextui-org/react";
import Image from "next/image";
import Navigation from "../../components/Reusable/Navigation/navBarSideBar";
import NERAnnotation from "../../components/AutomaticAnnotation/ner";
import POSAnnotation from "../../components/AutomaticAnnotation/pos";
import TCAnnotation from "../../components/AutomaticAnnotation/tc";
import ViewAnnotation from "../../components/AutomaticAnnotation/uploadModel";
import OpenAIAnnotation from "../../components/AutomaticAnnotation/openai"; // Import the OpenAI Annotation component
import AxiosWrapper from "../../utils/axiosWrapper";
import cookieParse from "cookie-parse";

export default function AutomaticAnnotation({ projects, user }) {
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
        breadcrumbs={[
          { text: "Automatic Annotation", href: "/home/automatic-annotation" },
        ]}
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
            <h2 className="text-xl font-semibold">Annotation Tool</h2>
            <Button auto light onPress={onOpenChange} className="close-button">✕</Button>
          </div>
          <ModalBody>
            {modalComponent === "nerAnnotation" && <NERAnnotation projects={projects} user={user} />}
            {modalComponent === "posAnnotation" && <POSAnnotation projects={projects} user={user} />}
            {modalComponent === "tcAnnotation" && <TCAnnotation projects={projects} user={user} />}
            {modalComponent === "uploadModel" && <ViewAnnotation projects={projects} user={user} />}
            {modalComponent === "openaiAnnotation" && <OpenAIAnnotation projects={projects} user={user} />}
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className="flex flex-wrap gap-4 p-4">
        {[
          { type: "nerAnnotation", title: "NER Annotation", image: "/images/ner.svg" },
          { type: "posAnnotation", title: "POS Tagging", image: "/images/pos.svg" },
          { type: "tcAnnotation", title: "Text Classification", image: "/images/classification.svg" },
          { type: "uploadModel", title: "Custom Model", image: "/images/upload.svg" },
          { type: "openaiAnnotation", title: "OpenAI Annotation", image: "/images/openai.svg" }, // OpenAI Annotation button
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
              className={`object-cover rounded-t-lg ${item.type === "uploadModel" ? "custom-model-image" : ""}`}
              height={item.type === "uploadModel" ? 80 : 120}
              src={item.image}
              width={180}
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
        .custom-model-image {
          object-fit: contain;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || "";
  const { accessToken } = cookieParse.parse(cookies);

  try {
    const projects = (await AxiosWrapper.get("https://50.19.124.30/projects", {
      accessToken: accessToken || "",
    })).data;

    const projectsWithUsersDataSources = await Promise.all(projects.map(async (project) => {
      const userCreatedProject = (await AxiosWrapper.get(`https://50.19.124.30/users/${project.created_by_id}`, {
        accessToken: accessToken || "",
      })).data;
      const fileDataSources = (await AxiosWrapper.get(`https://50.19.124.30/projects/${project.id}/file-data-sources`, {
        accessToken: accessToken || "",
      })).data;
      return { ...project, user: userCreatedProject, dataSources: fileDataSources };
    }));

    const user = (await AxiosWrapper.get("https://50.19.124.30/currentuser", {
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
