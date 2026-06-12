// src/app/presentation/session/layout.js

export const metadata = {
  title: "Presentation Session - Pitcho",
};

export default function SessionLayout({ children }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
