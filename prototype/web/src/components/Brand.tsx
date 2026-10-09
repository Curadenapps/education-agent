// Canonical logo files from /assets/logos — never redrawn (Brand guide §3).
import logoNegative from '../../../../assets/logos/iTOP_Logo_RGB_Negative.svg';
import logoPositive from '../../../../assets/logos/iTOP_Logo_RGB_Positive.svg';

/** White mark for navy surfaces. */
export function LogoOnDark({ size = 40 }: { size?: number }) {
  return <img src={logoNegative} width={size} height={size} alt="iTOP" className="logo" />;
}

/** Cyan mark on light surfaces, white mark when the theme is dark. */
export function LogoAdaptive({ size = 64 }: { size?: number }) {
  return (
    <span className="logo-adaptive" style={{ width: size, height: size }}>
      <img src={logoPositive} width={size} height={size} alt="iTOP" className="logo logo--light" />
      <img src={logoNegative} width={size} height={size} alt="" aria-hidden className="logo logo--dark" />
    </span>
  );
}

/**
 * Bubble system (Brand guide §7): one large navy anchor bleeding off an edge,
 * one lime feature bubble, one tiny satellite. Flat fills, never behind text.
 */
export function Bubbles() {
  return (
    <div className="bubbles" aria-hidden>
      <span className="bubble bubble--anchor" />
      <span className="bubble bubble--feature" />
      <span className="bubble bubble--satellite" />
    </div>
  );
}
