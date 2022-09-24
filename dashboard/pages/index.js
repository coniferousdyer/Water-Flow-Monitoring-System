import Head from "next/head";
import axios from "axios";
import FlowRateStatisticsCards from "../components/FlowRateStatisticsCards";
import TimeChart from "../components/TimeChart";
import VolumeBarChart from "../components/VolumeBarChart";
import Heading from "../components/Heading";
import styles from "../styles/pages/Home.module.css";

export default function Home({ data }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Water Flow Monitoring Dashboard</title>
        <meta name="description" content="Monitoring water flow rate" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Heading
        mainHeading="Water Flow Monitoring"
        suffixHeading={process.env.NEXT_PUBLIC_DEPLOYMENT_LOCATION || ""}
      />

      <FlowRateStatisticsCards data={data} />

      <div className="chart-container">
        <TimeChart data={data} />
        <VolumeBarChart data={data} />
      </div>
    </div>
  );
}

// Fetching flow rate data from the Thingspeak API.
export const getServerSideProps = async () => {
  // Function to decrypt the encrypted data on Thingspeak.
  const decryptDatum = (datum) => {
    // The secret keys for the encryption algorithm.
    const cryptbase1 = parseInt(process.env.CRYPTOGRAPHIC_KEY_1);
    const cryptbase2 = parseInt(process.env.CRYPTOGRAPHIC_KEY_2);

    if (datum >= 0.0 && datum <= 5000.0) return datum;
    else return (parseInt(datum) ^ cryptbase2) - cryptbase1;
  };

  const data = await axios.get(process.env.THINGSPEAK_API_DATA_URL);

  // Modifying the data to separate times, flow rate and volume readings.
  const formatData = (data) => {
    const times = data.data.feeds.map((datum) => datum.created_at);
    const flow_rates = data.data.feeds.map((datum) =>
      decryptDatum(datum.field1)
    );
    const volumes = data.data.feeds.map((datum) => decryptDatum(datum.field2));

    return {
      times,
      flow_rates,
      volumes,
    };
  };

  return {
    props: {
      data: formatData(data),
    },
  };
};
