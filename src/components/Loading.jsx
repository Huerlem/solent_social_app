// components/Loading.tsx
import styles from './Loading.module.css';



export default function Loading({ isLoading = false }) {
  if (!isLoading) return null;


  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
}