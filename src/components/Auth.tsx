// src/components/Auth.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onClose,
  initialTab = "login",
}) => {
  const [tab, setTab] = useState(initialTab === "login" ? 0 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp } = useAuth();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Successfully logged in!");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(
        signupForm.email,
        signupForm.password,
        signupForm.fullName
      );

      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "Account created! Please check your email to verify your account."
        );
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {tab === 0 ? "Welcome Back" : "Create Account"}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {tab === 0 && (
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              sx={{ mb: 3 }}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box component="form" onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Full Name"
              value={signupForm.fullName}
              onChange={(e) =>
                setSignupForm({ ...signupForm, fullName: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, email: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={signupForm.password}
              onChange={(e) =>
                setSignupForm({ ...signupForm, password: e.target.value })
              }
              sx={{ mb: 2 }}
              required
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({
                  ...signupForm,
                  confirmPassword: e.target.value,
                })
              }
              sx={{ mb: 3 }}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Create Account"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" textAlign="center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
