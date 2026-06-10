// Text with RGB-split glitch layers (pure CSS animation, see global.css).
export default function GlitchText({ text, as: Tag = 'span', className = '' }) {
  return (
    <Tag className={`glitch ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}
