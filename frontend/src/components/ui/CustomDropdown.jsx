import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const ACCENT_STYLES = {
  purple: {
    borderOpen: 'border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    borderActive: 'border-purple-500/60 text-purple-300 hover:border-purple-500',
    selectedItem: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    checkIcon: 'text-purple-400',
    chevronOpen: 'text-purple-400',
    iconActive: 'text-purple-400',
    focusRing: 'focus:ring-purple-500/20',
  },
  red: {
    borderOpen: 'border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    borderActive: 'border-red-500/60 text-red-300 hover:border-red-500',
    selectedItem: 'bg-red-500/15 text-red-300 border border-red-500/30',
    checkIcon: 'text-red-400',
    chevronOpen: 'text-red-400',
    iconActive: 'text-red-400',
    focusRing: 'focus:ring-red-500/20',
  },
  emerald: {
    borderOpen: 'border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    borderActive: 'border-emerald-500/60 text-emerald-300 hover:border-emerald-500',
    selectedItem: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    checkIcon: 'text-emerald-400',
    chevronOpen: 'text-emerald-400',
    iconActive: 'text-emerald-400',
    focusRing: 'focus:ring-emerald-500/20',
  },
  amber: {
    borderOpen: 'border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    borderActive: 'border-amber-500/60 text-amber-300 hover:border-amber-500',
    selectedItem: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    checkIcon: 'text-amber-400',
    chevronOpen: 'text-amber-400',
    iconActive: 'text-amber-400',
    focusRing: 'focus:ring-amber-500/20',
  },
  blue: {
    borderOpen: 'border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    borderActive: 'border-blue-500/60 text-blue-300 hover:border-blue-500',
    selectedItem: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    checkIcon: 'text-blue-400',
    chevronOpen: 'text-blue-400',
    iconActive: 'text-blue-400',
    focusRing: 'focus:ring-blue-500/20',
  },
  neutral: {
    borderOpen: 'border-neutral-500 text-white',
    borderActive: 'border-neutral-600 text-white hover:border-neutral-500',
    selectedItem: 'bg-white/10 text-white border border-white/20',
    checkIcon: 'text-neutral-300',
    chevronOpen: 'text-white',
    iconActive: 'text-white',
    focusRing: 'focus:ring-white/10',
  },
};

/**
 * CustomDropdown
 * A clinical, dark-mode custom dropdown menu component supporting
 * single-select, grid layouts (for blood types), icons, badges, and keyboard navigation.
 */
export const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  label,
  sublabel,
  icon: Icon,
  accentColor = 'purple',
  gridCols = 1,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  rounded = 'rounded-xl',
  size = 'md',
  renderValue,
  required = false,
  error = null,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  const theme = ACCENT_STYLES[accentColor] || ACCENT_STYLES.purple;

  // Normalize options into standard format: { value, label, icon?, badge?, disabled? }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value !== undefined ? opt.value : opt.id,
      label: opt.label || opt.name || String(opt.value),
      icon: opt.icon,
      badge: opt.badge,
      sublabel: opt.sublabel,
      disabled: Boolean(opt.disabled),
    };
  });

  const selectedOption = normalizedOptions.find(
    (o) => String(o.value) === String(value)
  );

  const isValueActive =
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== 'ALL';

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal) => {
    if (disabled) return;
    onChange(optVal);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Size styling
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-xs',
    lg: 'px-3.5 py-2.5 text-sm',
  }[size] || 'px-3 py-2 text-xs';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5 select-none">
          <label className="block text-[11px] font-medium text-neutral-400">
            {label}
            {required && <span className={`ml-1 ${theme.iconActive}`}>*</span>}
          </label>
          {sublabel && (
            <span className="text-[10px] text-neutral-500 font-mono">
              {sublabel}
            </span>
          )}
        </div>
      )}

      {/* Hidden input for HTML form validation if required */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={`w-full ${sizeClasses} ${rounded} border flex items-center justify-between font-medium cursor-pointer transition-all duration-200 select-none ${
          disabled
            ? 'bg-neutral-900/40 border-white/5 text-neutral-600 cursor-not-allowed'
            : isOpen
            ? `bg-neutral-900/90 ${theme.borderOpen}`
            : isValueActive
            ? `bg-neutral-900/70 ${theme.borderActive}`
            : 'bg-neutral-900/60 border-white/10 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-neutral-900/80'
        } ${error ? 'border-red-500/80 ring-1 ring-red-500/20' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 pr-2">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isValueActive ? theme.iconActive : 'text-neutral-500'
              }`}
            />
          )}

          {renderValue ? (
            renderValue(selectedOption)
          ) : (
            <span
              className={`truncate ${
                selectedOption
                  ? 'text-white'
                  : 'text-neutral-500 font-normal'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? `rotate-180 ${theme.chevronOpen}` : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            role="listbox"
            tabIndex={-1}
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 top-full mt-1.5 p-1.5 rounded-xl bg-[#0c0c10] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 select-none ${menuClassName}`}
          >
            <div
              className={`max-h-60 overflow-y-auto overscroll-contain ${
                gridCols > 1 ? `grid grid-cols-${gridCols} gap-1` : 'space-y-0.5'
              }`}
              style={
                gridCols > 1
                  ? {
                      display: 'grid',
                      gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                      gap: '4px',
                    }
                  : undefined
              }
            >
              {normalizedOptions.length === 0 ? (
                <div className="py-3 px-3 text-center text-xs text-neutral-500">
                  No options available
                </div>
              ) : (
                normalizedOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  const OptIcon = opt.icon;

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed text-neutral-600'
                          : isSelected
                          ? `${theme.selectedItem} font-semibold`
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        {OptIcon && (
                          <OptIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? theme.checkIcon : 'text-neutral-500'
                            }`}
                          />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 font-mono">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 ${theme.checkIcon}`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-[11px] text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};

export default CustomDropdown;
