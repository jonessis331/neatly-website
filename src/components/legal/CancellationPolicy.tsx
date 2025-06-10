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

// src/components/legal/CancellationPolicy.tsx
export const CancellationPolicy: React.FC<LegalPageProps> = ({
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
            Cancellation Policy
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
                    Cancel Anytime
                  </Typography>
                  <Typography variant="body1">
                    You can cancel your Neatly subscription at any time, with no
                    cancellation fees or penalties. We believe in making it as
                    easy to leave as it was to join.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    How to Cancel
                  </Typography>
                  <Typography variant="body1" paragraph>
                    You can cancel your subscription through:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <Typography component="li" variant="body1" paragraph>
                      Your account dashboard - click "Manage Subscription"
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      Email us at support@neatly.app
                    </Typography>
                    <Typography component="li" variant="body1" paragraph>
                      Contact our support team via live chat
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    What Happens After Cancellation
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Immediate:</strong> Your subscription will not
                    auto-renew for the next billing cycle.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Until End of Billing Period:</strong> You'll
                    continue to have full access to all premium features until
                    your current billing period ends.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>After Billing Period:</strong> Your account reverts
                    to the free plan with basic features. All your organized
                    files remain unchanged.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Your Data
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Since Neatly works locally on your device, canceling your
                    subscription doesn't affect your organized files. They
                    remain on your computer exactly as organized.
                  </Typography>
                  <Typography variant="body1">
                    Your account data is retained for 90 days after cancellation
                    in case you want to reactivate. After 90 days, account data
                    is permanently deleted.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Reactivating Your Subscription
                  </Typography>
                  <Typography variant="body1">
                    You can reactivate your subscription at any time by visiting
                    your account dashboard or contacting support. Your previous
                    settings and preferences will be restored if within the
                    90-day retention period.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Annual Subscriptions
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Annual subscriptions can be canceled, but refunds are only
                    available within the first 14 days (see our Refund Policy).
                    After 14 days, you'll have access until the end of your
                    annual term.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Need Help?
                  </Typography>
                  <Typography variant="body1">
                    If you're considering cancellation due to an issue, please
                    contact our support team first. We're here to help and may
                    be able to resolve your concerns without canceling your
                    subscription.
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
