"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/Button";
import { IconInput } from "@/components/auth/IconInput";
import {
  GlobeIcon,
  UserIcon,
  LockIcon,
  TagIcon,
  UsersIcon,
  MessageIcon,
  CodeIcon,
  LinkIcon,
  ShieldIcon,
  ChevronDownIcon,
} from "@/components/Icons";

type Site = {
  id: number;
  name: string;
  slug: string;
  wpUrl: string;
  wpUsername: string;
  niche: string;
  audience: string;
  expertVoice: string;
  authorBioHtml: string;
  ctaHtml: string;
  maxPerDay: number;
  minWordCount: number;
  publishStatus: string;
  active: boolean;
};

export function SiteForm({
  action,
  site,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  site?: Site;
  error?: string;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const isEdit = !!site;

  return (
    <div className="max-w-4xl">
      {/* Page header with icon */}
      <div className="flex items-center gap-4 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-accent-dim border border-accent-border grid place-items-center text-accent shadow-glow">
          <GlobeIcon size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight m-0">
            {isEdit ? "Edit site" : "Add a site"}
          </h1>
          <div className="text-muted text-sm mt-0.5">
            {isEdit
              ? "Update settings or rotate the WP application password."
              : "Connect a WordPress site so SEOForge can publish to it."}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      ) : null}

      <form action={action} className="bg-card-grad border border-border rounded-2xl p-6 shadow-panel">
        {/* Name (required) */}
        <FieldLabel required>Name</FieldLabel>
        <IconInput
          name="name"
          required
          defaultValue={site?.name}
          placeholder="e.g. My Blog, Client Site, Company Website"
          leftIcon={<UserIcon size={18} />}
        />

        {/* Slug (required) */}
        <FieldLabel required hint="Lowercase letters, digits, hyphens only">Slug</FieldLabel>
        <IconInput
          name="slug"
          required
          defaultValue={site?.slug}
          placeholder="e.g. my-blog"
          leftIcon={<LinkIcon size={18} />}
        />

        {/* WP URL + WP Username row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <FieldLabel required>WordPress URL</FieldLabel>
            <IconInput
              name="wpUrl"
              type="url"
              required
              defaultValue={site?.wpUrl}
              placeholder="https://example.com"
              leftIcon={<GlobeIcon size={18} />}
            />
          </div>
          <div>
            <FieldLabel>WP Username</FieldLabel>
            <IconInput
              name="wpUsername"
              required
              defaultValue={site?.wpUsername}
              placeholder="e.g. admin"
              leftIcon={<UserIcon size={18} />}
            />
          </div>
        </div>

        {/* WP App Password (required, password type) */}
        <FieldLabel required hint="WP Admin → Users → Profile → Application Passwords">
          WP Application Password
        </FieldLabel>
        <IconInput
          name="wpAppPassword"
          password
          required={!isEdit}
          placeholder={isEdit ? "Leave blank to keep existing" : "Enter your application password"}
          leftIcon={<LockIcon size={18} />}
        />

        {/* Niche + Audience row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <FieldLabel hint="short phrase">Niche</FieldLabel>
            <IconInput
              name="niche"
              defaultValue={site?.niche}
              placeholder="e.g. Resume writing and career advice"
              leftIcon={<TagIcon size={18} />}
            />
          </div>
          <div>
            <FieldLabel hint="short phrase">Audience</FieldLabel>
            <IconInput
              name="audience"
              defaultValue={site?.audience}
              placeholder="e.g. Mid-career professionals applying to tech jobs"
              leftIcon={<UsersIcon size={18} />}
            />
          </div>
        </div>

        {/* Expert voice */}
        <FieldLabel hint="2–3 sentences in first person — Claude writes as this persona">
          Expert voice
        </FieldLabel>
        <TextareaWithIcon
          name="expertVoice"
          defaultValue={site?.expertVoice}
          icon={<MessageIcon size={18} />}
          placeholder="I've reviewed 500+ resumes as a hiring manager at three SaaS companies. I built ResumeGenius after seeing the same fixable mistakes over and over."
        />

        {/* Author bio HTML */}
        <FieldLabel hint="Appended to the end of every article — improves E-E-A-T signals">
          Author bio HTML
        </FieldLabel>
        <TextareaWithIcon
          name="authorBioHtml"
          defaultValue={site?.authorBioHtml}
          icon={<CodeIcon size={18} />}
          mono
          placeholder='<p><strong>Written by Alex</strong> — founder of ResumeGenius. <a href="https://resumegenius.guru">Try it free</a>.</p>'
        />

        {/* Advanced section */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="mt-5 flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
        >
          <ChevronDownIcon
            size={14}
            className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
          Advanced settings {advancedOpen ? "" : "(cadence, CTA, status)"}
        </button>

        {advancedOpen ? (
          <div className="mt-3 pt-4 border-t border-border space-y-3">
            <div>
              <FieldLabel hint="Injected near the end of every article — drives clicks to your product">
                Call-to-action HTML
              </FieldLabel>
              <TextareaWithIcon
                name="ctaHtml"
                defaultValue={site?.ctaHtml}
                icon={<CodeIcon size={18} />}
                mono
                placeholder='<div class="cta-box"><p><strong>Stuck on your resume?</strong> ResumeGenius rewrites your bullets in minutes. <a href="https://resumegenius.guru">Try it free →</a></p></div>'
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <FieldLabel>Max per day</FieldLabel>
                <input
                  type="number"
                  name="maxPerDay"
                  min={1}
                  max={50}
                  defaultValue={site?.maxPerDay ?? 2}
                />
              </div>
              <div>
                <FieldLabel hint="quality gate">Min word count</FieldLabel>
                <input
                  type="number"
                  name="minWordCount"
                  min={200}
                  max={5000}
                  defaultValue={site?.minWordCount ?? 1000}
                />
              </div>
              <div>
                <FieldLabel hint="Review before or auto-publish">Publish status</FieldLabel>
                <select name="publishStatus" defaultValue={site?.publishStatus ?? "draft"}>
                  <option value="draft">draft (review before going live)</option>
                  <option value="publish">publish (go live immediately)</option>
                </select>
              </div>
            </div>

            {isEdit ? (
              <label className="inline-flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  name="active"
                  value="1"
                  defaultChecked={site!.active}
                  className="!w-auto !p-0 accent-accent"
                />
                Active (can run)
              </label>
            ) : null}
          </div>
        ) : null}

        {/* Security banner */}
        <div className="mt-6 bg-bg-2/60 border border-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-dim text-accent border border-accent-border grid place-items-center shrink-0">
              <ShieldIcon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-text font-semibold text-sm leading-tight">
                We never store your password
              </div>
              <div className="text-muted text-xs mt-0.5">
                Your credentials are encrypted and used only to publish content.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-muted bg-surface border border-border rounded-md px-2.5 py-1 font-semibold">
            <LockIcon size={12} />
            Secure &amp; Encrypted
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6">
          <LinkButton
            href={isEdit ? `/sites/${site!.id}` : "/dashboard"}
            variant="secondary"
          >
            Cancel
          </LinkButton>
          <Button type="submit">
            <LinkIcon size={14} />
            {isEdit ? "Save site" : "Connect Site"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-center gap-1.5 mt-4 mb-2 text-[0.7rem] uppercase tracking-wider font-bold text-text">
      <span>{children}</span>
      {required ? <span className="text-accent">●</span> : null}
      {hint ? (
        <span className="text-muted-2 font-medium normal-case tracking-normal text-xs">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function TextareaWithIcon({
  name,
  defaultValue,
  icon,
  placeholder,
  mono,
}: {
  name: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="relative">
      {icon ? (
        <span className="absolute left-3.5 top-3.5 text-muted">{icon}</span>
      ) : null}
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`!pl-11 !pr-3 !min-h-[5.5rem] ${mono ? "" : "!font-sans"}`}
        style={mono ? {} : { fontFamily: "inherit" }}
      />
    </div>
  );
}
