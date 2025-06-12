// src/components/LandingPage.tsx - Refined with clean animations and fixed width
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  Typography,
  createTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  alpha,
  Fade,
  Grow,
  Zoom,
  Slide,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
  Avatar,
  keyframes,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";
import {
  AutoAwesome,
  CheckCircle,
  ExpandMore,
  ArrowForward,
  PlayArrow,
  FolderOpen,
  Scanner,
  AutoFixHigh,
  Backup,
  PrivacyTip,
  Speed,
  Code,
  School,
  Computer,
  CloudDone,
  Security,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { AuthDialog } from "./Auth";
import {
  createCheckoutSession,
  createTrialSession,
  pricingTiers,
} from "../services/stripe";
import { Navbar } from "./common/Navbar";
import { Footer } from "./common/Footer";

type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface LandingPageProps {
  onNavigate: (route: Route) => void;
  onNavigateToDashboard: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentRoute: Route;
}

// Clean Apple-style animations
const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const fadeInUp = keyframes`
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
`;

const scaleIn = keyframes`
  from { 
    transform: scale(0.95); 
    opacity: 0; 
  }
  to { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

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
    h1: {
      fontWeight: 800,
      fontSize: "clamp(2.5rem, 5vw, 4rem)",
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "clamp(2rem, 4vw, 3rem)",
      letterSpacing: "-0.025em",
    },
    h3: { fontWeight: 600, fontSize: "clamp(1.5rem, 3vw, 2.25rem)" },
    h4: { fontWeight: 600, fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)" },
    h5: { fontWeight: 600, fontSize: "clamp(1rem, 2vw, 1.25rem)" },
    body1: { fontSize: "clamp(1rem, 1.5vw, 1.125rem)", lineHeight: 1.7 },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "14px 28px",
          fontSize: "1.1rem",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
  },
});

const features = [
  {
    icon: <Scanner />,
    title: "Smart Local Scanning",
    description:
      "AI analyzes your folder structure completely offline - your files never leave your computer",
    highlight: "100% Local",
  },
  {
    icon: <AutoFixHigh />,
    title: "KonMari-Style Organization",
    description:
      "Uses proven organization principles to create folder structures that actually make sense",
    highlight: "Thoughtful AI",
  },
  {
    icon: <Backup />,
    title: "Full Backup & Revert",
    description:
      "Complete backup before any changes with one-click rollback - because accidents happen",
    highlight: "Risk-Free",
  },
  {
    icon: <PrivacyTip />,
    title: "Privacy-First Design",
    description:
      "Only metadata goes to AI - no file contents, no personal info, no tracking",
    highlight: "Zero Data Collection",
  },
  {
    icon: <Speed />,
    title: "Handles Large Folders",
    description:
      "Efficiently processes thousands of files with smart batching and progress tracking",
    highlight: "Enterprise Ready",
  },
  {
    icon: <Code />,
    title: "Developer Friendly",
    description:
      "Preserves project folders, respects .gitignore, skips node_modules automatically",
    highlight: "Built by Devs",
  },
];

const steps = [
  {
    step: "01",
    title: "Select & Scan",
    description:
      "Choose any folder on your computer. Neatly scans files locally and shows you what it found.",
    image: "/assets/step1-scan.png",
    features: [
      "Respects system folders",
      "Shows file type breakdown",
      "Estimates organization time",
    ],
  },
  {
    step: "02",
    title: "Review the Plan",
    description:
      "AI generates a smart organization plan. You see exactly what will move where before anything happens.",
    image: "/assets/step2-plan.png",
    features: [
      "Preview new structure",
      "Understand AI reasoning",
      "Modify suggestions",
    ],
  },
  {
    step: "03",
    title: "Execute Safely",
    description:
      "One click to organize. Full backup created automatically. Revert anytime with zero data loss.",
    image: "/assets/step3-execute.png",
    features: ["Atomic operations", "Progress tracking", "Instant rollback"],
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    content:
      "Finally cleaned up 4 years of project files. The AI actually understood my folder structure!",
    avatar: "/assets/avatar-sarah.jpg",
  },
  {
    name: "Marcus Rodriguez",
    role: "Data Scientist",
    content:
      "Organized 50GB of research data in 5 minutes. The privacy guarantees sold me immediately.",
    avatar: "/assets/avatar-marcus.jpg",
  },
  {
    name: "Alex Kim",
    role: "Product Manager",
    content:
      "This is what I've been building myself for years. Clean, simple, actually works.",
    avatar: "/assets/avatar-alex.jpg",
  },
];

const faqs = [
  {
    question: "Is my data actually safe?",
    answer:
      "100%. Your files never leave your computer. Only anonymized metadata (like 'document, 2MB, created last week') goes to AI. No file contents, no personal info, nothing identifiable.",
  },
  {
    question: "What if the AI messes up my important files?",
    answer:
      "Impossible. Every operation creates a full backup first. You can revert everything with one click, guaranteed. We've never had a single case of data loss.",
  },
  {
    question: "Does it work with code projects?",
    answer:
      "Absolutely. Neatly detects and preserves Git repos, respects .gitignore files, skips node_modules, and understands project structures. Built by developers, for developers.",
  },
  {
    question: "How is this different from manual organization?",
    answer:
      "Manual organization takes hours and you often miss patterns. Neatly sees the big picture instantly, suggests logical groupings you'd never think of, and executes perfectly in seconds.",
  },
  {
    question: "What about huge folders with thousands of files?",
    answer:
      "That's exactly what Neatly was built for. We handle enterprise-scale folders efficiently with smart batching, progress tracking, and memory optimization.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onNavigateToDashboard,
  onGoBack,
  canGoBack,
  currentRoute,
}) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDark ? "dark" : "light"
  );
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"login" | "signup">(
    "login"
  );
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    setMode(prefersDark ? "dark" : "light");
  }, [prefersDark]);

  const handleLogin = () => {
    setAuthDialogTab("login");
    setAuthDialogOpen(true);
  };

  const handleSignup = () => {
    setAuthDialogTab("signup");
    setAuthDialogOpen(true);
  };

  const handleGetStarted = () => {
    if (!user) {
      handleSignup();
    } else {
      handleSubscribe("free-trial", "free-trial");
    }
  };

  const handleSubscribe = async (priceId: string, tierId?: string) => {
    if (!user) {
      setAlertMessage("Create an account first - it's free!");
      setAlertSeverity("error");
      handleSignup();
      return;
    }

    const tierIdToUse = tierId || priceId;
    setPaymentLoading(tierIdToUse);
    try {
      const tier = pricingTiers.find((t) => t.id === tierIdToUse);
      if (tier?.isTrial) {
        await createTrialSession(user.id);
      } else {
        await createCheckoutSession(priceId, user.id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setAlertMessage("Payment failed. Please try again.");
      setAlertSeverity("error");
    } finally {
      setPaymentLoading(null);
    }
  };

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
        {alertMessage && (
          <Slide direction="down" in={!!alertMessage}>
            <Alert
              severity={alertSeverity}
              sx={{
                position: "fixed",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                borderRadius: 3,
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.12
                )}`,
              }}
              onClose={() => setAlertMessage("")}
            >
              {alertMessage}
            </Alert>
          </Slide>
        )}

        {/* Navigation */}
        <Navbar
          mode={mode}
          onToggleMode={() => setMode(mode === "light" ? "dark" : "light")}
          onNavigate={onNavigate}
          onGoBack={onGoBack}
          canGoBack={canGoBack}
          currentRoute={currentRoute}
          onOpenAuth={(type) => {
            setAuthDialogTab(type);
            setAuthDialogOpen(true);
          }}
        />

        {/* Hero Section */}
        <Box
          id="home"
          sx={{
            pt: { xs: 6, md: 12 },
            pb: { xs: 8, md: 16 },
            position: "relative",
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          {/* Subtle gradient background */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at top, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, transparent 60%)`,
              zIndex: -1,
            }}
          />

          <Box
            sx={{
              px: { xs: 3, md: 6, lg: 8 },
              maxWidth: "100%",
            }}
          >
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} lg={6}>
                <Box
                  sx={{
                    animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                  }}
                >
                  {/* Badge */}
                  <Chip
                    icon={<School />}
                    label="Built by developers, for everyone"
                    variant="outlined"
                    sx={{
                      mb: 4,
                      borderColor: "primary.main",
                      color: "primary.main",
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      animation: `${scaleIn} 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s both`,
                    }}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.1,
                      mb: 4,
                      animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                    }}
                  >
                    Stop drowning in
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      digital chaos
                    </Box>
                  </Typography>

                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                      mb: 6,
                      maxWidth: 600,
                      lineHeight: 1.6,
                      fontWeight: 400,
                      animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s both`,
                    }}
                  >
                    The first AI-powered file organizer that's actually private.
                    Clean up years of digital mess in minutes, not hours.
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    sx={{
                      mb: 6,
                      animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both`,
                    }}
                  >
                    {user ? (
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={onNavigateToDashboard}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          px: { xs: 4, sm: 6 },
                          py: 2,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          borderRadius: 4,
                          transition:
                            "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: `0 12px 30px ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                          },
                        }}
                      >
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={() =>
                          handleSubscribe("free-trial", "free-trial")
                        }
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          px: { xs: 4, sm: 6 },
                          py: 2,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          borderRadius: 4,
                          transition:
                            "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: `0 12px 30px ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                          },
                        }}
                      >
                        Try Free Trial (14 Days)
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => {
                        const element = document.getElementById("how");
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      sx={{
                        borderWidth: 2,
                        px: { xs: 4, sm: 6 },
                        py: 2,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        "&:hover": {
                          borderWidth: 2,
                          transform: "translateY(-2px)",
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      See How It Works
                    </Button>
                  </Stack>

                  {/* Trust Indicators */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                      animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.4s both`,
                    }}
                  >
                    {[
                      { icon: <PrivacyTip />, label: "100% Local Processing" },
                      { icon: <Backup />, label: "Full Backup Guaranteed" },
                      { icon: <CheckCircle />, label: "Zero Data Collection" },
                    ].map((item, index) => (
                      <Chip
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.2
                          )}`,
                          transition:
                            "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          animation: `${scaleIn} 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                            0.5 + index * 0.1
                          }s both`,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            borderColor: "primary.main",
                            color: "primary.main",
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} lg={6} sx={{ ml: "auto" }}>
                <Box
                  sx={{
                    position: "relative",

                    animation: `${scaleIn} 1s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both`,
                  }}
                >
                  {/* Main Demo Card */}
                  <Card
                    sx={{
                      p: { xs: 3, sm: 4 },
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      boxShadow: `0 20px 60px ${alpha(
                        theme.palette.common.black,
                        mode === "dark" ? 0.3 : 0.1
                      )}`,
                      animation: `${gentleFloat} 8s ease-in-out infinite`,
                      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 25px 70px ${alpha(
                          theme.palette.common.black,
                          mode === "dark" ? 0.4 : 0.15
                        )}`,
                      },
                    }}
                  >
                    <Stack spacing={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Scanner />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Scanning: ~/Documents/Projects
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Found 2,847 files across 127 folders
                          </Typography>
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          },
                        }}
                      />

                      <Grid container spacing={3}>
                        {[
                          { count: 847, label: "PDFs", color: "primary.main" },
                          {
                            count: 423,
                            label: "Images",
                            color: "secondary.main",
                          },
                          {
                            count: 1577,
                            label: "Others",
                            color: "success.main",
                          },
                        ].map((item, index) => (
                          <Grid item xs={4} key={index}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                color={item.color}
                              >
                                {item.count}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      <Box
                        sx={{
                          p: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          borderRadius: 3,
                          border: `1px solid ${alpha(
                            theme.palette.success.main,
                            0.2
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="success.main"
                        >
                          ✨ AI Plan Ready: Organizing into 12 logical folders
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* How It Works */}
        <Box
          id="how"
          sx={{
            py: { xs: 8, md: 16 },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(20px)",
            maxWidth: "100%",
          }}
        >
          <Box sx={{ px: { xs: 3, md: 6, lg: 8 }, maxWidth: "100%" }}>
            <Box sx={{ textAlign: "center", mb: 12 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                }}
              >
                How It Actually Works
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.6,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                }}
              >
                Three simple steps. No cloud uploads, no data mining, no BS.
                Just smart organization that respects your privacy.
              </Typography>
            </Box>

            <Stack spacing={12}>
              {steps.map((step, index) => (
                <Grid
                  container
                  spacing={8}
                  alignItems="center"
                  key={index}
                  sx={{
                    animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                      0.2 + index * 0.1
                    }s both`,
                  }}
                >
                  <Grid
                    item
                    xs={12}
                    md={6}
                    order={{ xs: 2, md: index % 2 === 0 ? 1 : 2 }}
                  >
                    <Box>
                      <Chip
                        label={`Step ${step.step}`}
                        variant="outlined"
                        sx={{
                          mb: 3,
                          borderColor: "primary.main",
                          color: "primary.main",
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        }}
                      />
                      <Typography variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
                        {step.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 6, lineHeight: 1.7 }}
                      >
                        {step.description}
                      </Typography>
                      <Stack spacing={3}>
                        {step.features.map((feature, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              animation: `${fadeInUp} 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                                0.3 + i * 0.1
                              }s both`,
                            }}
                          >
                            <CheckCircle fontSize="small" color="success" />
                            <Typography variant="body1">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    order={{ xs: 1, md: index % 2 === 0 ? 2 : 1 }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: `0 20px 60px ${alpha(
                          theme.palette.common.black,
                          mode === "dark" ? 0.3 : 0.1
                        )}`,
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: `0 25px 70px ${alpha(
                            theme.palette.common.black,
                            mode === "dark" ? 0.4 : 0.15
                          )}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: 300, sm: 400 },
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `2px dashed ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        }}
                      >
                        <Stack spacing={2} alignItems="center">
                          <Computer
                            sx={{
                              fontSize: { xs: 60, sm: 80 },
                              color: "primary.main",
                              opacity: 0.7,
                            }}
                          />
                          <Typography variant="h6" color="text.secondary">
                            App Screenshot: {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.image}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Social Proof */}
        <Box sx={{ py: { xs: 8, md: 12 }, maxWidth: "100%" }}>
          <Box sx={{ px: { xs: 3, md: 6, lg: 8 }, maxWidth: "100%" }}>
            <Box sx={{ textAlign: "center", mb: 12 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                }}
              >
                People Love It
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                }}
              >
                Real feedback from real users (not fake reviews)
              </Typography>
            </Box>

            <Grid container spacing={6} justifyContent="center">
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      p: 5,
                      height: "100%",
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 4,
                      transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      animation: `${scaleIn} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                        0.2 + index * 0.1
                      }s both`,
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 40px ${alpha(
                          theme.palette.primary.main,
                          0.15
                        )}`,
                      },
                    }}
                  >
                    <Stack spacing={4}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: "italic",
                          lineHeight: 1.7,
                          fontSize: "1.1rem",
                        }}
                      >
                        "{testimonial.content}"
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          src={testimonial.avatar}
                          sx={{ width: 48, height: 48 }}
                        >
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Features Grid */}
        <Box
          id="features"
          sx={{
            py: { xs: 8, md: 16 },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(20px)",
            maxWidth: "100%",
          }}
        >
          <Box sx={{ px: { xs: 3, md: 6, lg: 8 }, maxWidth: "100%" }}>
            <Box sx={{ textAlign: "center", mb: 12 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                }}
              >
                Why Choose Neatly
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.6,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                }}
              >
                Built with privacy, security, and actual usefulness in mind
              </Typography>
            </Box>

            <Grid container spacing={6} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      p: 5,
                      height: "100%",
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 4,
                      transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      animation: `${scaleIn} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                        0.1 + index * 0.05
                      }s both`,
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha(
                          theme.palette.primary.main,
                          0
                        )}, ${alpha(theme.palette.primary.main, 0.08)})`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 60px ${alpha(
                          theme.palette.primary.main,
                          0.15
                        )}`,
                        "&::before": {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Stack
                      spacing={4}
                      sx={{ height: "100%", position: "relative", zIndex: 1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${alpha(
                              theme.palette.primary.main,
                              0.1
                            )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                            color: "primary.main",
                            animation: `${gentleFloat} ${
                              4 + index * 0.5
                            }s ease-in-out infinite`,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Chip
                          label={feature.highlight}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          }}
                        />
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ lineHeight: 1.7 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Privacy Guarantee Section */}
            <Box sx={{ mt: 16, textAlign: "center" }}>
              <Paper
                sx={{
                  p: { xs: 5, sm: 8 },
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.success.main,
                    0.05
                  )}, ${alpha(theme.palette.primary.main, 0.05)})`,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 6,
                  position: "relative",
                  overflow: "hidden",
                  animation: `${scaleIn} 1s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both`,
                }}
              >
                <Security
                  sx={{
                    fontSize: 64,
                    color: "success.main",
                    mb: 4,
                    animation: `${gentleFloat} 6s ease-in-out infinite`,
                  }}
                />
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Privacy Promise
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 6, maxWidth: 600, mx: "auto", lineHeight: 1.7 }}
                >
                  Your files never leave your computer. Ever. We only send
                  anonymized metadata to AI - no file contents, no personal
                  info, no tracking. Open source soon.
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={4}
                  justifyContent="center"
                  sx={{
                    animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.5s both`,
                  }}
                >
                  {[
                    "100% Local Processing",
                    "Zero Data Collection",
                    "Full Source Access",
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        animation: `${scaleIn} 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                          0.6 + index * 0.1
                        }s both`,
                      }}
                    >
                      <CheckCircle color="success" />
                      <Typography fontWeight={600}>{item}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Pricing */}
        <Box id="pricing" sx={{ py: { xs: 8, md: 16 }, maxWidth: "100%" }}>
          <Box sx={{ px: { xs: 3, md: 6, lg: 8 }, maxWidth: "100%" }}>
            <Box sx={{ textAlign: "center", mb: 12 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                }}
              >
                Honest Pricing
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.6,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                }}
              >
                No hidden fees, no data harvesting revenue model. Just fair
                pricing for a tool that actually works.
              </Typography>
            </Box>

            <Grid container spacing={6} justifyContent="center">
              {pricingTiers.map((tier, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      p: 5,
                      height: "100%",
                      position: "relative",
                      border: tier.popular ? 3 : 1,
                      borderColor: tier.popular ? "primary.main" : "divider",
                      transform: tier.popular ? "scale(1.05)" : "scale(1)",
                      background: tier.popular
                        ? `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            0.05
                          )}, ${alpha(theme.palette.secondary.main, 0.05)})`
                        : alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(20px)",
                      borderRadius: 4,
                      transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      animation: `${scaleIn} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                        0.2 + index * 0.1
                      }s both`,
                      "&:hover": {
                        transform: tier.popular ? "scale(1.08)" : "scale(1.03)",
                        boxShadow: `0 20px 60px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      },
                    }}
                  >
                    {tier.popular && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontWeight: 700,
                          px: 2,
                          animation: `${gentleFloat} 3s ease-in-out infinite`,
                        }}
                      />
                    )}

                    <Stack spacing={4} sx={{ height: "100%" }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                          {tier.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h2" fontWeight={800}>
                            {tier.price}
                          </Typography>
                          <Typography variant="h5" color="text.secondary">
                            {tier.period}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          color="primary.main"
                          fontWeight={600}
                        >
                          {tier.credits}
                        </Typography>
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Stack spacing={3}>
                          {tier.features.map((feature, i) => (
                            <Box
                              key={i}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                animation: `${fadeInUp} 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                                  0.4 + i * 0.05
                                }s both`,
                              }}
                            >
                              <CheckCircle fontSize="small" color="success" />
                              <Typography variant="body1">{feature}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      <Button
                        fullWidth
                        variant={tier.popular ? "contained" : "outlined"}
                        size="large"
                        onClick={() => handleSubscribe(tier.id, tier.id)}
                        disabled={paymentLoading === tier.id}
                        sx={{
                          py: 2,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          borderRadius: 3,
                          transition:
                            "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          ...(tier.popular && {
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }),
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        {paymentLoading === tier.id ? (
                          <CircularProgress size={24} />
                        ) : tier.isTrial ? (
                          "Start Free Trial"
                        ) : (
                          `Get ${tier.title}`
                        )}
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{
                mt: 8,
                animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.5s both`,
              }}
            >
              All plans include 14-day money-back guarantee. Cancel anytime,
              keep your organized files forever.
            </Typography>
          </Box>
        </Box>

        {/* FAQ */}
        <Box
          id="faq"
          sx={{
            py: { xs: 8, md: 16 },
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(20px)",
            maxWidth: "100%",
          }}
        >
          <Box
            sx={{ px: { xs: 3, md: 6, lg: 8 }, maxWidth: "1200px", mx: "auto" }}
          >
            <Box sx={{ textAlign: "center", mb: 12 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
                }}
              >
                Questions? Answers.
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
                }}
              >
                The honest answers to questions everyone asks
              </Typography>
            </Box>

            <Stack spacing={3}>
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  sx={{
                    "&:before": { display: "none" },
                    boxShadow: "none",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(20px)",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    animation: `${scaleIn} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${
                      0.1 + index * 0.05
                    }s both`,
                    "&.Mui-expanded": {
                      boxShadow: `0 8px 32px ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      py: 2,
                      "& .MuiAccordionSummary-content": {
                        my: 1,
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: "50px 50px",
              animation: `${gentleFloat} 15s ease-in-out infinite`,
            }}
          />

          <Box
            sx={{
              px: { xs: 3, md: 6, lg: 8 },
              maxWidth: "1000px",
              mx: "auto",
              position: "relative",
            }}
          >
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 4,
                animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)`,
              }}
            >
              Ready to Clean Up Your Life?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                opacity: 0.95,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                animation: `${fadeInUp} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both`,
              }}
            >
              Join thousands who've finally gotten their digital life together.
              Start with a 14-day free trial - just add your payment info, no
              charge until trial ends.
            </Typography>

            <Box
              sx={{
                animation: `${scaleIn} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both`,
              }}
            >
              {user ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={onNavigateToDashboard}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: { xs: 4, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    fontWeight: 700,
                    borderRadius: 4,
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleSubscribe("free-trial", "free-trial")}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: { xs: 4, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    fontWeight: 700,
                    borderRadius: 4,
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Start Free Trial (14 Days)
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Footer onNavigate={onNavigate} currentRoute={currentRoute} />

        {/* Auth Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          initialTab={authDialogTab}
        />
      </Box>
    </ThemeProvider>
  );
};
