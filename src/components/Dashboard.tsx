// src/components/Dashboard.tsx - Styled to match homepage
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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { createPortalSession } from "../services/stripe";

// Same theme as homepage
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  },
});

export const Dashboard: React.FC = () => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDark ? "dark" : "light"
  );
  const { user, profile, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

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
      try {
        await createPortalSession(profile.stripe_customer_id);
      } catch (error) {
        console.error("Error opening customer portal:", error);
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
  const usagePercentage = Math.max(
    0,
    Math.min(100, ((profile?.credits_remaining || 0) / 50) * 100)
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Header with same styling as homepage */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ py: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  flexGrow: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Neatly Dashboard
              </Typography>

              <IconButton
                onClick={() => setMode(mode === "light" ? "dark" : "light")}
                sx={{ mr: 1 }}
              >
                {mode === "light" ? <DarkMode /> : <LightMode />}
              </IconButton>

              <IconButton size="large" onClick={handleMenuOpen} color="inherit">
                <AccountCircle />
              </IconButton>
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
                  },
                }}
              >
                <MenuItem onClick={handleManageSubscription}>
                  <Settings sx={{ mr: 1 }} />
                  Manage Subscription
                </MenuItem>
                <MenuItem onClick={signOut}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          {successMessage && (
            <Fade in>
              <Alert
                severity="success"
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: `0 4px 20px ${alpha(
                    theme.palette.success.main,
                    0.15
                  )}`,
                }}
                onClose={() => setSuccessMessage("")}
              >
                {successMessage}
              </Alert>
            </Fade>
          )}

          {/* Welcome Section with same styling as homepage hero */}
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Ready to organize your digital life? Let's make it happen.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Account Overview Card */}
            <Grid xs={12} lg={4}>
              <Grow in timeout={800}>
                <Card
                  sx={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
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
                          }}
                        />
                      </Box>

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
                        >
                          {profile?.credits_remaining || 0}
                        </Typography>
                      </Box>

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
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Quick Actions */}
            <Grid xs={12} lg={8}>
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
                      <Grid xs={12} md={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Download />}
                          onClick={handleDownloadApp}
                          sx={{
                            py: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            boxShadow: `0 4px 20px ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 8px 30px ${alpha(
                                theme.palette.primary.main,
                                0.4
                              )}`,
                            },
                          }}
                        >
                          Download Neatly App
                        </Button>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          startIcon={<Analytics />}
                          sx={{
                            py: 2,
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          View Analytics
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Stats Cards */}
            <Grid xs={12} md={4}>
              <Grow in timeout={1200}>
                <Card>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <FolderOpen
                      sx={{
                        fontSize: 48,
                        color: "primary.main",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      0
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Files Organized
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid xs={12} md={4}>
              <Grow in timeout={1400}>
                <Card>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <CloudDone
                      sx={{
                        fontSize: 48,
                        color: "success.main",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {profile?.credits_remaining || 0}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Credits Available
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid xs={12} md={4}>
              <Grow in timeout={1600}>
                <Card>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Security
                      sx={{
                        fontSize: 48,
                        color: "warning.main",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      100%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Files Protected
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Recent Activity */}
            <Grid xs={12}>
              <Grow in timeout={1800}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Recent Activity
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 3 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            Account created successfully
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Welcome to Neatly! You have{" "}
                            {profile?.credits_remaining || 2} free credits to
                            get started.
                          </Typography>
                        </Box>
                      </Box>
                      {profile?.subscription_status === "active" && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <CheckCircle color="success" sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              Subscription activated
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Your {profile.subscription_tier} plan is now
                              active with enhanced features.
                            </Typography>
                          </Box>
                        </Box>
                      )}
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
              minWidth: 400,
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
              <Button
                variant="outlined"
                startIcon={<CloudDownload />}
                href={downloadLinks.mac}
                download
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: "flex-start",
                  borderRadius: 2,
                }}
              >
                Download for macOS (.dmg)
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownload />}
                href={downloadLinks.windows}
                download
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: "flex-start",
                  borderRadius: 2,
                }}
              >
                Download for Windows (.exe)
              </Button>
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
