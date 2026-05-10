import SunSvg from "../../public/sun.svg";
import styles from "./HeroSun.module.css";

export default function HeroSun() {
  return <SunSvg className={styles.sun} aria-hidden="true" />;
}
