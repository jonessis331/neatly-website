// src/components/common/Navbar.tsx - Reusable Navigation Component
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Stack,
  Slide,
  Divider,
  CircularProgress,
  useScrollTrigger,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  FolderOpen,
  LightMode,
  DarkMode,
  AccountCircle,
  Menu as MenuIcon,
  Close,
  ArrowBack,
  ExitToApp,
  Settings,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface NavbarProps {
  mode: "light" | "dark";
  onToggleMode: () => void;
  onNavigate: (route: Route) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentRoute: Route;
  showBackButton?: boolean;
  onOpenAuth?: (type: "login" | "signup") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  onNavigate,
  onGoBack,
  canGoBack = false,
  currentRoute,
  showBackButton = false,
  onOpenAuth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, loading, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("home");

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  // Navigation items for landing page
  const navItems = [
    { label: "How It Works", section: "how" },
    { label: "Features", section: "features" },
    { label: "Pricing", section: "pricing" },
    { label: "FAQ", section: "faq" },
  ];

  // Main navigation items (available on all pages)
  const mainNavItems = [
    { label: "Home", route: "landing" as Route },
    { label: "Contact Support", route: "contact-support" as Route },
  ];

  // Scroll to section (for landing page)
  const scrollToSection = (sectionId: string) => {
    if (currentRoute !== "landing") {
      onNavigate("landing");
      // Delay scrolling until navigation completes
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  // Handle scroll for active section (only on landing page)
  useEffect(() => {
    if (currentRoute !== "landing") return;

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
  }, [currentRoute]);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleAccountMenuClose();
    onNavigate("landing");
  };

  const handleBackClick = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate("landing");
    }
  };

  const getPageTitle = () => {
    switch (currentRoute) {
      case "dashboard":
        return "Dashboard";
      case "contact-support":
        return "Contact Support";
      case "refund-policy":
        return "Refund Policy";
      case "terms-of-service":
        return "Terms of Service";
      case "cancellation-policy":
        return "Cancellation Policy";
      default:
        return "";
    }
  };

  return (
    <>
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
        <Toolbar sx={{ py: 1, px: { xs: 2, md: 3 } }}>
          {/* Back button and brand */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flexGrow: 1 }}
          >
            {(showBackButton || canGoBack) && (
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
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => onNavigate("landing")}
            >
              <FolderOpen sx={{ fontSize: 32, mr: 1, color: "primary.main" }} />
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

            {/* Page title for non-landing pages */}
            {currentRoute !== "landing" && (
              <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
                / {getPageTitle()}
              </Typography>
            )}
          </Stack>

          {!isMobile ? (
            <>
              {/* Landing page navigation */}
              {currentRoute === "landing" && (
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
                </>
              )}

              {/* Main navigation for other pages */}
              {currentRoute !== "landing" && (
                <>
                  {mainNavItems.map((item) => (
                    <Button
                      key={item.route}
                      onClick={() => onNavigate(item.route)}
                      sx={{
                        mx: 1,
                        color:
                          currentRoute === item.route
                            ? "primary.main"
                            : "text.primary",
                        fontWeight: currentRoute === item.route ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </>
              )}

              {/* Auth buttons and user menu */}
              {loading ? (
                <CircularProgress size={24} sx={{ mx: 2 }} />
              ) : user ? (
                <>
                  <IconButton onClick={handleAccountMenuOpen} sx={{ ml: 1 }}>
                    <AccountCircle />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    sx={{ mx: 1 }}
                    onClick={() => onOpenAuth?.("login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => onOpenAuth?.("signup")}
                    sx={{ ml: 1 }}
                  >
                    Get Started
                  </Button>
                </>
              )}

              <IconButton onClick={onToggleMode} sx={{ ml: 2 }}>
                {mode === "light" ? <DarkMode /> : <LightMode />}
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
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
            {/* Landing page mobile nav */}
            {currentRoute === "landing"
              ? navItems.map((item) => (
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
                ))
              : // Other pages mobile nav
                mainNavItems.map((item) => (
                  <Button
                    key={item.route}
                    fullWidth
                    onClick={() => {
                      onNavigate(item.route);
                      setMobileMenuOpen(false);
                    }}
                    variant={currentRoute === item.route ? "contained" : "text"}
                  >
                    {item.label}
                  </Button>
                ))}

            <Divider />

            {loading ? (
              <CircularProgress sx={{ alignSelf: "center" }} />
            ) : user ? (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    onOpenAuth?.("login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    onOpenAuth?.("signup");
                    setMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <IconButton onClick={onToggleMode}>
                {mode === "light" ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Slide>

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            onNavigate("dashboard");
            handleAccountMenuClose();
          }}
        >
          <Settings sx={{ mr: 2 }} />
          Dashboard
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ExitToApp sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};
