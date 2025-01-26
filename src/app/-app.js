// pages/_app.js
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ErrorBoundary>
  );
}

export default MyApp;