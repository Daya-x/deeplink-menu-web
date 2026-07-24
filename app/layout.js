import "./globals.css";

export const metadata = {
  title: {
    default: "DeepLink Digital Menu",
    template: "%s | DeepLink",
  },
  description:
    "Browse restaurant menus, select dishes, and split the total with DeepLink.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
