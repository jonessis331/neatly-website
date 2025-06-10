// src/components/LandingPage.tsx - Complete version with animations
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Chip,
  LinearProgress,
  alpha,
  Fade,
  Grow,
  useScrollTrigger,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Slide,
  Zoom,
  keyframes,
} from "@mui/material";
import {
  AutoAwesome,
  LightMode,
  DarkMode,
  CloudDone,
  CheckCircle,
  ExpandMore,
  ArrowForward,
  GitHub,
  Twitter,
  LinkedIn,
  Menu as MenuIcon,
  Close,
  FolderOpen,
  Scanner,
  AutoFixHigh,
  Backup,
  Analytics,
  Support,
  Security,
  Computer,
  PrivacyTip,
  Speed,
  Undo,
  Folder,
  PlayArrow,
  Code,
  School,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { AuthDialog } from "./Auth";
import { createCheckoutSession, pricingTiers } from "../services/stripe";

type AppView = "landing" | "dashboard";

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToLanding?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentView?: AppView;
}

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
    role: "CS Senior @ Columbia",
    content:
      "Finally cleaned up 4 years of coursework. The AI actually understood my project structure!",
    avatar: "/assets/avatar-sarah.jpg",
  },
  {
    name: "Marcus Rodriguez",
    role: "Data Science @ NYU",
    content:
      "Organized 50GB of research data in 5 minutes. The privacy guarantees sold me immediately.",
    avatar: "/assets/avatar-marcus.jpg",
  },
  {
    name: "Alex Kim",
    role: "Software Engineer @ Google",
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
  onNavigateToDashboard,
}) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDark ? "dark" : "light"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
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

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "how", "features", "pricing", "faq"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setAuthDialogTab("login");
    setAuthDialogOpen(true);
  };

  const handleSignup = () => {
    setAuthDialogTab("signup");
    setAuthDialogOpen(true);
  };

  const handleSubscribe = async (priceId: string, tierId: string) => {
    if (!user) {
      setAlertMessage("Create an account first - it's free!");
      setAlertSeverity("error");
      handleSignup();
      return;
    }

    setPaymentLoading(tierId);
    try {
      await createCheckoutSession(priceId, user.id);
    } catch (error) {
      console.error("Payment error:", error);
      setAlertMessage("Payment failed. Please try again.");
      setAlertSeverity("error");
    } finally {
      setPaymentLoading(null);
    }
  };

  const navItems = [
    { label: "How It Works", section: "how" },
    { label: "Features", section: "features" },
    { label: "Pricing", section: "pricing" },
    { label: "FAQ", section: "faq" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
                boxShadow: 4,
              }}
              onClose={() => setAlertMessage("")}
            >
              {alertMessage}
            </Alert>
          </Slide>
        )}

        {/* Navigation */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: trigger
              ? alpha(theme.palette.background.paper, 0.95)
              : "transparent",
            backdropFilter: "blur(20px)",
            borderBottom: trigger
              ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
              : "none",
            transition: "all 0.3s ease",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ py: 1, px: { xs: 2, md: 0 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
                onClick={() => scrollToSection("home")}
              >
                <FolderOpen
                  sx={{ fontSize: 32, mr: 1, color: "primary.main" }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Neatly
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {!isMobile ? (
                <>
                  {navItems.map((item) => (
                    <Button
                      key={item.section}
                      onClick={() => scrollToSection(item.section)}
                      sx={{
                        mx: 1,
                        color:
                          activeSection === item.section
                            ? "primary.main"
                            : "text.primary",
                        fontWeight: activeSection === item.section ? 600 : 400,
                        fontSize: "1rem",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          width: activeSection === item.section ? "100%" : "0%",
                          height: 2,
                          bgcolor: "primary.main",
                          transition: "all 0.3s ease",
                          transform: "translateX(-50%)",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}

                  {loading ? (
                    <CircularProgress size={24} sx={{ mx: 2 }} />
                  ) : user ? (
                    <Button
                      variant="contained"
                      onClick={onNavigateToDashboard}
                      sx={{
                        ml: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        animation: `${slideInFromBottom} 0.6s ease-out`,
                      }}
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="text"
                        sx={{ mx: 1 }}
                        onClick={handleLogin}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSignup}
                        sx={{
                          ml: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          animation: `${slideInFromBottom} 0.6s ease-out`,
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}

                  <IconButton
                    onClick={() => setMode(mode === "light" ? "dark" : "light")}
                    sx={{ ml: 2 }}
                  >
                    {mode === "light" ? <DarkMode /> : <LightMode />}
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <Close /> : <MenuIcon />}
                </IconButton>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile Menu */}
        <Slide direction="down" in={mobileMenuOpen && isMobile}>
          <Box
            sx={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              bgcolor: "background.paper",
              zIndex: 1200,
              p: 3,
              boxShadow: 4,
              borderRadius: "0 0 16px 16px",
            }}
          >
            <Stack spacing={2}>
              {navItems.map((item) => (
                <Button
                  key={item.section}
                  fullWidth
                  onClick={() => scrollToSection(item.section)}
                  variant={
                    activeSection === item.section ? "contained" : "text"
                  }
                >
                  {item.label}
                </Button>
              ))}
              <Divider />

              {loading ? (
                <CircularProgress sx={{ alignSelf: "center" }} />
              ) : user ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onNavigateToDashboard}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button fullWidth variant="outlined" onClick={handleLogin}>
                    Sign In
                  </Button>
                  <Button fullWidth variant="contained" onClick={handleSignup}>
                    Get Started
                  </Button>
                </>
              )}

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <IconButton
                  onClick={() => setMode(mode === "light" ? "dark" : "light")}
                >
                  {mode === "light" ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Box>
            </Stack>
          </Box>
        </Slide>

        {/* Hero Section */}
        <Box
          id="home"
          sx={{
            pt: { xs: 6, md: 12 },
            pb: { xs: 8, md: 16 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Background */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at top, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, transparent 70%)`,
              zIndex: -1,
            }}
          />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: { xs: 40, md: 80 },
                height: { xs: 40, md: 80 },
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
                animation: `${float} ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} lg={6}>
                <Fade in timeout={800}>
                  <Box>
                    {/* Badge */}
                    <Zoom in timeout={1000}>
                      <Chip
                        icon={<School />}
                        label="Built by Penn State CS students"
                        variant="outlined"
                        sx={{
                          mb: 3,
                          borderColor: "primary.main",
                          color: "primary.main",
                          fontWeight: 600,
                          animation: `${slideInFromBottom} 0.8s ease-out`,
                        }}
                      />
                    </Zoom>

                    <Typography
                      variant="h1"
                      sx={{
                        fontWeight: 900,
                        lineHeight: 1.1,
                        mb: 3,
                        animation: `${slideInFromBottom} 0.6s ease-out`,
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
                        mb: 4,
                        maxWidth: 600,
                        lineHeight: 1.6,
                        fontWeight: 400,
                        animation: `${slideInFromBottom} 0.8s ease-out`,
                      }}
                    >
                      The first AI-powered file organizer that's actually
                      private. Clean up years of digital mess in minutes, not
                      hours.
                    </Typography>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={3}
                      sx={{ mb: 4 }}
                    >
                      {user ? (
                        <Zoom in timeout={1000}>
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
                            }}
                          >
                            Go to Dashboard
                          </Button>
                        </Zoom>
                      ) : (
                        <Zoom in timeout={1000}>
                          <Button
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForward />}
                            onClick={handleSignup}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              px: { xs: 4, sm: 6 },
                              py: 2,
                              fontSize: { xs: "1rem", sm: "1.2rem" },
                            }}
                          >
                            Try Free (2 Credits)
                          </Button>
                        </Zoom>
                      )}

                      <Zoom in timeout={1200}>
                        <Button
                          variant="outlined"
                          size="large"
                          startIcon={<PlayArrow />}
                          onClick={() => scrollToSection("how")}
                          sx={{
                            borderWidth: 2,
                            px: { xs: 4, sm: 6 },
                            py: 2,
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        >
                          See How It Works
                        </Button>
                      </Zoom>
                    </Stack>

                    {/* Trust Indicators */}
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {[
                        {
                          icon: <PrivacyTip />,
                          label: "100% Local Processing",
                        },
                        { icon: <Backup />, label: "Full Backup Guaranteed" },
                        {
                          icon: <CheckCircle />,
                          label: "Zero Data Collection",
                        },
                      ].map((item, index) => (
                        <Fade in timeout={1400 + index * 200} key={index}>
                          <Chip
                            icon={item.icon}
                            label={item.label}
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                borderColor: "primary.main",
                                color: "primary.main",
                              },
                            }}
                          />
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Grow in timeout={1200}>
                  <Box sx={{ position: "relative" }}>
                    {/* Main Demo Card */}
                    <Card
                      sx={{
                        p: { xs: 3, sm: 4 },
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        boxShadow: `0 20px 60px ${alpha(
                          theme.palette.primary.main,
                          0.15
                        )}`,
                        animation: `${float} 6s ease-in-out infinite`,
                      }}
                    >
                      <Stack spacing={3}>
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
                              Scanning: ~/Documents/School
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

                        <Grid container spacing={2}>
                          {[
                            {
                              count: 847,
                              label: "PDFs",
                              color: "primary.main",
                            },
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
                              <Zoom in timeout={1600 + index * 200}>
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
                              </Zoom>
                            </Grid>
                          ))}
                        </Grid>

                        <Fade in timeout={2000}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              borderRadius: 2,
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
                              ✨ AI Plan Ready: Organizing into 12 logical
                              folders
                            </Typography>
                          </Box>
                        </Fade>
                      </Stack>
                    </Card>
                  </Box>
                </Grow>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* How It Works */}
        <Box
          id="how"
          sx={{ py: { xs: 8, md: 16 }, bgcolor: "background.paper" }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                How It Actually Works
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.6 }}
              >
                Three simple steps. No cloud uploads, no data mining, no BS.
                Just smart organization that respects your privacy.
              </Typography>
            </Box>

            <Stack spacing={8}>
              {steps.map((step, index) => (
                <Fade in timeout={800 + index * 200} key={index}>
                  <Grid container spacing={6} alignItems="center">
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
                            mb: 2,
                            borderColor: "primary.main",
                            color: "primary.main",
                            fontWeight: 700,
                          }}
                        />
                        <Typography
                          variant="h3"
                          sx={{ mb: 3, fontWeight: 700 }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ mb: 4, lineHeight: 1.7 }}
                        >
                          {step.description}
                        </Typography>
                        <Stack spacing={2}>
                          {step.features.map((feature, i) => (
                            <Slide
                              direction="right"
                              in
                              timeout={1000 + i * 200}
                              key={i}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <CheckCircle fontSize="small" color="success" />
                                <Typography variant="body1">
                                  {feature}
                                </Typography>
                              </Box>
                            </Slide>
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
                      <Zoom in timeout={1200}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: `0 20px 60px ${alpha(
                              theme.palette.common.black,
                              0.1
                            )}`,
                            transition: "transform 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.02)",
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {step.image}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Zoom>
                    </Grid>
                  </Grid>
                </Fade>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* Social Proof */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                Students Love It
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Real feedback from real users (not fake reviews)
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        p: 4,
                        height: "100%",
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: `0 20px 40px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      <Stack spacing={3}>
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
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Features Grid */}
        <Box
          id="features"
          sx={{ py: { xs: 8, md: 16 }, bgcolor: "background.paper" }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                Why Students Choose Neatly
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.6 }}
              >
                Built with privacy, security, and actual usefulness in mind
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Grow in timeout={800 + index * 100}>
                    <Card
                      sx={{
                        p: 4,
                        height: "100%",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
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
                          )}, ${alpha(theme.palette.primary.main, 0.1)})`,
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
                        spacing={3}
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
                              animation: `${pulse} 3s ease-in-out infinite`,
                              animationDelay: `${index * 0.2}s`,
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Chip
                            label={feature.highlight}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            gutterBottom
                          >
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
                  </Grow>
                </Grid>
              ))}
            </Grid>

            {/* Privacy Guarantee Section */}
            <Box sx={{ mt: 12, textAlign: "center" }}>
              <Zoom in timeout={1200}>
                <Paper
                  sx={{
                    p: { xs: 4, sm: 6 },
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.success.main,
                      0.05
                    )}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    border: `2px solid ${alpha(
                      theme.palette.success.main,
                      0.2
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -100,
                      right: -100,
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: alpha(theme.palette.success.main, 0.1),
                      animation: `${float} 4s ease-in-out infinite`,
                    }}
                  />
                  <Security
                    sx={{ fontSize: 64, color: "success.main", mb: 3 }}
                  />
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    Privacy Promise
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 600, mx: "auto", lineHeight: 1.7 }}
                  >
                    Your files never leave your computer. Ever. We only send
                    anonymized metadata to AI - no file contents, no personal
                    info, no tracking. Open source soon.
                  </Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    justifyContent="center"
                  >
                    {[
                      "100% Local Processing",
                      "Zero Data Collection",
                      "Full Source Access",
                    ].map((item, index) => (
                      <Fade in timeout={1400 + index * 200} key={index}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircle color="success" />
                          <Typography fontWeight={600}>{item}</Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Stack>
                </Paper>
              </Zoom>
            </Box>
          </Container>
        </Box>

        {/* Pricing */}
        <Box id="pricing" sx={{ py: { xs: 8, md: 16 } }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                Honest Pricing
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.6 }}
              >
                No hidden fees, no data harvesting revenue model. Just fair
                pricing for a tool that actually works.
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {pricingTiers.map((tier, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        p: 4,
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
                          : "background.paper",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: tier.popular
                            ? "scale(1.08)"
                            : "scale(1.03)",
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
                            animation: `${pulse} 2s ease-in-out infinite`,
                          }}
                        />
                      )}

                      <Stack spacing={3} sx={{ height: "100%" }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            fontWeight={700}
                            gutterBottom
                          >
                            {tier.title}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "baseline",
                              justifyContent: "center",
                              mb: 1,
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
                          <Stack spacing={2}>
                            {tier.features.map((feature, i) => (
                              <Slide
                                direction="left"
                                in
                                timeout={1200 + i * 100}
                                key={i}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <CheckCircle
                                    fontSize="small"
                                    color="success"
                                  />
                                  <Typography variant="body1">
                                    {feature}
                                  </Typography>
                                </Box>
                              </Slide>
                            ))}
                          </Stack>
                        </Box>

                        <Button
                          fullWidth
                          variant={tier.popular ? "contained" : "outlined"}
                          size="large"
                          onClick={() =>
                            handleSubscribe(tier.stripePrice, tier.id)
                          }
                          disabled={paymentLoading === tier.id}
                          sx={{
                            py: 2,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            ...(tier.popular && {
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }),
                          }}
                        >
                          {paymentLoading === tier.id ? (
                            <CircularProgress size={24} />
                          ) : (
                            `Get ${tier.title}`
                          )}
                        </Button>
                      </Stack>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>

            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 6 }}
            >
              All plans include 14-day money-back guarantee. Cancel anytime,
              keep your organized files forever.
            </Typography>
          </Container>
        </Box>

        {/* FAQ */}
        <Box
          id="faq"
          sx={{ py: { xs: 8, md: 16 }, bgcolor: "background.paper" }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                Questions? Answers.
              </Typography>
              <Typography variant="h5" color="text.secondary">
                The honest answers to questions everyone asks
              </Typography>
            </Box>

            <Stack spacing={2}>
              {faqs.map((faq, index) => (
                <Fade in timeout={800 + index * 100} key={index}>
                  <Accordion
                    sx={{
                      "&:before": { display: "none" },
                      boxShadow: "none",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&.Mui-expanded": {
                        boxShadow: `0 8px 32px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                        transform: "scale(1.02)",
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
                </Fade>
              ))}
            </Stack>
          </Container>
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
              animation: `${float} 10s ease-in-out infinite`,
            }}
          />

          <Container maxWidth="md" sx={{ position: "relative" }}>
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 3,
                animation: `${slideInFromBottom} 0.8s ease-out`,
              }}
            >
              Ready to Clean Up Your Life?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.95,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                animation: `${slideInFromBottom} 1s ease-out`,
              }}
            >
              Join thousands of students who've finally gotten their digital
              life together. Start with 2 free credits - no catch, no spam.
            </Typography>

            <Zoom in timeout={1200}>
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
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSignup}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: { xs: 4, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Start Organizing (Free)
                </Button>
              )}
            </Zoom>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 6,
            bgcolor: "background.paper",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={6}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <FolderOpen
                    sx={{ fontSize: 32, mr: 1, color: "primary.main" }}
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
                  The privacy-first AI file organizer built by students, for
                  students. Finally, a tool that actually respects your data.
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

              <Grid item xs={6} md={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Product
                </Typography>
                <Stack spacing={2}>
                  {[
                    {
                      label: "Features",
                      action: () => scrollToSection("features"),
                    },
                    {
                      label: "How It Works",
                      action: () => scrollToSection("how"),
                    },
                    {
                      label: "Pricing",
                      action: () => scrollToSection("pricing"),
                    },
                    {
                      label: "Download",
                      action: user ? onNavigateToDashboard : handleSignup,
                    },
                  ].map((item) => (
                    <Typography
                      key={item.label}
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
                      onClick={item.action}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={6} md={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Company
                </Typography>
                <Stack spacing={2}>
                  {["About", "Blog", "Privacy", "Terms"].map((item) => (
                    <Typography
                      key={item}
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
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Built at Penn State University
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.7 }}
                >
                  Created by CS students who were tired of messy file systems
                  and privacy-invasive "solutions." Local-first, open-source,
                  and actually useful.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <School color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Penn State University CS
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
                Made with ❤️ in NYC
              </Typography>
            </Box>
          </Container>
        </Box>

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
