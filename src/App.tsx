import { BrowserRouter as Router } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AppRoutes from './routes'
import { ScrollToTop } from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </Router>
  )
}

export default App 