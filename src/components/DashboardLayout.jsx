import Sidebar from './Sidebar'
import { DashboardBg } from './3d/VRArena'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <DashboardBg />
      <Sidebar />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}
