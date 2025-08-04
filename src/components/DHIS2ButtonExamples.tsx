import React from 'react';
import { DHIS2Button, DHIS2Badge } from "@/components/ui/dhis2-components";
import { Search, Save, Trash2, Download, Settings, Plus } from "lucide-react";

// DHIS2 Button Examples Component
// Based on: https://developers.dhis2.org/docs/ui/components/button
export const DHIS2ButtonExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">DHIS2 Button Examples</h1>
      
      {/* Basic Button */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Button</h2>
        <p className="text-muted-foreground mb-4">
          Default button that suits the majority of use cases. Don't use for the most important action on the page.
        </p>
        <div className="flex gap-4">
          <DHIS2Button>Basic button</DHIS2Button>
          <DHIS2Button small>Small basic</DHIS2Button>
          <DHIS2Button large>Large basic</DHIS2Button>
        </div>
      </section>

      {/* Primary Button */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Primary Button</h2>
        <p className="text-muted-foreground mb-4">
          Use for the most important action on a page, like "Save data" in a form. Only use one primary button per page.
        </p>
        <div className="flex gap-4">
          <DHIS2Button primary>Primary button</DHIS2Button>
          <DHIS2Button primary small>Small primary</DHIS2Button>
          <DHIS2Button primary large>Large primary</DHIS2Button>
        </div>
      </section>

      {/* Secondary Button */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Secondary Button</h2>
        <p className="text-muted-foreground mb-4">
          Use for less important actions, usually in combination with other buttons. Can be applied to Destructive.
        </p>
        <div className="flex gap-4">
          <DHIS2Button secondary>Secondary button</DHIS2Button>
          <DHIS2Button secondary small>Small secondary</DHIS2Button>
          <DHIS2Button secondary large>Large secondary</DHIS2Button>
        </div>
      </section>

      {/* Destructive Button */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Destructive Button</h2>
        <p className="text-muted-foreground mb-4">
          Only for primary-type actions that will destroy data. Don't use if the action will only remove an item from the current context.
        </p>
        <div className="flex gap-4">
          <DHIS2Button destructive>Destructive button</DHIS2Button>
          <DHIS2Button destructive secondary>Destructive secondary</DHIS2Button>
          <DHIS2Button destructive small>Small destructive</DHIS2Button>
        </div>
      </section>

      {/* Button with Icons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button with Icons</h2>
        <p className="text-muted-foreground mb-4">
          Buttons can have an optional icon alongside the text label or show only an icon.
        </p>
        <div className="flex gap-4">
          <DHIS2Button primary icon={<Save className="w-4 h-4" />}>
            Save Changes
          </DHIS2Button>
          <DHIS2Button secondary icon={<Download className="w-4 h-4" />}>
            Download
          </DHIS2Button>
          <DHIS2Button destructive icon={<Trash2 className="w-4 h-4" />}>
            Delete File
          </DHIS2Button>
          <DHIS2Button icon={<Plus className="w-4 h-4" />} />
        </div>
      </section>

      {/* Loading State */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading State</h2>
        <p className="text-muted-foreground mb-4">
          Use a loading state after a user triggers that button. Change the button label to tell the user what's happening.
        </p>
        <div className="flex gap-4">
          <DHIS2Button primary loading>Loading…</DHIS2Button>
          <DHIS2Button secondary loading>Processing…</DHIS2Button>
          <DHIS2Button destructive loading>Deleting…</DHIS2Button>
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Disabled State</h2>
        <p className="text-muted-foreground mb-4">
          Use a disabled state when the button action can't be triggered.
        </p>
        <div className="flex gap-4">
          <DHIS2Button primary disabled>Enroll in program</DHIS2Button>
          <DHIS2Button secondary disabled>Cancel</DHIS2Button>
          <DHIS2Button destructive disabled>Delete</DHIS2Button>
        </div>
      </section>

      {/* Button Strip Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Strip</h2>
        <p className="text-muted-foreground mb-4">
          Common button combinations following DHIS2 patterns.
        </p>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <DHIS2Button primary>Save</DHIS2Button>
            <DHIS2Button secondary>Cancel</DHIS2Button>
          </div>
          <div className="flex gap-2">
            <DHIS2Button primary>Create</DHIS2Button>
            <DHIS2Button secondary>Reset</DHIS2Button>
            <DHIS2Button destructive>Delete</DHIS2Button>
          </div>
        </div>
      </section>

      {/* Badge Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">DHIS2 Badges</h2>
        <p className="text-muted-foreground mb-4">
          Status badges for different states.
        </p>
        <div className="flex gap-4">
          <DHIS2Badge variant="default">Default</DHIS2Badge>
          <DHIS2Badge variant="success">Active</DHIS2Badge>
          <DHIS2Badge variant="warning">Pending</DHIS2Badge>
          <DHIS2Badge variant="destructive">Error</DHIS2Badge>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="space-y-4 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold">Usage Guidelines</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Basic:</strong> Default button for most use cases</p>
          <p><strong>Primary:</strong> Most important action on a page (only one per page)</p>
          <p><strong>Secondary:</strong> Less important actions, passive alternatives</p>
          <p><strong>Destructive:</strong> Actions that will destroy data</p>
          <p><strong>Icons:</strong> Use to provide more information about the action</p>
          <p><strong>Loading:</strong> Show progress after user triggers action</p>
          <p><strong>Disabled:</strong> When action can't be triggered</p>
        </div>
      </section>
    </div>
  );
};

export default DHIS2ButtonExamples; 