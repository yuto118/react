import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import DashboardLayout from './ui-components/dashboard/DashboardLayout';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <DashboardLayout />
      </div>
    </ThemeProvider>
  );
}

export default App;