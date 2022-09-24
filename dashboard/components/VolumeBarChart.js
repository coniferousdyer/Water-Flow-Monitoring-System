import styles from "../styles/components/VolumeBarChart.module.css";
import { useState } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

const VolumeBarChart = ({ data }) => {
  // Start and end dates set by the user to filter the graph data.
  const [dates, setDates] = useState({
    startDate: null, // We set the start date to null to indicate that the user has not set it.
    endDate: new Date(),
  });

  // Obtain average volume per day over the current time period.
  const obtainAverageVolume = () => {
    let totalVolume = 0.0;
    let size = 0;

    let currentVolume = 0.0;

    for (let i = 0; i < data.volumes.length; i++) {
      if (
        // Since flow rates were pushed before volumes, some of the volume readings may be null.
        data.volumes[i] === null ||
        !data.times[i] ||
        new Date(data.times[i]) <
          (dates.startDate ? dates.startDate : new Date(0)) ||
        new Date(data.times[i]) > dates.endDate
      )
        continue;

      if (
        i === 0 ||
        new Date(data.times[i]).getDate() ===
          new Date(data.times[i - 1]).getDate()
      )
        currentVolume += parseFloat(data.volumes[i]);
      else {
        totalVolume += currentVolume;
        size += 1;
        currentVolume = parseFloat(data.volumes[i]);
      }
    }

    if (data.times.length !== 0) {
      totalVolume += currentVolume;
      size += 1;
    }

    if (size !== 0) return totalVolume / size;
    else return 0.0;
  };

  // Configuration options for the bar chart.
  const options = {
    chart: {
      type: "bar",
      zoom: {
        enabled: true,
      },
    },
    title: {
      text: "Total Volume per Day",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: [
      {
        labels: {
          formatter: function (value) {
            return (value / 1000.0).toFixed(2);
          },
        },
        title: {
          text: "Volume (L)",
          rotate: -90,
        },
      },
    ],
    annotations: {
      yaxis: [
        {
          y: obtainAverageVolume(),
          borderColor: "#ff0000",
          label: {
            borderColor: "#ffffff",
            style: {
              color: "#ffffff",
              background: "#ff0000",
            },
            text: "Average Volume per Day",
          },
        },
      ],
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
  };

  // Obtain the volume data from the flow rate data.
  const obtainVolume = () => {
    let volumes = [];
    let dateValues = [];

    // Stores the volume for a continuous range of days.
    let currentVolume = 0.0;

    for (let i = 0; i < data.volumes.length; i++) {
      if (
        data.volumes[i] === null ||
        new Date(data.times[i]) <
          (dates.startDate ? dates.startDate : new Date(0)) ||
        new Date(data.times[i]) > dates.endDate
      )
        continue;

      if (
        i === 0 ||
        new Date(data.times[i]).getDate() ===
          new Date(data.times[i - 1]).getDate()
      )
        currentVolume += parseFloat(data.volumes[i]);
      else {
        volumes.push(currentVolume);
        dateValues.push(new Date(data.times[i - 1]).toDateString());
        currentVolume = parseFloat(data.volumes[i]);
      }
    }

    if (data.times.length !== 0) {
      volumes.push(currentVolume);
      dateValues.push(
        new Date(data.times[data.times.length - 1]).toDateString()
      );
    }

    return [
      {
        name: "Volume in L",
        data: volumes.map((value, index) => {
          return {
            x: dateValues[index],
            y: value,
          };
        }),
      },
    ];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className={styles["volume-bar-chart-container"]}>
        <Paper elevation={5} className={styles["paper-container"]}>
          <Chart options={options} series={obtainVolume()} type="bar" />
          <div className={styles["date-input-container"]}>
            {/* Start date input */}
            <DatePicker
              label="Start Date"
              value={dates.startDate}
              onChange={(date) => {
                setDates({ ...dates, startDate: date });
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            {/* End date input */}
            <DatePicker
              label="End Date"
              value={dates.endDate}
              onChange={(date) => {
                setDates({ ...dates, endDate: date });
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </Paper>
      </div>
    </LocalizationProvider>
  );
};

export default VolumeBarChart;
