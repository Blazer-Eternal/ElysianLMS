"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * Two-step inline confirmation for destructive list actions: one click
 * arms the row, the second runs it. Failures surface as toasts from
 * the mutation layer, so this only manages the confirm state.
 */
export function ConfirmAction({
  label,
  confirmLabel = "Delete",
  icon = "trash",
  onConfirm,
  disabled,
}: {
  label: string;
  confirmLabel?: string;
  icon?: IconName;
  onConfirm: () => Promise<unknown>;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Button
          variant="danger"
          size="sm"
          iconStart={icon}
          onClick={() => {
            setConfirming(false);
            void onConfirm().catch(() => undefined);
          }}
        >
          {confirmLabel}
        </Button>
        <Button variant="quiet" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      iconStart={icon}
      disabled={disabled}
      onClick={() => setConfirming(true)}
      title={label}
    >
      {label}
    </Button>
  );
}

/** Icon-only variant for dense row toolbars. */
export function ConfirmIcon({
  label,
  onConfirm,
  icon = "trash",
  disabled,
}: {
  label: string;
  onConfirm: () => Promise<unknown>;
  icon?: IconName;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          variant="danger"
          size="sm"
          iconStart={icon}
          onClick={() => {
            setConfirming(false);
            void onConfirm().catch(() => undefined);
          }}
          title={`Confirm: ${label}`}
        >
          Yes
        </Button>
        <Button variant="quiet" size="sm" onClick={() => setConfirming(false)}>
          No
        </Button>
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={() => setConfirming(true)}
      title={label}
      aria-label={label}
    >
      <Icon name={icon} size={15} />
    </Button>
  );
}
