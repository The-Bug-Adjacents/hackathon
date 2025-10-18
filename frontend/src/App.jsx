import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import { useAuth } from './stores/authStore'


export default function App() {
  const { token, userId } = useAuth();

  return token && userId ? <Layout /> : <AuthPage />;
}