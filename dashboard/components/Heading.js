import styles from "../styles/components/Heading.module.css";

const Heading = ({ prefixHeading, mainHeading, suffixHeading }) => {
  return (
    <div className={styles["heading_container"]}>
      {prefixHeading && (
        <h1 className={styles["heading_prefix"]} align="center">
          {prefixHeading}
        </h1>
      )}
      <h1 className={styles["heading_name"]} align="center">
        {mainHeading}
      </h1>{" "}
      {suffixHeading && (
        <h3 className={styles["heading_suffix"]} align="center">
          {suffixHeading}
        </h3>
      )}
    </div>
  );
};

export default Heading;
