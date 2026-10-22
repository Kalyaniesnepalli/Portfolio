
import "./globals.css";

export const metadata = {
  title: "Aryan — Creative Developer",
  description:
    "Design-led product engineering, creative development, and digital experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
