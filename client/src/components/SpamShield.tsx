import React from "react";

interface SpamShieldProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Invisible Honeypot Anti-Spam Field
 * Automated bots aggressively fill every form input they discover.
 * Humans cannot see or tab into this field.
 * Any submission with a non-empty honeypot value is flagged as spam and rejected.
 */
export function SpamShield({ value, onChange }: SpamShieldProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        opacity: 0,
        position: "absolute",
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <label htmlFor="_hp_security_check">Security verification (do not fill)</label>
      <input
        type="text"
        id="_hp_security_check"
        name="_hp_security_check"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

