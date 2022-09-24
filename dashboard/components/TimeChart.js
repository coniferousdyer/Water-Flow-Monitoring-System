import styles from "../styles/components/TimeChart.module.css";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { useState } from "react";

const TimeChart = ({ data }) => {
  // Start and end date-times set by the user to filter the graph data.
  const [dateTimes, setDateTimes] = useState({
    startDateTime: null, // We set the start date-time to null to indicate that the user has not set it.
    endDateTime: new Date(),
  });

  // Obtain the average flow rate over the corresponding time period.
  const obtainAverageFlowRate = () => {
    let totalFlowRate = 0.0;
    let size = 0;

    for (let i = data.flow_rates.length - 1; i >= 0; i--) {
      if (
        data.flow_rates[i] !== null &&
        data.times[i] &&
        new Date(data.times[i]) >=
          (dateTimes.startDateTime ? dateTimes.startDateTime : new Date(0)) &&
        new Date(data.times[i]) <= dateTimes.endDateTime
      ) {
        totalFlowRate += parseFloat(data.flow_rates[i]);
        size += 1;
      }
    }

    if (size !== 0) return (totalFlowRate / size).toFixed(2);
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
      text: "Flow Rate Readings",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 3,
    },
    colors: ["#50c878", "transparent"],
    xaxis: {
      type: "datetime",
    },
    yaxis: [
      {
        labels: {
          formatter: function (value) {
            return value.toFixed(2);
          },
        },
        title: {
          text: "Flow Rate (mL/s)",
          rotate: -90,
        },
      },
    ],
    annotations: {
      yaxis: [
        {
          y: obtainAverageFlowRate(),
          borderColor: "#ff0000",
          label: {
            borderColor: "#ffffff",
            style: {
              color: "#ffffff",
              background: "#ff0000",
            },
            text: "Average Flow Rate",
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

  // Filters data according to the selected date-time range.
  const filterData = () => {
    return [
      {
        name: "Flow Rate in mL/s",
        data: data.flow_rates
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
      <div className={styles["time-chart-container"]}>
        <Paper elevation={5} className={styles["paper-container"]}>
          <Chart options={options} series={filterData()} />
          <div className={styles["datetime-input-container"]}>
            {/* Start date-time input */}
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="Start Date-Time"
              value={dateTimes.startDateTime}
              onChange={(datetime) => {
                setDateTimes({ ...dateTimes, startDateTime: datetime });
              }}
            />
            {/* End date-time input */}
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="End Date-Time"
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

export default TimeChart;
