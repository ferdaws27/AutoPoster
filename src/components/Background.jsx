export default function Background() {
  return (
    <div className="fixed inset-0 gradient-bg z-0 overflow-hidden">
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400/10 blur-3xl rounded-full" />
      <div className="absolute bottom-32 right-32 w-80 h-80 bg-violet-400/10 blur-3xl rounded-full" />
    </div>
  );
}
