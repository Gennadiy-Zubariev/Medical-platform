export default function Layout({ children }) {
  return (
    <main className="app-main">
      <div className="container">
        {children}
      </div>
    </main>
  );
}
