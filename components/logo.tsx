import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="flex-1 flex items-center text-2xl">
      <span className="inline-block font-extrabold text-primary">x</span>
      <span className="font-semibold text-foreground">Canvas.ai</span>
    </Link>
  );
}

export default Logo;
