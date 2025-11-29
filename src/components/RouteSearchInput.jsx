import { useState, useRef } from "react";

function RouteSearchInput({
  label,
  value,
  placeholder,
  onChange,
  onCommit,
  suggestions = [],
  onSuggestionSelect,
  inputRef,              // optional ref from parent (used for "To")
}) {
  const [isActive, setIsActive] = useState(false);

  // Use parent ref if provided
  const localInputRef = useRef(null);
  const actualInputRef = inputRef || localInputRef;

  // Group-level focus: active if focus is anywhere inside this component
  const handleWrapperFocus = () => {
    setIsActive(true);
  };

  const handleWrapperBlur = (event) => {
    const next = event.relatedTarget;
    // If next focus is not inside this wrapper, fully lost focus
    if (!next || !event.currentTarget.contains(next)) {
      setIsActive(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit?.();
      // Treat Enter as "done with this field" -> close dropdown
      if (actualInputRef.current) {
        actualInputRef.current.blur();
      }
    }
  };

  const showDropdown = isActive && suggestions.length > 0;

  return (
    <div
      className="flex items-center gap-1"
      onFocus={handleWrapperFocus}
      onBlur={handleWrapperBlur}
    >
      <span className="uppercase tracking-wide text-[#DEE8D0]">
        {label}
      </span>

      <div className="relative">
        {/* Pill input */}
        <input
          ref={actualInputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-25 rounded-full border border-slate-700
                     bg-slate-900/80 px-3 py-1
                     font-mono text-[11px] text-slate-50
                     outline-none ring-0
                     focus:border-[#DEE8D0] focus:ring-2 focus:ring-[#DEE8D0]/60
                     md:text-xs"
        />

        {/* Dropdown overlay */}
        {showDropdown && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-md border
                       border-slate-700 bg-slate-950/95
                       shadow-lg shadow-black/40 z-1000"
          >
            <ul className="max-h-48 overflow-y-auto text-[11px] md:text-xs">
              {suggestions.map((item) => {
                const key = item.id ?? item.value ?? item.label;
                const labelText = item.label ?? item.name ?? item.id;

                return (
                  <li 
                    key={key}
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer px-3 py-1.5
                               hover:bg-[#DEE8D0]/30
                               focus:bg-[#DEE8D0]/50"
                    // Mouse select
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionSelect?.(item);
                      // Close dropdown after selection
                      if (actualInputRef.current) {
                        actualInputRef.current.blur();
                      }
                    }}
                    // Keyboard select (Enter or Space)
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSuggestionSelect?.(item);
                        if (actualInputRef.current) {
                          actualInputRef.current.blur();
                        }
                      }
                    }}
                  >
                    {labelText}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteSearchInput;
