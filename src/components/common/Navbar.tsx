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
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Handle scroll behavior for compact mode
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollThreshold = 50;
          const directionThreshold = 10; // Reverted back to original

          if (currentScrollY > scrollThreshold) {
            const scrollDirection = currentScrollY - lastScrollY;

            if (scrollDirection > directionThreshold && !isCompact) {
              // Scrolling down with momentum
              setIsCompact(true);
            } else if (scrollDirection < -directionThreshold && isCompact) {
              // Scrolling up with momentum
              setIsCompact(false);
            }
          } else {
            // Near the top
            setIsCompact(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isCompact]);

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
          bgcolor: "transparent",
          backdropFilter: "none",
          borderBottom: "none",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          px: { xs: 2, md: 4 },
          py: 1,
        }}
      >
        <Box
          sx={{
            width: isCompact && !isMobile ? "80%" : "100%",
            maxWidth: isCompact && !isMobile ? "900px" : "100%",
            mx: "auto",
            transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)", // Longer duration, ensure all properties animate
            bgcolor: alpha(theme.palette.background.paper, 0.6), // More transparent
            borderRadius: 6,
            backdropFilter: "blur(25px)", // Stronger blur
            WebkitBackdropFilter: "blur(25px)", // Safari support
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, // More visible border
            boxShadow: `0 8px 32px ${alpha(
              theme.palette.common.black,
              0.12
            )}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`, // Added inset highlight
            overflow: "hidden", // Prevent content from breaking out during animation
            willChange: "width, max-width", // Optimize for width animations
          }}
        >
          <Toolbar
            sx={{
              py: 1.5,
              px: isCompact ? 2 : 3, // Reduce container padding when compact
              minHeight: "56px !important", // Fixed height to prevent growing
              height: "56px", // Explicit height
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "padding 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
          >
            {/* Left Section: Back button and brand */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              {(showBackButton || canGoBack) && (
                <IconButton
                  onClick={handleBackClick}
                  sx={{
                    mr: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(-2px)",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  minWidth: 0, // Allow shrinking
                }}
                onClick={() => onNavigate("landing")}
              >
                {/* <FolderOpen
                  sx={{
                    fontSize: 28,
                    mr: 1,
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                /> */}
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
                  }}
                />

                {/* Brand name with smooth collapse */}
                <Box
                  sx={{
                    overflow: "hidden",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    width: isCompact && !isMobile ? "0px" : "auto",
                    opacity: isCompact && !isMobile ? 0 : 1,
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
                      whiteSpace: "nowrap", // Prevent text wrapping
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
                    transition: "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
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
                            color:
                              activeSection === item.section
                                ? "primary.main"
                                : "text.primary",
                            fontWeight:
                              activeSection === item.section ? 600 : 400,
                            fontSize: "0.95rem", // Keep font size consistent
                            px: isCompact ? 1.5 : 2, // Only reduce padding slightly
                            py: 1,
                            borderRadius: 2,
                            transition:
                              "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                            "&:focus": {
                              outline: "none",
                            },
                            "&:focus-visible": {
                              outline: "none",
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
                            color:
                              currentRoute === item.route
                                ? "primary.main"
                                : "text.primary",
                            fontWeight: currentRoute === item.route ? 600 : 400,
                            fontSize: "0.95rem", // Keep font size consistent
                            px: isCompact ? 1.5 : 2, // Only reduce padding slightly
                            py: 1,
                            borderRadius: 2,
                            transition:
                              "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                            "&:focus": {
                              outline: "none",
                            },
                            "&:focus-visible": {
                              outline: "none",
                            },
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
                        "&:focus": {
                          outline: "none",
                        },
                        "&:focus-visible": {
                          outline: "none",
                        },
                      }}
                    >
                      <AccountCircle />
                    </IconButton>
                  ) : (
                    <>
                      {/* Login button - always visible, just tighter spacing */}
                      <Button
                        onClick={() => onOpenAuth?.("login")}
                        sx={{
                          color: "text.primary",
                          fontSize: "0.95rem", // Keep font size consistent
                          px: isCompact ? 1.5 : 2, // Only reduce padding slightly
                          py: 1,
                          borderRadius: 2,
                          transition:
                            "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          whiteSpace: "nowrap",
                          minWidth: "auto",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          "&:focus": {
                            outline: "none",
                          },
                          "&:focus-visible": {
                            outline: "none",
                          },
                        }}
                      >
                        Login
                      </Button>

                      {/* Sign up button - always visible */}
                      <Button
                        onClick={() => onOpenAuth?.("signup")}
                        variant="contained"
                        sx={{
                          fontSize: "0.95rem", // Keep font size consistent
                          px: isCompact ? 2.5 : 3, // Only reduce padding slightly
                          py: 1,
                          borderRadius: 3,
                          fontWeight: 600,
                          textTransform: "none",
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                          minWidth: "auto",
                          transition:
                            "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
                          "&:hover": {
                            boxShadow: `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                          },
                          "&:focus": {
                            outline: "none",
                          },
                          "&:focus-visible": {
                            outline: "none",
                          },
                        }}
                      >
                        Sign up
                      </Button>
                    </>
                  )}

                  <IconButton
                    onClick={onToggleMode}
                    sx={{
                      ml: isCompact ? 0.5 : 1,
                      transition: "all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      "&:focus": {
                        outline: "none",
                      },
                      "&:focus-visible": {
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
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
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
                      "&:focus": {
                        outline: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                      },
                    }}
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
                    sx={{
                      "&:focus": {
                        outline: "none",
                      },
                      "&:focus-visible": {
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
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
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
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
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
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
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
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
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
