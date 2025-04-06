import Logo from "./logo";

export default function TextLogo({ text = "2xl", textColor = 'text-neutral-700', size = 1, name = 'Airytable', monoColor = '' }: { text?: string, textColor?: string, size?: number, name?: string, monoColor? :string }) {
  return (
    <div className="flex justify-center items-center gap-2">
      <Logo size={size} monoColor={monoColor}/>
      <p className={`text-${text} tracking-tight font-semibold ${textColor} select-none`}>
        {name}
      </p>
    </div>
  );
}
