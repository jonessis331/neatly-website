// src/components/pages/ContactSupport.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Alert,
  Fade,
  useTheme,
  alpha,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { Email, Phone, Chat, Send, CheckCircle } from "@mui/icons-material";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";

type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface ContactSupportProps {
  onNavigate: (route: Route) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentRoute: Route;
}

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#1976d2" : "#90caf9",
    },
    secondary: {
      main: mode === "light" ? "#dc004e" : "#f48fb1",
    },
    success: {
      main: "#2e7d32",
    },
    background: {
      default: mode === "light" ? "#f8fafc" : "#0f172a",
      paper: mode === "light" ? "#ffffff" : "#1e293b",
    },
    text: {
      primary: mode === "light" ? "#1a202c" : "#f7fafc",
      secondary: mode === "light" ? "#4a5568" : "#cbd5e0",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 3.5rem)" },
    h2: { fontWeight: 700, fontSize: "clamp(2rem, 4vw, 2.5rem)" },
    h3: { fontWeight: 600, fontSize: "clamp(1.5rem, 3vw, 2rem)" },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
});

export const ContactSupport: React.FC<ContactSupportProps> = ({
  onNavigate,
  onGoBack,
  canGoBack,
  currentRoute,
}) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const handleInputChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitStatus("loading");

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    }
  };

  const contactMethods = [
    {
      icon: <Email />,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@neatly.app",
      action: "mailto:support@neatly.app",
    },
    {
      icon: <Chat />,
      title: "Live Chat",
      description: "Chat with our team during business hours",
      contact: "Available 9AM - 6PM EST",
      action: "#",
    },
    {
      icon: <Phone />,
      title: "Phone Support",
      description: "For urgent issues and enterprise customers",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
  ];

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

        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 }, flex: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Contact Support
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.6 }}
            >
              Need help? We're here for you. Get in touch and we'll respond as
              quickly as possible.
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {/* Contact Methods */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={4}>
                {contactMethods.map((method, index) => (
                  <Fade in timeout={600 + index * 200} key={index}>
                    <Card
                      component="a"
                      href={method.action}
                      sx={{
                        p: 4,
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 12px 40px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                          {method.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="primary.main"
                        >
                          {method.contact}
                        </Typography>
                      </Stack>
                    </Card>
                  </Fade>
                ))}
              </Stack>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} lg={8}>
              <Fade in timeout={800}>
                <Card sx={{ p: { xs: 4, sm: 6 } }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      Send us a message
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </Typography>

                    {submitStatus === "success" && (
                      <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{ mb: 4 }}
                      >
                        Thank you for your message! We'll get back to you within
                        24 hours.
                      </Alert>
                    )}

                    {submitStatus === "error" && (
                      <Alert severity="error" sx={{ mb: 4 }}>
                        Something went wrong. Please try again or contact us
                        directly at support@neatly.app
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            required
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            required
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Subject"
                            value={formData.subject}
                            onChange={handleInputChange("subject")}
                            required
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Message"
                            multiline
                            rows={6}
                            value={formData.message}
                            onChange={handleInputChange("message")}
                            required
                            sx={{ mb: 3 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            endIcon={<Send />}
                            disabled={submitStatus === "loading"}
                            sx={{
                              px: 4,
                              py: 1.5,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                          >
                            {submitStatus === "loading"
                              ? "Sending..."
                              : "Send Message"}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          {/* FAQ Section */}
          <Box sx={{ mt: 12, textAlign: "center" }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
              Looking for quick answers? Check out our most common questions.
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  question: "How quickly do you respond to support requests?",
                  answer:
                    "We typically respond to all support requests within 24 hours during business days. For urgent issues, please use our live chat or phone support.",
                },
                {
                  question: "Do you offer phone support?",
                  answer:
                    "Yes! Phone support is available for urgent issues and all paid plan customers. Free users can access email and live chat support.",
                },
                {
                  question: "Can you help with technical issues?",
                  answer:
                    "Absolutely! Our support team can help with installation, troubleshooting, and any technical questions about using Neatly.",
                },
                {
                  question: "Is there a knowledge base or documentation?",
                  answer:
                    "Yes, we have comprehensive documentation and video tutorials available. Most common questions can be answered in our help center.",
                },
              ].map((faq, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Fade in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        p: 4,
                        height: "100%",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 12px 40px ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                        },
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {faq.question}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {faq.answer}
                      </Typography>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

        <Footer onNavigate={onNavigate} currentRoute={currentRoute} />
      </Box>
    </ThemeProvider>
  );
};
