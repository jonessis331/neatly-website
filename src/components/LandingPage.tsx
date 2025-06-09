// src/components/LandingPage.tsx - Fixed version
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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { AuthDialog } from "./Auth";
import { createCheckoutSession, pricingTiers } from "../services/stripe";

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#1976d2" : "#90caf9",
    },
    secondary: {
      main: mode === "light" ? "#dc004e" : "#f48fb1",
    },
    background: {
      default: mode === "light" ? "#f5f5f5" : "#0a0a0a",
      paper: mode === "light" ? "#ffffff" : "#1a1a1a",
    },
    text: {
      primary: mode === "light" ? "#1a1a1a" : "#f5f5f5",
      secondary: mode === "light" ? "#666" : "#aaa",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: "3.5rem" },
    h2: { fontWeight: 600, fontSize: "2.5rem" },
    h3: { fontWeight: 600, fontSize: "2rem" },
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 500 },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
          "&:focus": {
            outline: "none",
          },
        },
      },
    },
  },
});

const features = [
  {
    icon: <Scanner />,
    title: "Smart Scanning",
    description:
      "AI analyzes your folder structure and identifies organization opportunities",
  },
  {
    icon: <AutoFixHigh />,
    title: "Intelligent Organization",
    description:
      "Uses KonMari principles to create joy-sparking folder structures",
  },
  {
    icon: <Backup />,
    title: "Safe & Reversible",
    description: "Complete backup before any changes with one-click revert",
  },
  {
    icon: <Analytics />,
    title: "Progress Tracking",
    description: "Visualize your organization journey with detailed analytics",
  },
  {
    icon: <CloudDone />,
    title: "Cloud Integration",
    description: "Works with Google Drive, Dropbox, and OneDrive",
  },
  {
    icon: <Support />,
    title: "Expert Support",
    description: "Get help from organization experts when you need it",
  },
];

const faqs = [
  {
    question: "How does Neatly work?",
    answer:
      "Neatly uses advanced AI to scan your folders, understand your files based on content and metadata, then creates an intelligent organization plan. You review the plan before any changes are made.",
  },
  {
    question: "Is it safe for my files?",
    answer:
      "Absolutely! Neatly creates a complete backup before making any changes. You can revert to your original structure with one click at any time.",
  },
  {
    question: "What are credits?",
    answer:
      "1 credit = 500 files organized. Starter gets 10 credits (5,000 files), Professional gets 50 credits (25,000 files), and Enterprise gets unlimited credits.",
  },
  {
    question: "Can I try it before buying?",
    answer:
      "Yes! Every new user gets 2 free credits to organize up to 1,000 files and experience the magic of Neatly.",
  },
  {
    question: "Does it work with cloud storage?",
    answer:
      "Yes! Neatly integrates with Google Drive, Dropbox, OneDrive, and local storage on Windows and macOS.",
  },
];

