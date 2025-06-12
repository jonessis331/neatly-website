// src/components/common/Footer.tsx - Simplified and guaranteed working version
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Stack,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { FolderOpen, GitHub, Twitter, School } from "@mui/icons-material";
import neatlyLogo from "../../assets/neatly_icon.png";

type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface FooterProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentRoute }) => {
  const theme = useTheme();

  // Get current theme mode from the theme object
  const isDarkMode = theme.palette.mode === "dark";

  // Debug log
  console.log("Footer props:", { hasOnNavigate: !!onNavigate, currentRoute });

  const handleClick = (route: Route) => {
    console.log("Footer click:", route);
    if (onNavigate) {
      onNavigate(route);
    } else {
      console.error("onNavigate function not provided!");
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (currentRoute !== "landing") {
      onNavigate("landing");
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };
  console.log("Footer rendered with:", {
    onNavigate: !!onNavigate,
    currentRoute,
  });

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: "background.paper",
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                component="img"
                src={neatlyLogo}
                alt="Neatly Logo"
                sx={{
                  height: 40,
                  width: "auto",
                  mr: 1,
                  filter: isDarkMode
                    ? "invert(88%) sepia(11%) saturate(4944%) hue-rotate(176deg) brightness(99%) contrast(97%)"
                    : "invert(47%) sepia(27%) saturate(1393%) hue-rotate(175deg) brightness(83%) contrast(89%)",
                }}
              />
              <Typography variant="h4" fontWeight={800}>
                Neatly
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.7 }}
            >
              The privacy-first AI file organizer. Finally, a tool that actually
              respects your data and gets your files organized.
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton
                component="a"
                href="https://github.com/neatly-app"
                target="_blank"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    transform: "scale(1.1)",
                  },
                }}
              >
                <GitHub />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com/neatlyapp"
                target="_blank"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Twitter />
              </IconButton>
            </Stack>
          </Grid>

          {/* Product Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Product
            </Typography>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("features")}
              >
                Features
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("how")}
              >
                How It Works
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("pricing")}
              >
                Pricing
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("faq")}
              >
                FAQ
              </Typography>
            </Stack>
          </Grid>

          {/* Pages Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Pages
            </Typography>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => handleClick("contact-support")}
              >
                Contact Support
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("home")}
              >
                Create account
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => scrollToSection("home")}
              >
                Login to account
              </Typography>
            </Stack>
          </Grid>

          {/* Legal Section */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Legal
            </Typography>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => handleClick("refund-policy")}
              >
                Refund Policy
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => handleClick("terms-of-service")}
              >
                Terms of Service
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateX(4px)",
                  },
                }}
                onClick={() => handleClick("cancellation-policy")}
              >
                Cancellation Policy
              </Typography>
            </Stack>
          </Grid>

          {/* Company Section */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Company
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.7 }}
            >
              Created by developers who were tired of messy file systems and
              privacy-invasive "solutions." Local-first, open-source, and
              actually useful.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" />
              <Typography variant="body2" fontWeight={600}>
                Built by Developers
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2025 Neatly. Built with respect for your privacy.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for organized minds
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
