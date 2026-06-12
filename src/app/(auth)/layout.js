import "@/app/globals.css";

export const metadata = {
  title: "Pitcho — Authentication",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-full bg-[#f7f9ff] dark:bg-background">
      {children}
    </div>
  );
}
