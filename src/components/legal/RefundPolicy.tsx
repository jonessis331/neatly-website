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

export const RefundPolicy: React.FC<LegalPageProps> = ({
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
            Refund Policy
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
                    14-Day Money-Back Guarantee
                  </Typography>
                  <Typography variant="body1">
                    We offer a full refund within 14 days of your initial
                    purchase, no questions asked. We're confident in Neatly's
                    value, but if it doesn't meet your expectations, we'll
                    refund your money completely.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    How to Request a Refund
                  </Typography>
                  <Typography variant="body1" paragraph>
                    To request a refund, simply contact our support team at
                    support@neatly.app with your order details. Refunds are
                    typically processed within 3-5 business days.
                  </Typography>
                  <Typography variant="body1">
                    You can continue using Neatly until your refund is
                    processed, and you'll keep any files that have already been
                    organized.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    What's Covered
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <Typography component="li" variant="body1" paragraph>
                      All subscription plans (Pro, Premium, Enterprise)
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      One-time credit purchases
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      Annual plan purchases (full refund within 14 days)
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Partial Refunds
                  </Typography>
                  <Typography variant="body1" paragraph>
                    For annual subscriptions, if you cancel after the 14-day
                    period but before 6 months, we may offer a partial refund on
                    a case-by-case basis.
                  </Typography>
                  <Typography variant="body1">
                    Monthly subscriptions can be canceled at any time, and
                    you'll have access until the end of your current billing
                    period.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Contact Us
                  </Typography>
                  <Typography variant="body1">
                    Questions about refunds? Contact us at support@neatly.app or
                    through our contact form. We're here to help and will work
                    with you to ensure you're satisfied.
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
