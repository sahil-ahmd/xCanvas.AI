export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="w-full h-auto px-3 lg:px-0">{children}</main>;
}
