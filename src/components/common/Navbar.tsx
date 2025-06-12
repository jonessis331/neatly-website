// src/components/common/Navbar.tsx - Performance Optimized Navigation Component
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Collapse,
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
import neatlyLogo from "../../assets/neatly_icon.png";

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
  const [isCompact, setIsCompact] = useState(false);

  // Use scroll trigger for better performance
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50, // Only start checking after 50px
    target: undefined,
  });

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const scrollThreshold = 80;

    // Simple, fast check for compact mode
    const shouldBeCompact = scrollY > scrollThreshold;

    if (shouldBeCompact !== isCompact) {
      setIsCompact(shouldBeCompact);
    }
  }, [isCompact]);

  // Throttled scroll handler for active section detection
  const handleSectionScroll = useCallback(() => {
    if (currentRoute !== "landing") return;

    const sections = ["home", "how", "features", "pricing", "faq"];
    const scrollPosition = window.scrollY + 100;

    // Use a more efficient approach - break early when found
    let newActiveSection = activeSection;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          newActiveSection = section;
          break;
        }
      }
    }

    if (newActiveSection !== activeSection) {
      setActiveSection(newActiveSection);
    }
  }, [currentRoute, activeSection]);

  // Use RAF-based throttling for scroll events
  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const throttledScrollHandler = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          handleSectionScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScrollHandler, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleScroll, handleSectionScroll]);

  // Memoize static data to prevent re-renders
  const navItems = useMemo(
    () => [
      { label: "How It Works", section: "how" },
      { label: "Features", section: "features" },
      { label: "Pricing", section: "pricing" },
      { label: "FAQ", section: "faq" },
    ],
    []
  );

  const mainNavItems = useMemo(
    () => [
      { label: "Home", route: "landing" as Route },
      { label: "Contact Support", route: "contact-support" as Route },
    ],
    []
  );

  // Optimized scroll to section function
  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (currentRoute !== "landing") {
        onNavigate("landing");
        // Use a shorter delay and more reliable method
        const timeoutId = setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
      setMobileMenuOpen(false);
    },
    [currentRoute, onNavigate]
  );

  const handleAccountMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAccountMenuAnchor(event.currentTarget);
    },
    []
  );

  const handleAccountMenuClose = useCallback(() => {
    setAccountMenuAnchor(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    handleAccountMenuClose();
    onNavigate("landing");
  }, [signOut, onNavigate]);

  const handleBackClick = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else {
      onNavigate("landing");
    }
  }, [onGoBack, onNavigate]);

  const getPageTitle = useCallback(() => {
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
  }, [currentRoute]);

  // Memoize expensive style calculations
  const navbarStyles = useMemo(
    () => ({
      appBar: {
        bgcolor: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", // Slower transition
        px: { xs: 2, md: 4 },
        py: 1,
      },
      container: {
        width: isCompact && !isMobile ? "80%" : "100%",
        maxWidth: isCompact && !isMobile ? "900px" : "100%",
        mx: "auto",
        transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)", // Longer duration
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        borderRadius: 6,
        backdropFilter: "blur(20px)", // Reduced blur for better performance
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: `0 8px 32px ${alpha(
          theme.palette.common.black,
          0.12
        )}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`,
        overflow: "hidden",
        // GPU acceleration
        transform: "translateZ(0)",
        willChange: isCompact ? "width, max-width" : "auto",
      },
      toolbar: {
        py: 1.5,
        px: isCompact ? 2 : 3,
        minHeight: "56px !important",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "padding 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)", // Longer duration
      },
    }),
    [isCompact, isMobile, theme]
  );

  // Memoize button styles to prevent recalculation
  const buttonStyles = useMemo(
    () => ({
      navButton: {
        fontSize: "0.95rem",
        px: isCompact ? 1.5 : 2,
        py: 1,
        borderRadius: 2,
        transition: "all 0.4s ease", // Slower transition
        whiteSpace: "nowrap" as const,
        minWidth: "auto",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
        "&:focus, &:focus-visible": {
          outline: "none",
        },
      },
      authButton: {
        fontSize: "0.95rem",
        px: isCompact ? 2.5 : 3,
        py: 1,
        borderRadius: 3,
        fontWeight: 600,
        textTransform: "none" as const,
        boxShadow: "none",
        whiteSpace: "nowrap" as const,
        minWidth: "auto",
        transition: "all 0.4s ease", // Slower transition
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
        "&:focus, &:focus-visible": {
          outline: "none",
        },
      },
    }),
    [isCompact, theme]
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={navbarStyles.appBar}>
        <Box sx={navbarStyles.container}>
          <Toolbar sx={navbarStyles.toolbar}>
            {/* Left Section: Back button and brand */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              {(showBackButton || canGoBack) && (
                <IconButton
                  onClick={handleBackClick}
                  sx={{
                    mr: 1,
                    transition: "all 0.4s ease", // Slower transition
                    "&:hover": {
                      transform: "translateX(-2px)",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&:focus, &:focus-visible": {
                      outline: "none",
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
                  transition: "all 0.4s ease", // Slower transition
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  minWidth: 0,
                }}
                onClick={() => onNavigate("landing")}
              >
                <Box
                  component="img"
                  src={neatlyLogo}
                  alt="Neatly Logo"
                  sx={{
                    height: 40,
                    width: "auto",
                    filter:
                      mode === "dark"
                        ? "invert(88%) sepia(11%) saturate(4944%) hue-rotate(176deg) brightness(99%) contrast(97%)"
                        : "invert(47%) sepia(27%) saturate(1393%) hue-rotate(175deg) brightness(83%) contrast(89%)",
                    // GPU acceleration
                    transform: "translateZ(0)",
                  }}
                />

                {/* Brand name with optimized collapse animation */}
                <Box
                  sx={{
                    overflow: "hidden",
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", // Slower transition
                    width: isCompact && !isMobile ? "0px" : "auto",
                    opacity: isCompact && !isMobile ? 0 : 1,
                    // GPU acceleration
                    transform: "translateZ(0)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Neatly
                  </Typography>
                </Box>
              </Box>

              {/* Page title for non-landing pages */}
              {currentRoute !== "landing" && !isCompact && (
                <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
                  / {getPageTitle()}
                </Typography>
              )}
            </Box>

            {!isMobile ? (
              <>
                {/* Center Section: Navigation items */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: isCompact ? 0.5 : 1,
                    transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)", // Slower transition
                  }}
                >
                  {/* Landing page navigation */}
                  {currentRoute === "landing" && (
                    <>
                      {navItems.map((item) => (
                        <Button
                          key={item.section}
                          onClick={() => scrollToSection(item.section)}
                          sx={{
                            ...buttonStyles.navButton,
                            color:
                              activeSection === item.section
                                ? "primary.main"
                                : "text.primary",
                            fontWeight:
                              activeSection === item.section ? 600 : 400,
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
                            ...buttonStyles.navButton,
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
                </Box>

                {/* Right Section: Auth buttons and user menu */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: isCompact ? 0.5 : 1,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : user ? (
                    <IconButton
                      onClick={handleAccountMenuOpen}
                      sx={{
                        "&:focus, &:focus-visible": {
                          outline: "none",
                        },
                      }}
                    >
                      <AccountCircle />
                    </IconButton>
                  ) : (
                    <>
                      <Button
                        onClick={() => onOpenAuth?.("login")}
                        sx={{
                          ...buttonStyles.navButton,
                          color: "text.primary",
                        }}
                      >
                        Login
                      </Button>

                      <Button
                        onClick={() => onOpenAuth?.("signup")}
                        variant="contained"
                        sx={buttonStyles.authButton}
                      >
                        Sign up
                      </Button>
                    </>
                  )}

                  <IconButton
                    onClick={onToggleMode}
                    sx={{
                      ml: isCompact ? 0.5 : 1,
                      transition: "all 0.4s ease", // Slower transition
                      "&:focus, &:focus-visible": {
                        outline: "none",
                      },
                    }}
                  >
                    {mode === "light" ? <DarkMode /> : <LightMode />}
                  </IconButton>
                </Box>
              </>
            ) : (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{
                  "&:focus, &:focus-visible": {
                    outline: "none",
                  },
                }}
              >
                {mobileMenuOpen ? <Close /> : <MenuIcon />}
              </IconButton>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Menu */}
      <Slide direction="down" in={mobileMenuOpen && isMobile}>
        <Box
          sx={{
            position: "fixed",
            top: 80,
            left: 16,
            right: 16,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(20px)",
            zIndex: 1200,
            p: 3,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
            // GPU acceleration
            transform: "translateZ(0)",
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
                    sx={{
                      "&:focus, &:focus-visible": {
                        outline: "none",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))
              : mainNavItems.map((item) => (
                  <Button
                    key={item.route}
                    fullWidth
                    onClick={() => {
                      onNavigate(item.route);
                      setMobileMenuOpen(false);
                    }}
                    variant={currentRoute === item.route ? "contained" : "text"}
                    sx={{
                      "&:focus, &:focus-visible": {
                        outline: "none",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

            <Divider sx={{ my: 1 }} />

            {loading ? (
              <CircularProgress sx={{ alignSelf: "center" }} />
            ) : user ? (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                sx={{
                  "&:focus, &:focus-visible": {
                    outline: "none",
                  },
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    onOpenAuth?.("login");
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    "&:focus, &:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    onOpenAuth?.("signup");
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    "&:focus, &:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  Sign up
                </Button>
              </Stack>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <IconButton
                onClick={onToggleMode}
                sx={{
                  "&:focus, &:focus-visible": {
                    outline: "none",
                  },
                }}
              >
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
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            mt: 1,
            // GPU acceleration
            transform: "translateZ(0)",
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
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <Settings sx={{ mr: 2 }} />
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={handleSignOut}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ExitToApp sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
};
