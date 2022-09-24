import styles from "../styles/components/DowntimeChart.module.css";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { useState } from "react";

const DowntimeChart = ({ data }) => {
  // Start and end dates set by the user to filter the graph data.
  const [dateTimes, setDateTimes] = useState({
    startDateTime: null, // We set the start date to null to indicate that the user has not set it.
    endDateTime: new Date(),
  });

  // Obtain the average downtime over the corresponding time period.
  const obtainAverageDowntime = () => {
    let totalDowntime = 0.0;
    let size = 0;

    for (let i = data.wifi_information.length - 1; i >= 0; i--) {
      if (
        data.wifi_information[i] !== null &&
        data.times[i] &&
        new Date(data.times[i]) >=
          (dateTimes.startDateTime ? dateTimes.startDateTime : new Date(0)) &&
        new Date(data.times[i]) <= dateTimes.endDateTime
      ) {
        totalDowntime += parseFloat(data.wifi_information[i]);
        size += 1;
      }
    }

    if (size !== 0) return totalDowntime / size;
    else return 0.0;
  };

  // Configuration options for the time series.
  const options = {
    chart: {
      type: "line",
      zoom: {
        enabled: true,
      },
    },
    title: {
      text: "Daily Downtime",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 3,
    },
    colors: ["#ff0000", "transparent"],
    xaxis: {
      type: "datetime",
    },
    yaxis: [
      {
        title: {
          text: "Downtime (sec)",
          rotate: -90,
        },
      },
    ],
    annotations: {
      yaxis: [
        {
          y: obtainAverageDowntime(),
          borderColor: "#50c878",
          label: {
            borderColor: "#ffffff",
            style: {
              color: "#ffffff",
              background: "#50c878",
            },
            text: "Average Downtime",
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
          stroke: {
            width: 2,
          },
        },
      },
    ],
  };

  // Filters data according to the selected date range.
  const filterData = () => {
    return [
      {
        name: "Downtime in sec",
        data: data.wifi_information
          .map((value, index) => {
            return {
              x: new Date(data.times[index]).getTime(),
              y: value,
            };
          })
          .filter(
            (datetime) =>
              datetime.x >=
                (dateTimes.startDateTime
                  ? dateTimes.startDateTime
                  : new Date(0)) && datetime.x <= dateTimes.endDateTime
          ),
      },
    ];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className={styles["downtime-chart-container"]}>
        <Paper elevation={5} className={styles["paper-container"]}>
          <Chart options={options} series={filterData()} height={350} />
          <div className={styles["datetime-input-container"]}>
            {/* Start date input */}
            <DatePicker
              renderInput={(props) => <TextField {...props} />}
              label="Start Date"
              value={dateTimes.startDateTime}
              onChange={(datetime) => {
                setDateTimes({ ...dateTimes, startDateTime: datetime });
              }}
            />
            {/* End date input */}
            <DatePicker
              renderInput={(props) => <TextField {...props} />}
              label="End Date"
              value={dateTimes.endDateTime}
              onChange={(datetime) => {
                setDateTimes({ ...dateTimes, endDateTime: datetime });
              }}
            />
          </div>
        </Paper>
      </div>
    </LocalizationProvider>
  );
};

export default DowntimeChart;
