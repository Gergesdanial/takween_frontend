import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import {
  ListItemButton, ListItemText, List,
} from "@mui/material";
import Link from "next/link";
import Logo from "../logo";
import DataCollectionIcon from "../../Icons/dataCollectionIcon";
import ProjectsIcon from "../../Icons/projectIcon";
import DataProcessing from "../../Icons/processingIcon";
import VisualizeIcon from "../../Icons/VisualizeIcon";
import AutomaticIcon from "../../Icons/AutomaticIcon"; // Added import for AutomaticIcon

export default function SideBar({ drawerState, setDrawerState }) {
  return (
    <div>
      <Drawer
        anchor="left"
        open={drawerState}
        onClose={() => setDrawerState(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerState(false)}
          onKeyDown={() => setDrawerState(false)}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Logo
              spin
              height={50}
              width={50}
              style={{
                marginTop: "5px",
                marginBottom: "5px",
                marginRight: "10px",
              }}
            />
            <p className="font-bold text-inherit">Takween 2.0</p>
          </div>
          <Divider />
        </Box>
        <List>
          <List>
            <Link href="/home/projects">
              <ListItemButton key="projects" disablePadding>
                <ProjectsIcon />
                <ListItemText primary="Projects" className="ml-3" />
              </ListItemButton>
            </Link>
            <Link href="/home/data-collection">
              <ListItemButton key="dataCollection" disablePadding>
                <DataCollectionIcon />
                <ListItemText primary="Data Collection" className="ml-3" />
              </ListItemButton>
            </Link>
            <Link href="/home/data-processing">
              <ListItemButton key="dataProcessing" disablePadding>
                <DataProcessing />
                <ListItemText primary="Data Processing" className="ml-3" />
              </ListItemButton>
            </Link>
            <Link href="/home/automatic-annotation">
              <ListItemButton key="automaticAnnotation" disablePadding>
                <AutomaticIcon /> {/* AutomaticIcon is now imported */}
                <ListItemText primary="Automatic Annotation" className="ml-3" />
              </ListItemButton>
            </Link>
            <Link href="/home/visualization">
              <ListItemButton key="visualization" disablePadding>
                <VisualizeIcon />
                <ListItemText primary="   Visualization" className="ml-3" />
              </ListItemButton>
            </Link>
          </List>
        </List>
      </Drawer>
    </div>
  );
}
