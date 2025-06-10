// src/components/Dashboard.tsx - Enhanced with animations and fixed navigation
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Chip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ThemeProvider,
  CssBaseline,
  createTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Zoom,
  Slide,
  keyframes,
} from "@mui/material";
import {
  AccountCircle,
  Download,
  CloudDownload,
  Analytics,
  Settings,
  ExitToApp,
  CheckCircle,
  LightMode,
  DarkMode,
  FolderOpen,
  TrendingUp,
  CloudDone,
  Security,
  ArrowBack,
  Dashboard as DashboardIcon,
  CreditCard,
  History,
  AutoAwesome,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { createPortalSession } from "../services/stripe";

type AppView = "landing" | "dashboard";

interface DashboardProps {
  onNavigateToLanding?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentView?: AppView;
}

// Animation keyframes
const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced theme with animations
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
    h4: { fontWeight: 600, fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)" },
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
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  },
});

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToLanding,
  onGoBack,
  canGoBack = false,
}) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDark ? "dark" : "light"
  );
  const { user, profile, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setMode(prefersDark ? "dark" : "light");
  }, [prefersDark]);

  useEffect(() => {
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      setSuccessMessage(
        "Payment successful! Your subscription has been activated."
      );
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleManageSubscription = async () => {
    if (profile?.stripe_customer_id) {
      setIsLoading(true);
      try {
        await createPortalSession(profile.stripe_customer_id);
      } catch (error) {
        console.error("Error opening customer portal:", error);
        setSuccessMessage(
          "Failed to open subscription portal. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
    handleMenuClose();
  };

  const handleDownloadApp = () => {
    setDownloadDialogOpen(true);
  };

  const downloadLinks = {
    mac: "/downloads/neatly-mac.dmg",
    windows: "/downloads/neatly-windows.exe",
  };

  const getSubscriptionStatus = () => {
    if (!profile) return { status: "Free", color: "default" as const };

    switch (profile.subscription_status) {
      case "active":
        return {
          status: profile.subscription_tier || "Active",
          color: "success" as const,
        };
      case "trialing":
        return { status: "Trial", color: "info" as const };
      case "canceled":
        return { status: "Canceled", color: "warning" as const };
      default:
        return { status: "Free", color: "default" as const };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  // Calculate usage percentage
  const usagePercentage = profile?.credits_remaining
    ? Math.max(0, Math.min(100, (profile.credits_remaining / 50) * 100))
    : 0;

  // Handle back navigation properly
  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {successMessage && (
          <Slide direction="down" in={!!successMessage}>
            <Alert
              severity="success"
              sx={{
                position: "fixed",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                boxShadow: 4,
              }}
              onClose={() => setSuccessMessage("")}
            >
              {successMessage}
            </Alert>
          </Slide>
        )}

        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ py: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ flexGrow: 1 }}
              >
                {canGoBack && (
                  <Zoom in>
                    <IconButton
                      onClick={handleBackClick}
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateX(-4px)",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  </Zoom>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }}
                  onClick={() => onNavigateToLanding && onNavigateToLanding()}
                >
                  <FolderOpen
                    sx={{
                      fontSize: 32,
                      mr: 1,
                      color: "primary.main",
                    }}
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
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={() => setMode(mode === "light" ? "dark" : "light")}
                  sx={{
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  {mode === "light" ? <DarkMode /> : <LightMode />}
                </IconButton>

                <IconButton
                  size="large"
                  onClick={handleMenuOpen}
                  color="inherit"
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <AccountCircle />
                </IconButton>
              </Stack>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.common.black,
                      0.12
                    )}`,
                    mt: 1,
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleManageSubscription}>
                  <Settings sx={{ mr: 2 }} />
                  Manage Subscription
                </MenuItem>
                <MenuItem onClick={signOut}>
                  <ExitToApp sx={{ mr: 2 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Welcome Section */}
          <Box sx={{ mb: { xs: 6, md: 8 }, textAlign: "center" }}>
            <Fade in timeout={600}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: `${fadeInUp} 0.8s ease-out`,
                }}
              >
                Welcome back, {profile?.full_name || user?.email?.split("@")[0]}
                !
              </Typography>
            </Fade>
            <Fade in timeout={800}>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  animation: `${fadeInUp} 1s ease-out`,
                  maxWidth: 800,
                  mx: "auto",
                }}
              >
                Ready to organize your digital life? Let's make it happen.
              </Typography>
            </Fade>
          </Box>

          <Grid container spacing={4}>
            {/* Account Overview Card */}
            <Grid item xs={12} lg={4}>
              <Grow in timeout={800}>
                <Card
                  sx={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.05
                    )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: alpha(theme.palette.primary.main, 0.1),
                      animation: `${pulse} 4s ease-in-out infinite`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <AccountCircle
                        sx={{
                          fontSize: 40,
                          color: "primary.main",
                          mr: 2,
                        }}
                      />
                      <Typography variant="h5" fontWeight={600}>
                        Account Overview
                      </Typography>
                    </Box>

                    <Stack spacing={3}>
                      <Fade in timeout={1000}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            Subscription:
                          </Typography>
                          <Chip
                            label={subscriptionStatus.status}
                            color={subscriptionStatus.color}
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              animation: `${slideIn} 0.6s ease-out`,
                            }}
                          />
                        </Box>
                      </Fade>

                      <Fade in timeout={1200}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            Credits Remaining:
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="primary.main"
                            sx={{
                              animation: `${pulse} 2s ease-in-out infinite`,
                            }}
                          >
                            {profile?.credits_remaining || 0}
                          </Typography>
                        </Box>
                      </Fade>

                      <Fade in timeout={1400}>
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Credit Usage
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(usagePercentage)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={usagePercentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                transition: "all 0.8s ease-out",
                              },
                            }}
                          />
                        </Box>
                      </Fade>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} lg={8}>
              <Grow in timeout={1000}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <TrendingUp
                        sx={{
                          fontSize: 40,
                          color: "primary.main",
                          mr: 2,
                        }}
                      />
                      <Typography variant="h5" fontWeight={600}>
                        Quick Actions
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Zoom in timeout={1200}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<Download />}
                            onClick={handleDownloadApp}
                            disabled={isLoading}
                            sx={{
                              py: 2,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              boxShadow: `0 4px 20px ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              "&:hover": {
                                transform: "translateY(-2px) scale(1.02)",
                                boxShadow: `0 8px 30px ${alpha(
                                  theme.palette.primary.main,
                                  0.4
                                )}`,
                              },
                            }}
                          >
                            Download Neatly App
                          </Button>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Zoom in timeout={1400}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<Analytics />}
                            sx={{
                              py: 2,
                              borderWidth: 2,
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              "&:hover": {
                                borderWidth: 2,
                                transform: "translateY(-2px) scale(1.02)",
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                              },
                            }}
                          >
                            View Analytics
                          </Button>
                        </Zoom>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Getting Started
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          {
                            icon: <Download />,
                            text: "Download the desktop app",
                          },
                          {
                            icon: <FolderOpen />,
                            text: "Select a folder to organize",
                          },
                          {
                            icon: <AutoAwesome />,
                            text: "Let AI create the perfect structure",
                          },
                        ].map((step, index) => (
                          <Slide
                            direction="right"
                            in
                            timeout={1600 + index * 200}
                            key={index}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                  color: "primary.main",
                                }}
                              >
                                {step.icon}
                              </Box>
                              <Typography variant="body1">
                                {step.text}
                              </Typography>
                            </Box>
                          </Slide>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Stats Cards */}
            {[
              {
                icon: <FolderOpen />,
                value: 0,
                label: "Files Organized",
                color: theme.palette.primary.main,
              },
              {
                icon: <CloudDone />,
                value: profile?.credits_remaining || 0,
                label: "Credits Available",
                color: theme.palette.success.main,
              },
              {
                icon: <Security />,
                value: "100%",
                label: "Files Protected",
                color: theme.palette.warning.main,
              },
            ].map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Grow in timeout={1200 + index * 200}>
                  <Card
                    sx={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 20px 40px ${alpha(
                          theme.palette.primary.main,
                          0.15
                        )}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(stat.color, 0.1),
                          mb: 2,
                          animation: `${pulse} 3s ease-in-out infinite`,
                          animationDelay: `${index * 0.3}s`,
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: 48, color: stat.color },
                        })}
                      </Box>
                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        {stat.value}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Grow in timeout={1800}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <History
                        sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                      />
                      <Typography variant="h5" fontWeight={600}>
                        Recent Activity
                      </Typography>
                    </Box>
                    <Stack spacing={3}>
                      {[
                        {
                          icon: <CheckCircle color="success" />,
                          title: "Account created successfully",
                          description: `Welcome to Neatly! You have ${
                            profile?.credits_remaining || 2
                          } free credits to get started.`,
                          time: "Just now",
                        },
                        ...(profile?.subscription_status === "active"
                          ? [
                              {
                                icon: <CreditCard color="primary" />,
                                title: "Subscription activated",
                                description: `Your ${profile.subscription_tier} plan is now active with enhanced features.`,
                                time: "Recently",
                              },
                            ]
                          : []),
                      ].map((activity, index) => (
                        <Slide
                          direction="up"
                          in
                          timeout={2000 + index * 200}
                          key={index}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 3,
                              p: 2,
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                              },
                            }}
                          >
                            <Box sx={{ mt: 0.5 }}>
                              {React.cloneElement(activity.icon, {
                                sx: { fontSize: 32 },
                              })}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600}>
                                {activity.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {activity.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {activity.time}
                              </Typography>
                            </Box>
                          </Box>
                        </Slide>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
        </Container>

        {/* Download Dialog */}
        <Dialog
          open={downloadDialogOpen}
          onClose={() => setDownloadDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={600}>
              Download Neatly
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom sx={{ mb: 3 }}>
              Choose your platform to download the Neatly desktop application:
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  platform: "macOS",
                  extension: ".dmg",
                  link: downloadLinks.mac,
                },
                {
                  platform: "Windows",
                  extension: ".exe",
                  link: downloadLinks.windows,
                },
              ].map((download, index) => (
                <Zoom in timeout={400 + index * 200} key={index}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    href={download.link}
                    download
                    fullWidth
                    sx={{
                      py: 1.5,
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: "translateX(8px)",
                      },
                    }}
                  >
                    Download for {download.platform} ({download.extension})
                  </Button>
                </Zoom>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setDownloadDialogOpen(false)}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};
