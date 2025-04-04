import Logo from "./logo";

export default function TextLogo({ text = "2xl", size = 1 }: { text?: string, size?: number }) {
  return (
    <div className="flex justify-center items-center gap-2">
      <Logo size={size} />
      <p className={`text-${text} tracking-tight font-semibold text-neutral-700 select-none`}>
        Airytable
      </p>
    </div>
  );
}
