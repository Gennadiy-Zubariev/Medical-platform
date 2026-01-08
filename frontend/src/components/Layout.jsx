export default function Layout({ children }) {
  return (
    <main className="app-main">
      <div className="dashboard-layout">
        {children}
      </div>
    </main>
  );
}
