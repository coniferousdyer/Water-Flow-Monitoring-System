import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import axios from "axios";
import Heading from "../components/Heading";
import CalibrationFactorSetter from "../components/CalibrationFactorSetter";
import StatusTable from "../components/StatusTable";
import DowntimeChart from "../components/DowntimeChart";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import styles from "../styles/pages/Admin.module.css";

export default function Admin({ data }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle password change.
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Handle password visibility change.
  const handleShowPasswordChange = () => {
    setShowPassword(!showPassword);
  };

  // Handle the login form submission.
  const handleLogin = (event) => {
    event.preventDefault();
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login`, {
        email,
        password,
      })
      .then((res) => {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("name", res.data.user.name);
        router.reload();
      })
      .catch((err) => {
        alert(err);
        alert("Login failed.");
      });
  };

  // We implement a simple token-storage-based authentication system for now.
  // This is not secure, but it's good enough for our purposes.
  // TODO: Use a proper authentication system.
  let token;
  if (typeof window !== "undefined") {
    token = sessionStorage.getItem("token");
  }

  // If the user is not logged in, display a login form.
  if (!token) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Admin Dashboard - Water Flow Monitoring</title>
          <meta name="description" content="Monitoring water flow rate" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Heading
          prefixHeading="Water Flow Monitoring"
          mainHeading="Admin Dashboard"
          suffixHeading={process.env.NEXT_PUBLIC_DEPLOYMENT_LOCATION || ""}
        />

        <Paper elevation={5} className={styles["login-form"]}>
          <h1 className={styles["login-heading"]}>
            Login to access the admin dashboard
          </h1>
          <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item className={styles["text-field"]}>
              {/* Email */}
              <TextField
                id="email"
                label="Email"
                variant="outlined"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Grid>
            {/* Password */}
            <Grid item className={styles["text-field"]}>
              <TextField
                id="outlined-basic"
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                fullWidth
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleShowPasswordChange}
                      >
                        {showPassword ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Submit Button */}
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleLogin}>
                Login
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  } else {
    // If the user is logged in, display the admin dashboard.
    return (
      <div className={styles.container}>
        <Head>
          <title>Admin Dashboard - Water Flow Monitoring</title>
          <meta name="description" content="Monitoring water flow rate" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Heading
          prefixHeading={`Welcome, ${sessionStorage.getItem("name")}!`}
          mainHeading="Admin Dashboard"
          suffixHeading={process.env.NEXT_PUBLIC_DEPLOYMENT_LOCATION || ""}
        />

        <CalibrationFactorSetter calibrationFactor={data.calibrationFactor} />

        <StatusTable statusData={data.statusData} />

        <DowntimeChart data={data.wifiInformation} />
      </div>
    );
  }
}

// Fetching update statuses and WiFi information from the Thingspeak API.
export const getServerSideProps = async () => {
  const statusData = await axios.get(
    process.env.THINGSPEAK_API_ADMIN_STATUS_URL
  );
  const wifiData = await axios.get(process.env.THINGSPEAK_API_ADMIN_WIFI_URL);
  const calibrationFactorData = await axios.get(
    process.env.THINGSPEAK_API_ADMIN_CALIBRATION_FACTOR_URL
  );

  // Getting last valid calibration factor.
  let lastValidCF;
  for (let i = 0; i < calibrationFactorData.data.feeds.length; i++)
    if (calibrationFactorData.data.feeds[i].field3 !== null)
      lastValidCF = calibrationFactorData.data.feeds[i].field3;

  // Splitting WiFi information into corresponding arrays.
  const wifiTimes = wifiData.data.feeds.map((datum) => datum.created_at);
  const wifiInformation = wifiData.data.feeds.map((datum) => datum.field6);

  // Splitting status code information into corresponding arrays.
  let oneM2M = [],
    thingSpeak = [],
    statusTimes = [];
  for (let i = statusData.data.feeds.length - 1; i >= 0; i--) {
    if (statusData.data.feeds[i].field4) {
      let oneM2MStatusCodesObtained = statusData.data.feeds[i].field4
        .split(",")
        .reverse();
      let thingSpeakStatusCodesObtained = statusData.data.feeds[i].field5
        .split(",")
        .reverse();

      for (let j = oneM2MStatusCodesObtained.length - 1; j >= 0; j--) {
        if (
          !parseInt(oneM2MStatusCodesObtained[j]) ||
          !parseInt(thingSpeakStatusCodesObtained[j])
        )
          continue;

        oneM2M.push(parseInt(oneM2MStatusCodesObtained[j]));
        thingSpeak.push(parseInt(thingSpeakStatusCodesObtained[j]));
        statusTimes.push(statusData.data.feeds[i].created_at);

        if (oneM2M.length >= 50) break;
      }

      if (oneM2M.length >= 50) break;
    }
  }

  const data = {
    statusData: {
      times: statusTimes,
      oneM2M,
      thingSpeak,
    },
    wifiInformation: {
      times: wifiTimes,
      wifi_information: wifiInformation,
    },
    calibrationFactor: lastValidCF,
  };

  return {
    props: {
      data: data,
    },
  };
};
