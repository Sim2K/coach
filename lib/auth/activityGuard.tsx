"use client";

import * as React from 'react';
import { toast } from 'sonner';
import { isUserActive } from './loginChecks';
import Link from 'next/link';

interface ActivityGuardProps {
  children: React.ReactNode;
  action: 'create' | 'edit';
  type: 'goal' | 'milestone' | 'smart';
}

interface ChildProps {
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  [key: string]: any;
}

export function ActivityGuard({ children, action, type }: ActivityGuardProps) {
  // Function to check if user is active
  const checkIsActive = () => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('userActivityStatus');
    return stored ? stored === 'true' : false;
  };

  const showInactiveToast = () => {
    toast.error('Account Inactive', {
      description: (
        <div>
          Please visit the <Link href="/settings?tab=billing" className="underline text-blue-500">Billing Settings</Link> to renew your subscription to continue. Your data is saved but no changes can be made.
        </div>
      ),
      duration: 5000,
    });
  };

  // Clone the child button and modify its actions
  const child = React.Children.only(children);
  if (React.isValidElement<ChildProps>(child)) {
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        if (!checkIsActive()) {
          showInactiveToast();
        } else if (child.props.onClick) {
          child.props.onClick(e);
        }
      },
      onMouseEnter: (e: React.MouseEvent) => {
        if (!checkIsActive()) {
          showInactiveToast();
        }
        if (child.props.onMouseEnter) {
          child.props.onMouseEnter(e);
        }
      }
    });
  }

  return null;
}

export function withActivityGuard(WrappedComponent: React.ComponentType<any>, action: 'create' | 'edit', type: 'goal' | 'milestone' | 'smart') {
  return function WithActivityGuard(props: any) {
    return (
      <ActivityGuard action={action} type={type}>
        <WrappedComponent {...props} />
      </ActivityGuard>
    );
  };
}
