import styles from "../styles/components/FlowRateStatisticsCards.module.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const StatisticsCard = ({ title, value, color }) => {
  return (
    <Card
      className={styles["statistics-card-container"]}
      elevation={3}
      style={{
        // A gradient is composed from the given color and supplied as background to the card.
        backgroundImage: `linear-gradient(to right, ${color}, ${color}8a)`,
        color: "#ffffff",
      }}
    >
      <CardContent>
        <h6 className={styles["card-key"]}>{title}</h6>
        <h3 className={styles["card-value"]}>{value}</h3>
      </CardContent>
    </Card>
  );
};

const FlowRateStatisticsCards = ({ data }) => {
  // Obtain the last valid flow rate.
  const obtainLatestFlowRate = () => {
    for (let i = data.flow_rates.length - 1; i >= 0; i--) {
      if (data.flow_rates[i] !== null)
        return parseFloat(data.flow_rates[i]).toFixed(2);
    }

    return "-";
  };

  // Obtain the total volume for the day.
  const obtainTotalVolumeToday = () => {
    let totalVolume = 0.0;

    // Today's date object.
    const today = new Date();

    for (let i = data.volumes.length - 1; i >= 0; i--) {
      if (
        data.times[i] &&
        data.volumes[i] !== null &&
        today.getDate() === new Date(data.times[i]).getDate()
      )
        totalVolume += parseFloat(data.volumes[i]);
      else return (totalVolume / 1000.0).toFixed(2);
    }

    return (totalVolume / 1000.0).toFixed(2);
  };

  // Obtain the average flow rate for the day.
  const obtainAverageFlowRateToday = () => {
    let totalFlowRate = 0.0;
    let size = 0;

    // Today's date object.
    const today = new Date();

    for (let i = data.flow_rates.length - 1; i >= 0; i--) {
      if (
        data.flow_rates[i] !== null &&
        data.times[i] &&
        today.getDate() === new Date(data.times[i]).getDate()
      ) {
        totalFlowRate += parseFloat(data.flow_rates[i]);
        size += 1;
      }
    }

    if (size !== 0) return (totalFlowRate / size).toFixed(2);
    else return 0.0;
  };

  // Obtain average volume per day.
  const obtainAverageVolume = () => {
    let totalVolume = 0.0;
    let size = 0;

    let currentVolume = 0.0;

    for (let i = 0; i < data.volumes.length; i++) {
      if (data.volumes[i] === null) continue;

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

    if (size !== 0) return (totalVolume / (1000.0 * size)).toFixed(2);
    else return 0.0;
  };

  return (
    <div className={styles["flow-rate-statistics-card-container"]}>
      <StatisticsCard
        title="Latest Flow Rate (mL/s)"
        value={obtainLatestFlowRate()}
        color="#dc143c"
      />
      <StatisticsCard
        title="Avg. Flow Rate Today (mL/s)"
        value={obtainAverageFlowRateToday()}
        color="#32cd32"
      />
      <StatisticsCard
        title="Total Volume Today (L)"
        value={obtainTotalVolumeToday()}
        color="#2196f3"
      />
      <StatisticsCard
        title="Avg. Volume per Day (L)"
        value={obtainAverageVolume()}
        color="#f39c12"
      />
    </div>
  );
};

export default FlowRateStatisticsCards;
