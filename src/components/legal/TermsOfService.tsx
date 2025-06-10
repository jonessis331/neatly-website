// src/components/legal/RefundPolicy.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
  Stack,
} from "@mui/material";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";

type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface LegalPageProps {
  onNavigate: (route: Route) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentRoute: Route;
}

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: { main: mode === "light" ? "#1976d2" : "#90caf9" },
    secondary: { main: mode === "light" ? "#dc004e" : "#f48fb1" },
    background: {
      default: mode === "light" ? "#f8fafc" : "#0f172a",
      paper: mode === "light" ? "#ffffff" : "#1e293b",
    },
    text: {
      primary: mode === "light" ? "#1a202c" : "#f7fafc",
      secondary: mode === "light" ? "#4a5568" : "#cbd5e0",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 3.5rem)" },
    h2: { fontWeight: 700, fontSize: "clamp(2rem, 4vw, 2.5rem)" },
    h3: { fontWeight: 600, fontSize: "clamp(1.5rem, 3vw, 2rem)" },
    body1: { lineHeight: 1.7 },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
});

// src/components/legal/TermsOfService.tsx
export const TermsOfService: React.FC<LegalPageProps> = ({
  onNavigate,
  onGoBack,
  canGoBack,
  currentRoute,
}) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          mode={mode}
          onToggleMode={() => setMode(mode === "light" ? "dark" : "light")}
          onNavigate={onNavigate}
          onGoBack={onGoBack}
          canGoBack={canGoBack}
          currentRoute={currentRoute}
          showBackButton
        />

        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, flex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              mb: 3,
              textAlign: "center",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Terms of Service
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 6 }}
          >
            Last updated: January 2025
          </Typography>

          <Card sx={{ p: { xs: 4, sm: 6 } }}>
            <CardContent>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    Agreement to Terms
                  </Typography>
                  <Typography variant="body1">
                    By accessing and using Neatly, you accept and agree to be
                    bound by the terms and provision of this agreement. These
                    Terms of Service govern your use of our file organization
                    software and services.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Use License
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Permission is granted to temporarily use Neatly for personal
                    and commercial file organization. This is the grant of a
                    license, not a transfer of title, and under this license you
                    may:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <Typography component="li" variant="body1" paragraph>
                      Use Neatly on your personal devices
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      Organize files for personal or business use
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      Share organized file structures with others
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    This license shall automatically terminate if you violate
                    any of these restrictions and may be terminated by us at any
                    time.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Privacy and Data
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Neatly processes your files locally on your device. We do
                    not upload, store, or have access to your actual file
                    contents. Only anonymized metadata is sent to our AI service
                    for organization suggestions.
                  </Typography>
                  <Typography variant="body1">
                    We collect minimal data necessary to provide our service and
                    never sell your information to third parties. See our
                    Privacy Policy for complete details.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    User Responsibilities
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <Typography component="li" variant="body1" paragraph>
                      You are responsible for backing up your files before using
                      Neatly
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      You agree not to use the service for illegal activities
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      You will not attempt to reverse engineer or modify the
                      software
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      You will not share your account credentials with others
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Service Availability
                  </Typography>
                  <Typography variant="body1">
                    We strive to maintain high availability but cannot guarantee
                    uninterrupted service. We may temporarily suspend service
                    for maintenance, updates, or other operational reasons.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Limitation of Liability
                  </Typography>
                  <Typography variant="body1">
                    Neatly is provided "as is" without warranty. We are not
                    liable for any data loss, though we provide backup features
                    to minimize risk. Always maintain your own backups of
                    important files.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body1">
                    If you have any questions about these Terms of Service,
                    please contact us at legal@neatly.app or through our support
                    channels.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>

        <Footer onNavigate={onNavigate} currentRoute={currentRoute} />
      </Box>
    </ThemeProvider>
  );
};
