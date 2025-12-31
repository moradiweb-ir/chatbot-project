export default function Loader() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce animation-duration-[0.6s] [animation-delay:-0.2s]"></div>
      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce animation-duration-[0.6s] [animation-delay:-0.1s]"></div>
      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce animation-duration-[0.6s]"></div>
    </div>
  );
}
