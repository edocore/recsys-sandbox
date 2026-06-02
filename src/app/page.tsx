import Box from "@mui/material/Box";
import TopBar from "@/components/TopBar";
import Feed from "@/components/Feed";
import PMDrawer from "@/components/PMDrawer";
import ExplainerOverlay from "@/components/ExplainerOverlay";
import BackToTopFab from "@/components/BackToTopFab";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <TopBar />
      <Feed />
      <PMDrawer />
      <ExplainerOverlay />
      <BackToTopFab />
    </Box>
  );
}
