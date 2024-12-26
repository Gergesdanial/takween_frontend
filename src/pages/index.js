import {
  Navbar, NavbarBrand, NavbarContent, Button,
  Modal, ModalContent, useDisclosure,
} from "@nextui-org/react";
import { TypeAnimation } from "react-type-animation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Logo from "../components/Reusable/logo";
import SignUpComponent from "../components/authentication/signup";
import SignInComponent from "../components/authentication/signin";
import AxiosWrapper from "../utils/axiosWrapper";

export default function Root() {
  const { isOpen: isOpenLogin, onOpen: onOpenLogin, onOpenChange: onOpenChangeLogin } = useDisclosure();
  const { isOpen: isOpenSignUp, onOpen: onOpenSignUp, onOpenChange: onOpenChangeSignUp } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = (await AxiosWrapper.get("https://50.19.124.30:8000/currentuser")).data;
        if (currentUser) {
          router.push("/home/projects");
        }
      } catch (error) { /* error handling here */ }
    };
    fetchUser();
  }, []);

  return (
    <>
      <Navbar maxWidth="fluid" isBordered isBlurred style={{ backgroundColor: "#3a4158", padding: "0 20px" }}>
        <NavbarBrand>
          <Logo spin height={40} width={40} />
          <p style={{ marginLeft: "12px", color: "#fff", fontSize: "20px" }} className="font-bold">Takween 2.0</p>
        </NavbarBrand>
        <NavbarContent>
          <Button onPress={onOpenLogin} auto ghost size="lg" color="warning">Log In</Button>
          <Button onPress={onOpenSignUp} auto ghost size="lg" color="warning">Sign Up</Button>
        </NavbarContent>
      </Navbar>
      <div className="flex justify-center items-center" style={{ height: '92vh' }}>
        <div className="flex flex-col justify-center items-center w-1/2">
          <Logo spin height={250} width={250} />
          <h1 style={{ color: "#3a4158" }} className="text-5xl mt-10">Empower Your Data</h1>
        </div>
        <div className="w-1/2">
          <TypeAnimation
            sequence={[
              "Explore Automated Annotation", 2000,
              "Unleash Powerful Analytical Visualizations", 2000,
              "Enhance Collaboration Across Teams", 2000,
              "Streamline Data Collection Processes", 2000,
              "Maximize Operational Efficiency", 2000
            ]}
            wrapper="h1"
            cursor={true}
            repeat={Infinity}
            style={{ fontSize: "3em", fontWeight: "bold", color: "#3a4158", textAlign: "center", padding: "0 5%" }}
          />
        </div>
      </div>
      <Modal isDismissable={false} isOpen={isOpenLogin} onOpenChange={onOpenChangeLogin} placement="center" backdrop="blur">
        <ModalContent>
          <SignInComponent onClose={() => onOpenChangeLogin(false)} />
        </ModalContent>
      </Modal>
      <Modal isDismissable={false} isOpen={isOpenSignUp} onOpenChange={onOpenChangeSignUp} placement="center" backdrop="blur">
        <ModalContent>
          <SignUpComponent onClose={() => onOpenChangeSignUp(false)} />
        </ModalContent>
      </Modal>
    </>
  );
}