interface LandingPageProps {
  onNavigateToDashboard: () => void;
}

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

  // Sync with system preference changes
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
      setAlertMessage("Please login or create an account first");
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
    { label: "How it Works", section: "how" },
    { label: "Features", section: "features" },
    { label: "Pricing", section: "pricing" },
    { label: "FAQ", section: "faq" },
  ];

  // Redirect to dashboard if user is logged in and tries to access pricing
  useEffect(() => {
    if (user && window.location.hash === "#pricing") {
      onNavigateToDashboard();
    }
  }, [user, onNavigateToDashboard]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          width: "100%",
        }}
      >
        {/* Alert Messages */}
        {alertMessage && (
          <Alert
            severity={alertSeverity}
            sx={{ mb: 2 }}
            onClose={() => setAlertMessage("")}
          >
            {alertMessage}
          </Alert>
        )}

        {/* Navigation */}
        <AppBar
          position="sticky"
          elevation={trigger ? 4 : 0}
          sx={{
            bgcolor: trigger
              ? alpha(theme.palette.background.paper, 0.95)
              : "transparent",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Toolbar sx={{ py: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                onClick={() => scrollToSection("home")}
              >
                Neatly
              </Typography>

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
                        ml: 1,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                        Login
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSignup}
                        sx={{
                          ml: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      >
                        Sign Up
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
        {isMobile && (
          <Fade in={mobileMenuOpen}>
            <Box
              sx={{
                position: "fixed",
                top: 64,
                left: 0,
                right: 0,
                bgcolor: "background.paper",
                zIndex: 1200,
                p: 2,
                boxShadow: 4,
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
                      Login
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSignup}
                    >
                      Sign Up
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
          </Fade>
        )}

        {/* Hero Section */}
        <Box
          id="home"
          sx={{ pt: { xs: 8, md: 12 }, pb: 8, overflow: "hidden" }}
        >
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Grid container spacing={4} alignItems="center">
              <Grid xs={12} md={6}>
                <Fade in timeout={1000}>
                  <Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                        fontWeight: 800,
                        lineHeight: 1.2,
                        mb: 3,
                      }}
                    >
                      Transform Your
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
                        Digital Chaos
                      </Box>
                      Into Pure Joy
                    </Typography>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      AI-powered file organization that sparks joy using KonMari
                      principles. Clean up thousands of files in minutes.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      {user ? (
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForward />}
                          onClick={onNavigateToDashboard}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            px: 4,
                            py: 1.5,
                          }}
                        >
                          Go to Dashboard
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForward />}
                          onClick={handleSignup}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            px: 4,
                            py: 1.5,
                          }}
                        >
                          Start Free Trial
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => scrollToSection("how")}
                      >
                        See How It Works
                      </Button>
                    </Stack>
                    <Box
                      sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}
                    >
                      <Chip
                        icon={<CheckCircle />}
                        label="No credit card required"
                      />
                      <Chip icon={<CheckCircle />} label="2 free credits" />
                      <Chip icon={<CheckCircle />} label="Cancel anytime" />
                    </Box>
                  </Box>
                </Fade>
              </Grid>
              <Grid xs={12} md={6}>
                <Grow in timeout={1500}>
                  <Box
                    sx={{
                      position: "relative",
                      height: 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                        filter: "blur(60px)",
                      }}
                    />
                    <Card
                      sx={{
                        p: 4,
                        position: "relative",
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <FolderOpen color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Files Organized
                            </Typography>
                            <Typography variant="h4">2,847</Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={75}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label="Documents"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label="Images"
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label="Projects"
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </Card>
                  </Box>
                </Grow>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* How It Works */}
        <Box id="how" sx={{ py: 8, bgcolor: "background.paper" }}>
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Typography variant="h2" textAlign="center" sx={{ mb: 6 }}>
              How Neatly Works
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Connect Your Storage",
                  description:
                    "Link your local folders or cloud storage accounts securely",
                  icon: <CloudDone />,
                },
                {
                  step: "2",
                  title: "AI Scans & Analyzes",
                  description:
                    "Our AI understands your files based on content and context",
                  icon: <Scanner />,
                },
                {
                  step: "3",
                  title: "Review Organization Plan",
                  description:
                    "See exactly how your files will be organized before any changes",
                  icon: <AutoAwesome />,
                },
                {
                  step: "4",
                  title: "One-Click Organization",
                  description:
                    "Execute the plan with full backup and easy revert options",
                  icon: <CheckCircle />,
                },
              ].map((item, index) => (
                <Grid xs={12} sm={6} md={3} key={index}>
                  <Fade in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        height: "100%",
                        p: 3,
                        textAlign: "center",
                        position: "relative",
                        overflow: "visible",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: -20,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {item.step}
                      </Box>
                      <Box sx={{ mt: 3, mb: 2, color: "primary.main" }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Features Grid */}
        <Box id="features" sx={{ py: 8 }}>
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Typography variant="h2" textAlign="center" sx={{ mb: 2 }}>
              Everything You Need
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
            >
              Powerful features designed to bring order to your digital life
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid xs={12} sm={6} md={4} key={index}>
                  <Grow in timeout={1000 + index * 100}>
                    <Card
                      sx={{
                        height: "100%",
                        p: 4,
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: `0 12px 40px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          background: `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                          color: "primary.main",
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Pricing */}
        <Box id="pricing" sx={{ py: 8, bgcolor: "background.paper" }}>
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Typography variant="h2" textAlign="center" sx={{ mb: 2 }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h5"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6 }}
            >
              Start free, upgrade when you need more
            </Typography>
            <Grid container spacing={4} alignItems="stretch">
              {pricingTiers.map((tier, index) => (
                <Grid xs={12} md={4} key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        height: "100%",
                        position: "relative",
                        p: 4,
                        pt: 5,
                        border: tier.popular ? 2 : 1,
                        borderColor: tier.popular ? "primary.main" : "divider",
                        transform: tier.popular ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {tier.popular && (
                        <Chip
                          label="Most Popular"
                          color="primary"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                          }}
                        />
                      )}
                      <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography variant="h5" gutterBottom>
                          {tier.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h3" fontWeight={700}>
                            {tier.price}
                          </Typography>
                          <Typography variant="h6" color="text.secondary">
                            {tier.period}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          {tier.credits}
                        </Typography>
                      </Box>
                      <Stack spacing={2} sx={{ mb: 4 }}>
                        {tier.features.map((feature, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CheckCircle fontSize="small" color="success" />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Button
                        fullWidth
                        variant={tier.popular ? "contained" : "outlined"}
                        size="large"
                        onClick={() =>
                          handleSubscribe(tier.stripePrice, tier.id)
                        }
                        disabled={paymentLoading === tier.id}
                        sx={
                          tier.popular
                            ? {
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              }
                            : {}
                        }
                      >
                        {paymentLoading === tier.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Get Started"
                        )}
                      </Button>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              All plans include 14-day money-back guarantee
            </Typography>
          </Container>
        </Box>

        {/* FAQ */}
        <Box id="faq" sx={{ py: 8 }}>
          <Container maxWidth="md">
            <Typography variant="h2" textAlign="center" sx={{ mb: 6 }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
              <Fade in timeout={1000 + index * 100} key={index}>
                <Accordion
                  sx={{
                    mb: 2,
                    "&:before": { display: "none" },
                    boxShadow: "none",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Fade>
            ))}
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 8,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            textAlign: "center",
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>
              Ready to Transform Your Files?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands who've discovered the joy of organized digital
              spaces
            </Typography>
            {user ? (
              <Button
                variant="contained"
                size="large"
                onClick={onNavigateToDashboard}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "grey.100",
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
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                }}
              >
                Start Your Free Trial
              </Button>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Container maxWidth={false} sx={{ maxWidth: "100%", mx: "auto" }}>
            <Grid container spacing={4}>
              <Grid xs={12} md={4}>
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight={700}
                  alignSelf={"start"}
                >
                  Neatly
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  AI-powered file organization that sparks joy
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small">
                    <GitHub />
                  </IconButton>
                  <IconButton size="small">
                    <Twitter />
                  </IconButton>
                  <IconButton size="small">
                    <LinkedIn />
                  </IconButton>
                </Stack>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                    onClick={() => scrollToSection("features")}
                  >
                    Features
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                    onClick={() => scrollToSection("pricing")}
                  >
                    Pricing
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                    onClick={() => scrollToSection("faq")}
                  >
                    FAQ
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    About
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Blog
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Careers
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Privacy
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Terms
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Security
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Support
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Help Center
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Contact
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: "pointer" }}
                  >
                    Status
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              © 2024 Neatly. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialTab={authDialogTab}
      />
    </ThemeProvider>
  );
};
