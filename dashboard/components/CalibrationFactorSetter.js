import { useState } from "react";
import axios from "axios";
import styles from "../styles/components/CalibrationFactorSetter.module.css";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const CalibrationFactorSetter = ({ calibrationFactor }) => {
  // Calibration factor set by the user.
  const [calibrationFactorInput, setCalibrationFactorInput] =
    useState(calibrationFactor);

  // Handles change in calibration factor input.
  const handleCalibrationFactorChange = (event) => {
    setCalibrationFactorInput(event.target.value);
  };

  // Handles submission of calibration factor.
  const handleCalibrationFactorSubmit = async (event) => {
    event.preventDefault();

    // Update the calibration factor reading on Thingspeak via the backend server.
    axios
      .get(process.env.NEXT_PUBLIC_THINGSPEAK_CALIBRATION_FACTOR_URL, {
        params: {
          api_key: process.env.NEXT_PUBLIC_THINGSPEAK_API_KEY,
          field3: parseFloat(calibrationFactorInput), // Change field number here accordingly.
        },
      })
      .then(() => {
        alert("Calibration factor updated successfully.");
      })
      .catch(() => {
        alert("Error: Calibration factor could not be updated successfully.");
      });

    setCalibrationFactorInput(calibrationFactorInput);
  };

  return (
    <Paper elevation={5}>
      <div className={styles["calibration-factor-setter-container"]}>
        <TextField
          id="calibration-factor-input-field"
          label="Set new calibration factor"
          value={calibrationFactorInput}
          variant="outlined"
          onChange={handleCalibrationFactorChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCalibrationFactorSubmit}
          className={styles["calibration-factor-setter-button"]}
        >
          Set
        </Button>
      </div>
    </Paper>
  );
};

export default CalibrationFactorSetter;
