/**
 * The logo symbol for generated images (OG cards, app icons). Satori, which renders those, needs
 * an explicit size and fill on the <svg>, so it cannot reuse <LogoSymbol/> (className +
 * currentColor). The path data is copied verbatim from src/components/brand/Logo.tsx, the D-005
 * master; if the master changes, update both.
 */
const paths = [
  "M60,48.69c-5.23-5.26-13.6-5.47-18.95-.33l-4.5,4.47c-.49.48-1.26.75-1.94.75h-7.02c-.92,0-1.6-.74-1.6-1.64v-3.75c0-.7.53-1.66,1.37-1.66h12.8c.23-.01.57-.21.67-.37.1-.17.08-.59-.1-.78l-9.11-9.16c-.51-.52-.34-1.59.11-2.04l2.79-2.79c.68-.69,1.7-.54,2.34.11l8.79,8.81c.18.18.57.27.77.2.18-.06.42-.41.42-.66v-12.48c0-.9.56-1.75,1.53-1.75h3.97c.88,0,1.54.78,1.54,1.63v12.6c0,.26.22.62.41.68.27.08.62-.03.85-.27l8.85-8.88c.56-.56,1.57-.6,2.12-.05l2.9,2.92c.69.7.37,1.71-.25,2.32l-8.73,8.75c-.19.19-.29.57-.22.75.1.23.43.45.71.45h12.69c.89,0,1.47.9,1.47,1.68v3.74c0,.99-.76,1.65-1.72,1.65h-6.89c-.73-.01-1.52-.31-2.02-.81l-4.07-4.09Z",
  "M48.76,56.69l-9.41,9.44-3.77,3.73-4.97-5,12.72-12.89c3.85-3.9,9.84-4.29,13.69-.21l13.04,13.08-5.02,5.04-13.19-13.23c-.91-.94-2.16-.91-3.1.03",
  "M53.87,74.47h-7.09s.03-3.82.03-3.82c.02-1.87,1.7-3.26,3.45-3.29,1.81-.03,3.56,1.38,3.58,3.29l.03,3.82Z",
];

export function BrandMark({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="24 24 52 52" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </svg>
  );
}
